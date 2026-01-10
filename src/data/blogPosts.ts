export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    category: string;
    author: {
        name: string;
        avatar: string;
    };
    publishedAt: string;
    readingTime: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'virtual-tour-closing-rate',
        title: '5 Cara Virtual Tour Meningkatkan Closing Rate Properti Anda',
        excerpt: 'Pelajari bagaimana virtual tour 360° dapat membantu Anda menjual properti lebih cepat dan menyaring pembeli yang serius.',
        featuredImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        category: 'Tips & Trik',
        author: {
            name: 'Tim VirtuTour',
            avatar: 'https://ui-avatars.com/api/?name=VT&background=22c55e&color=fff',
        },
        publishedAt: '2024-01-15',
        readingTime: '5 menit',
        content: `
## Pendahuluan

Di era digital ini, cara orang membeli properti telah berubah drastis. Calon pembeli kini melakukan riset online terlebih dahulu sebelum memutuskan untuk survey lokasi. Virtual tour 360° menjadi senjata ampuh bagi agen properti untuk meningkatkan closing rate.

Berikut adalah 5 cara virtual tour dapat membantu Anda menjual properti lebih cepat:

## 1. Menyaring Pembeli yang Serius

Dengan virtual tour, calon pembeli dapat "berkeliling" properti secara virtual sebelum survey fisik. Ini berarti mereka yang akhirnya datang ke lokasi adalah pembeli yang benar-benar tertarik dan serius.

> "Sejak menggunakan virtual tour, 80% prospek yang datang survey langsung melakukan negotiasi. Tidak ada lagi 'window shopper' yang membuang waktu." - Agen Properti Jakarta

## 2. Menghemat Waktu Anda

Bayangkan tidak perlu lagi bolak-balik ke lokasi properti untuk setiap prospek. Virtual tour memungkinkan Anda melakukan "open house" 24/7 tanpa perlu hadir secara fisik.

**Manfaat hemat waktu:**
- Tidak perlu koordinasi jadwal dengan pemilik rumah
- Prospek bisa melihat kapan saja
- Anda bisa fokus pada prospek yang serius

## 3. Meningkatkan Engagement Listing

Listing dengan virtual tour mendapatkan perhatian lebih di platform properti seperti Rumah123, 99.co, dan OLX. Data menunjukkan:

1. **2x lebih banyak views** dibanding listing foto biasa
2. **3x lebih lama** waktu yang dihabiskan di listing
3. **50% lebih banyak** inquiry yang masuk

## 4. Menjangkau Klien Luar Kota

Banyak pembeli potensial berada di kota lain atau bahkan luar negeri. Virtual tour memungkinkan mereka melihat properti tanpa harus terbang ke lokasi terlebih dahulu.

Ini sangat berguna untuk:
- Diaspora Indonesia yang ingin investasi properti
- Pebisnis yang pindah ke kota baru
- Investor properti dari luar daerah

## 5. Memberikan Kesan Profesional

Menggunakan virtual tour menunjukkan bahwa Anda adalah agen properti yang modern dan profesional. Ini membangun kepercayaan klien sejak awal.

## Kesimpulan

Virtual tour bukan lagi kemewahan, tapi kebutuhan untuk agen properti modern. Dengan investasi yang relatif kecil, Anda bisa meningkatkan closing rate secara signifikan dan membangun reputasi sebagai agen yang profesional.
        `.trim(),
    },
    {
        id: '2',
        slug: 'apa-itu-virtual-tour',
        title: 'Apa Itu Virtual Tour 360°? Panduan Lengkap untuk Pemula',
        excerpt: 'Kenali teknologi virtual tour 360° dan bagaimana cara kerjanya untuk marketing properti.',
        featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        category: 'Edukasi',
        author: {
            name: 'Tim VirtuTour',
            avatar: 'https://ui-avatars.com/api/?name=VT&background=22c55e&color=fff',
        },
        publishedAt: '2024-01-10',
        readingTime: '7 menit',
        content: `
## Apa Itu Virtual Tour?

Virtual tour adalah representasi digital dari sebuah lokasi yang memungkinkan pengguna untuk "berjalan-jalan" secara virtual menggunakan foto 360° atau video. Berbeda dengan foto biasa, virtual tour memberikan pengalaman imersif seolah-olah Anda berada di tempat tersebut.

## Bagaimana Virtual Tour Bekerja?

Virtual tour dibuat menggunakan kamera khusus yang dapat mengambil gambar 360° (equirectangular). Gambar-gambar ini kemudian di-stitch dan diolah menjadi pengalaman interaktif.

**Komponen utama virtual tour:**
- **Foto 360°** - Gambar panorama yang mencakup seluruh ruangan
- **Hotspots** - Titik interaktif untuk berpindah ruangan atau menampilkan info
- **Navigation** - Kontrol untuk bergerak dalam virtual tour
- **Floor plan** - Peta untuk orientasi lokasi

## Jenis-Jenis Virtual Tour

### 1. Static 360° Tour
Tour sederhana dengan foto 360° tanpa banyak interaksi. Cocok untuk properti kecil.

### 2. Guided Tour
Tour dengan hotspots dan informasi tambahan. User dipandu melalui properti.

### 3. Interactive Tour
Tour lengkap dengan floor plan, video, dan fitur interaktif lainnya.

## Keuntungan Virtual Tour untuk Properti

1. **Akses 24/7** - Calon pembeli bisa melihat kapan saja
2. **Hemat waktu** - Kurangi survey yang tidak perlu
3. **Jangkauan luas** - Bisa dilihat dari mana saja
4. **Kesan profesional** - Tingkatkan kredibilitas Anda

## Berapa Biaya Membuat Virtual Tour?

Biaya pembuatan virtual tour bervariasi tergantung:
- Luas properti
- Jumlah ruangan
- Fitur tambahan (hotspots, floor plan, dll)
- Provider yang dipilih

Di VirtuTour, kami menawarkan paket mulai dari Rp 750.000 untuk properti standar.

## Kesimpulan

Virtual tour adalah investasi yang worth it untuk marketing properti modern. Dengan teknologi ini, Anda bisa menjangkau lebih banyak pembeli potensial dan meningkatkan closing rate.
        `.trim(),
    },
    {
        id: '3',
        slug: 'case-study-villa-canggu',
        title: 'Case Study: Bagaimana Villa di Canggu Terjual dalam 2 Minggu',
        excerpt: 'Studi kasus nyata bagaimana virtual tour membantu penjualan villa mewah di Bali.',
        featuredImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        category: 'Case Study',
        author: {
            name: 'Tim VirtuTour',
            avatar: 'https://ui-avatars.com/api/?name=VT&background=22c55e&color=fff',
        },
        publishedAt: '2024-01-05',
        readingTime: '4 menit',
        content: `
## Latar Belakang

Sebuah villa mewah di Canggu, Bali dengan harga Rp 8.5 Miliar sudah listing selama 6 bulan tanpa hasil yang signifikan. Pemiliknya, Pak Budi, sudah menggunakan foto-foto profesional tapi tetap kesulitan mendapatkan pembeli serius.

## Tantangan

1. **Lokasi jauh** - Banyak prospek dari Jakarta enggan terbang ke Bali hanya untuk survey
2. **Properti premium** - Membutuhkan cara presentasi yang eksklusif
3. **Foto tidak cukup** - Sulit menampilkan keseluruhan villa yang luas

## Solusi: Virtual Tour Premium

Kami membuatkan virtual tour premium dengan fitur:
- **30+ titik foto 360°** mencakup semua area villa
- **Interactive hotspots** dengan info tentang material dan fasilitas
- **Drone footage** untuk tampilan aerial
- **Floor plan 2D & 3D**
- **Video highlight 1 menit**

## Hasil

> "Dalam 2 minggu setelah virtual tour live, saya mendapat 3 pembeli serius dari Jakarta dan Singapura yang siap negotiasi tanpa perlu survey dulu." - Pak Budi

**Statistik:**
- **200+ views** virtual tour dalam minggu pertama
- **8 inquiry serius** dari prospek luar Bali
- **3 offer** dengan harga mendekati listing
- **SOLD** dalam 2 minggu

## Kunci Keberhasilan

1. **Kualitas tinggi** - Foto 120MP menampilkan detail premium villa
2. **Pengalaman imersif** - Prospek merasa "sudah berkunjung"
3. **Informasi lengkap** - Hotspots menjawab pertanyaan umum
4. **Easy sharing** - Link mudah dibagikan ke prospek potensial

## ROI Investment

| Item | Nilai |
|------|-------|
| Biaya Virtual Tour | Rp 3.500.000 |
| Harga Jual | Rp 8.500.000.000 |
| Komisi 2% | Rp 170.000.000 |
| **ROI** | **4,857x** |

## Kesimpulan

Untuk properti premium, virtual tour bukan biaya tapi investasi. Dengan biaya yang relatif kecil dibanding nilai properti, virtual tour dapat mempercepat penjualan secara signifikan.
        `.trim(),
    },
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
    return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit: number = 3): BlogPost[] => {
    return blogPosts.filter(post => post.slug !== currentSlug).slice(0, limit);
};
