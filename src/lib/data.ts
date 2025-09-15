
'use server';

import {
  collection,
  getDocs,
  doc,
  writeBatch,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  runTransaction,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Candidate, Voter, AdminUser, SystemSettings, AppsScriptResponse, FirestoreTimestamp } from './types';

// --- Collection References ---
const candidatesCol = collection(db, 'candidates');
const votersCol = collection(db, 'voters');
const adminUsersCol = collection(db, 'adminUsers');
const settingsDoc = doc(db, 'settings', 'system');


// Helper to convert Firestore Timestamps to serializable format
const convertTimestamps = (data: any) => {
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }
  if (data !== null && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = convertTimestamps(data[key]);
      return acc;
    }, {} as { [key: string]: any });
  }
  return data;
};

// --- DATA ACCESS FUNCTIONS ---

export async function getCandidates(): Promise<Candidate[]> {
    const snapshot = await getDocs(candidatesCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
}

export async function getVoters(): Promise<Voter[]> {
    const snapshot = await getDocs(votersCol);
    const voters = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        nis: doc.id,
        ...data,
        voteTime: data.voteTime ? (data.voteTime as Timestamp).toDate().toISOString() : null,
      } as Voter;
    });
    return voters;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
    const snapshot = await getDocs(adminUsersCol);
     // Add default admin if it doesn't exist
    if (snapshot.empty) {
        const defaultAdmin = { username: 'admin', password: '12345', name: 'Admin Utama', role: 'Super Admin', status: 'Aktif' };
        await setDoc(doc(adminUsersCol, 'admin'), defaultAdmin);
        return [{...defaultAdmin, username: 'admin'}];
    }
    return snapshot.docs.map(doc => ({ username: doc.id, ...doc.data() } as AdminUser));
}

export async function getSystemSettings(): Promise<SystemSettings> {
    const docSnap = await getDoc(settingsDoc);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            startDate: (data.startDate as Timestamp).toDate(),
            endDate: (data.endDate as Timestamp).toDate(),
            isVotingActive: data.isVotingActive,
        };
    } else {
        // Create default settings if they don't exist
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultSettings: SystemSettings = {
            startDate: new Date(),
            endDate: tomorrow,
            isVotingActive: true,
        };
        await setDoc(settingsDoc, {
             ...defaultSettings,
             startDate: Timestamp.fromDate(defaultSettings.startDate),
             endDate: Timestamp.fromDate(defaultSettings.endDate),
        });
        return defaultSettings;
    }
}

// --- DATA MUTATION FUNCTIONS ---

export async function saveCandidate(candidate: Omit<Candidate, 'id' | 'votes'> & { id?: string; votes?: number }): Promise<AppsScriptResponse> {
    try {
        let docRef;
        if (candidate.id) {
            docRef = doc(db, 'candidates', candidate.id);
            await setDoc(docRef, { 
                name: candidate.name,
                slogan: candidate.slogan,
                platform: candidate.platform,
                imageUrl: candidate.imageUrl,
            }, { merge: true });
        } else {
            docRef = doc(candidatesCol); // Create a new document with a generated ID
            await setDoc(docRef, {
                ...candidate,
                id: docRef.id,
                votes: 0,
            });
        }
        return { status: 'success', message: 'Kandidat berhasil disimpan.' };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function deleteCandidate(candidateId: string): Promise<AppsScriptResponse> {
    try {
        const docRef = doc(db, 'candidates', candidateId);
        await deleteDoc(docRef);
        return { status: 'success', message: 'Kandidat berhasil dihapus.' };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function deleteAllCandidates(): Promise<AppsScriptResponse> {
     try {
        const batch = writeBatch(db);
        const q = query(candidatesCol);
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Reset votes for all voters
        const votersSnapshot = await getDocs(votersCol);
        votersSnapshot.forEach(voterDoc => {
             batch.update(voterDoc.ref, {
                hasVoted: false,
                voteTime: null,
                votedFor: null
            });
        });

        await batch.commit();
        return { status: 'success', message: 'Semua kandidat dan suara terkait telah dihapus.' };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function importCandidates(newCandidates: Omit<Candidate, 'id' | 'votes'>[]): Promise<AppsScriptResponse> {
    try {
        const batch = writeBatch(db);
        let importedCount = 0;

        const existingCandidatesSnapshot = await getDocs(candidatesCol);
        const existingNames = new Set(existingCandidatesSnapshot.docs.map(doc => doc.data().name.toLowerCase()));

        newCandidates.forEach(c => {
            if (!existingNames.has(c.name.toLowerCase())) {
                const docRef = doc(candidatesCol);
                batch.set(docRef, { ...c, votes: 0 });
                importedCount++;
            }
        });

        if (importedCount > 0) {
            await batch.commit();
        }

        const message = importedCount > 0 
            ? `${importedCount} kandidat baru berhasil diimpor. Duplikat dilewati.`
            : 'Tidak ada kandidat baru yang diimpor karena semua sudah ada.';
            
        return { status: 'success', message, data: { importedCount } };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function saveVoter(voter: Voter): Promise<AppsScriptResponse> {
     try {
        const docRef = doc(db, 'voters', voter.nis);
        const existingDoc = await getDoc(docRef);
        const dataToSave = {
            name: voter.name,
            class: voter.class,
            password: voter.password,
            hasVoted: existingDoc.exists() ? existingDoc.data().hasVoted : false,
            voteTime: existingDoc.exists() ? existingDoc.data().voteTime : null,
            votedFor: existingDoc.exists() ? existingDoc.data().votedFor : null,
        };

        await setDoc(docRef, dataToSave, { merge: true });
        return { status: 'success', message: 'Data pemilih berhasil disimpan.' };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function deleteVoter(nis: string): Promise<AppsScriptResponse> {
     try {
        const docRef = doc(db, 'voters', nis);
        await deleteDoc(docRef);
        return { status: 'success', message: `Pemilih dengan NIS ${nis} berhasil dihapus.` };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function deleteAllVoters(): Promise<AppsScriptResponse> {
    try {
        const batch = writeBatch(db);
        const snapshot = await getDocs(votersCol);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return { status: 'success', message: 'Semua pemilih berhasil dihapus.' };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function importVoters(newVoters: Voter[]): Promise<AppsScriptResponse> {
    try {
        const batch = writeBatch(db);
        let importedCount = 0;

        const existingVotersSnapshot = await getDocs(votersCol);
        const existingNis = new Set(existingVotersSnapshot.docs.map(doc => doc.id));

        newVoters.forEach(v => {
            if (!existingNis.has(v.nis)) {
                const docRef = doc(db, 'voters', v.nis);
                batch.set(docRef, {
                    name: v.name,
                    class: v.class,
                    password: v.password || v.nis,
                    hasVoted: false,
                    voteTime: null,
                    votedFor: null
                });
                importedCount++;
            }
        });

        if (importedCount > 0) {
            await batch.commit();
        }
        
        return { status: 'success', message: `${importedCount} pemilih berhasil diimpor.`, data: { importedCount } };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}

export async function submitVote(voterNis: string, candidateId: string): Promise<AppsScriptResponse> {
    try {
        const settings = await getSystemSettings();
        if (!settings.isVotingActive) {
            return { status: 'error', message: 'Sesi pemilihan telah ditutup.' };
        }
        
        const now = new Date();
        if (now < settings.startDate || now > settings.endDate) {
            return { status: 'error', message: 'Pemilihan belum dimulai atau sudah berakhir.' };
        }

        const voterRef = doc(db, 'voters', voterNis);
        const candidateRef = doc(db, 'candidates', candidateId);

        await runTransaction(db, async (transaction) => {
            const voterDoc = await transaction.get(voterRef);
            const candidateDoc = await transaction.get(candidateRef);

            if (!voterDoc.exists()) {
                throw new Error("Pemilih tidak ditemukan.");
            }
            if (voterDoc.data().hasVoted) {
                throw new Error("Anda sudah memberikan suara sebelumnya.");
            }
            if (!candidateDoc.exists()) {
                throw new Error("Kandidat tidak valid.");
            }

            // Update voter status
            transaction.update(voterRef, {
                hasVoted: true,
                votedFor: candidateId,
                voteTime: serverTimestamp()
            });

            // Increment candidate vote count
            transaction.update(candidateRef, {
                votes: (candidateDoc.data().votes || 0) + 1
            });
        });

        return { status: 'success', message: 'Suara berhasil direkam!' };
    } catch (error) {
        const e = error as Error;
        return { status: 'error', message: e.message };
    }
}


export async function updateSystemSettings(settings: { startDate: Date; endDate: Date; isVotingActive: boolean; }): Promise<AppsScriptResponse> {
    try {
        const dataToSave = {
            ...settings,
            startDate: Timestamp.fromDate(settings.startDate),
            endDate: Timestamp.fromDate(settings.endDate),
        };
        await setDoc(settingsDoc, dataToSave);
        return { status: 'success', message: 'Pengaturan sistem berhasil diperbarui.' };
    } catch (e) {
        return { status: 'error', message: (e as Error).message };
    }
}
