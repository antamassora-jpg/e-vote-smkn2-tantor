export type NewsArticle = {
  id: number;
  title: string;
  source: string;
  url: string;
  imageUrl: string;
  imageHint: string;
  snippet: string;
};

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "Pemilihan OSIS Serentak di Sulsel Tingkatkan Partisipasi Demokrasi Siswa",
    source: "Fajar.co.id",
    url: "#",
    imageUrl: "https://picsum.photos/seed/news1/600/400",
    imageHint: "students meeting",
    snippet: "Program pemilihan OSIS serentak yang digagas oleh Dinas Pendidikan Provinsi Sulawesi Selatan berhasil meningkatkan partisipasi siswa dalam berdemokrasi di tingkat sekolah.",
  },
  {
    id: 2,
    title: "Gubernur Sulsel Apresiasi Inovasi Pemilihan OSIS Berbasis Digital",
    source: "Tribun-Timur.com",
    url: "#",
    imageUrl: "https://picsum.photos/seed/news2/600/400",
    imageHint: "official government",
    snippet: "Gubernur Sulawesi Selatan memberikan apresiasi tinggi terhadap pelaksanaan pemilihan OSIS serentak yang memanfaatkan teknologi digital untuk proses yang lebih transparan dan efisien.",
  },
  {
    id: 3,
    title: "SMKN 2 Tana Toraja Sukses Gelar Pemilihan OSIS Serentak",
    source: "Ujungpandang Ekspres",
    url: "#",
    imageUrl: "https://picsum.photos/seed/news3/600/400",
    imageHint: "students voting",
    snippet: "SMKN 2 Tana Toraja menjadi salah satu sekolah yang berhasil menyelenggarakan pemilihan OSIS serentak dengan lancar, diikuti oleh antusiasme tinggi dari seluruh siswa.",
  },
  {
    id: 4,
    title: "Debat Kandidat OSIS di Makassar Jadi Ajang Adu Visi dan Misi",
    source: "Makassar Terkini",
    url: "#",
    imageUrl: "https://picsum.photos/seed/news4/600/400",
    imageHint: "debate stage",
    snippet: "Sesi debat antar kandidat ketua OSIS di salah satu SMA unggulan di Makassar berlangsung sengit, menampilkan visi dan misi yang cemerlang untuk kemajuan sekolah.",
  },
  {
    id: 5,
    title: "Disdik Sulsel: E-Voting Jadikan Pemilihan OSIS Lebih Jujur dan Adil",
    source: "BeritaSatu",
    url: "#",
    imageUrl: "https://picsum.photos/seed/news5/600/400",
    imageHint: "student using phone",
    snippet: "Kepala Dinas Pendidikan Sulsel menyatakan bahwa penerapan sistem e-voting dalam pemilihan OSIS serentak terbukti mampu menekan angka kecurangan dan meningkatkan kejujuran.",
  },
  {
    id: 6,
    title: "Pelajar di Gowa Belajar Demokrasi Langsung Lewat Pemilihan OSIS Serentak",
    source: "Celebes TV",
    url: "#",
    imageUrl: "https://picsum.photos/seed/news6/600/400",
    imageHint: "classroom election",
    snippet: "Para pelajar di Kabupaten Gowa mendapatkan pengalaman berharga mengenai proses demokrasi melalui partisipasi mereka dalam pemilihan ketua OSIS serentak.",
  },
];
