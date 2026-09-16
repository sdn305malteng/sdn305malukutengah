import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    school: "SDN 305 Maluku Tengah",
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Accreditation Advice Endpoint
app.post("/api/ai/accreditation-advice", async (req, res) => {
  try {
    const { componentName, items, schoolContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback expert analysis if API key is not yet set up
      return res.json({
        analysis: `### Telaah Kesiapan Standar: ${componentName || "Akreditasi IASP SD"}
Berdasarkan data butir bukti fisik SDN 305 Maluku Tengah:
1. **Kelengkapan Dokumen**: Dari berkas yang dicatat, pastikan seluruh dokumen memuat tanda tangan Kepala Sekolah, stempel basah/digital, dan SK Tim Pelaksana.
2. **Kesesuaian IASP 2020**: Asesor BAN-S/M akan mengutamakan triangulasi data (Dokumen Portofolio, Observasi Lingkungan/Kelas, dan Wawancara Guru/Komite).
3. **Fokus Perbaikan Cepat**: Siapkan berkas portofolio dalam map warna berbeda sesuai 4 komponen (Mutu Lulusan, Proses Pembelajaran, Mutu Guru, Manajemen Sekolah) agar mudah ditunjukkan saat visitasi.
4. **Catatan Khusus Wilayah Maluku Tengah**: Pastikan kearifan lokal (P5 bertema kearifan lokal Maluku, lingkungan maritim/pesisir) tercantum pada dokumen Kurikulum Operasional Satuan Pendidikan (KOSP).`,
        recommendations: [
          "Lengkapi SK Penetapan dan Notula Rapat penyusunan KOSP bersama Komite Sekolah.",
          "Siapkan jurnal refleksi guru dan bukti tindak lanjut supervisi akademik.",
          "Dokumentasikan kegiatan pembiasaan karakter (doa bersama, senam, literasi 15 menit) dengan foto bertanggal.",
        ],
        scoreEstimate: "88 - 92 (Kategori A / Unggul dengan kelengkapan bukti fisik)",
      });
    }

    const prompt = `Anda adalah seorang Asesor Senior Akreditasi Sekolah Dasar BAN-S/M (Badan Akreditasi Nasional Sekolah/Madrasah) yang berpengalaman mendampingi sekolah jenjang SD di Indonesia, khususnya di Kabupaten Maluku Tengah, Provinsi Maluku.

Konteks Sekolah:
Nama: SDN 305 Maluku Tengah
Kurikulum: Kurikulum Merdeka & K13
Komponen yang dinilai: ${componentName || "Umum IASP SD"}
Data Dokumen & Status:
${JSON.stringify(items || [], null, 2)}
Konteks Tambahan: ${schoolContext || "Persiapan visitasi akreditasi sekolah"}

Tugas Anda:
1. Berikan telaah mendalam terhadap kesiapan dokumen bukti fisik yang sudah ada maupun yang masih kurang.
2. Tunjukkan apa saja aspek penting yang akan diverifikasi Asesor BAN-S/M saat visitasi (dokumen, observasi kelas, dan wawancara).
3. Berikan rekomendasi langkah konkret prioritas tinggi (Quick Wins) yang harus diselesaikan sekolah dalam 1-2 minggu ke depan.
4. Berikan estimasi kategori kesiapan (A - Unggul, B - Baik, atau C - Cukup) beserta argumentasi teknis BAN-S/M.

Format jawaban dengan bahasa Indonesia formal, profesional, edukatif, dan menyemangati tim akreditasi SDN 305 Maluku Tengah. Gunakan markdown dengan heading dan poin-poin yang jelas.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({
      analysis: response.text,
      success: true,
    });
  } catch (error: any) {
    console.error("Gemini advice error:", error);
    res.status(500).json({
      error: error?.message || "Gagal mendapatkan telaah AI",
    });
  }
});

// AI Document & Instrument Draft Generator
app.post("/api/ai/generate-instrument-draft", async (req, res) => {
  try {
    const { docType, title, component, details } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        draft: `PEMERINTAH KABUPATEN MALUKU TENGAH
DINAS PENDIDIKAN DAN KEBUDAYAAN
SD NEGERI 305 MALUKU TENGAH
Alamat: Jl. Nuri Kab. Maluku Tengah, Maluku

SURAT KEPUTUSAN KEPALA SD NEGERI 305 MALUKU TENGAH
Nomor: 421.2/045/SDN.305/2026

TENTANG:
${title || "PEMBENTUKAN TIM PENJAMINAN MUTU DAN PERSIAPAN AKREDITASI SEKOLAH"}

Menimbang:
a. Bahwa dalam rangka meningkatkan mutu pendidikan dan akuntabilitas kinerja sekolah;
b. Bahwa untuk menghadapi visitasi akreditasi oleh BAN-S/M, dipandang perlu membentuk Tim Khusus Akreditasi;

Mengingat:
1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Permendikbudristek terkait Standar Nasional Pendidikan dan Pedoman Akreditasi IASP;

MEMUTUSKAN:
Menetapkan:
Pertama: Membentuk Tim Persiapan Akreditasi SDN 305 Maluku Tengah tahun ajaran 2025/2026.
Kedua: Tim bertugas menghimpun, memverifikasi, dan menyusun bukti fisik sesuai 4 Komponen IASP (Mutu Lulusan, Proses Pembelajaran, Mutu Guru, dan Manajemen Sekolah).
Ketiga: Keputusan ini berlaku sejak tanggal ditetapkan.

Ditetapkan di: Maluku Tengah
Pada tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
Kepala SDN 305 Maluku Tengah

(...........................................)
NIP. ......................................`,
      });
    }

    const prompt = `Anda adalah konsultan administrasi sekolah dasar dan akreditasi BAN-S/M di Indonesia.
Buatkan draf resmi dokumen sekolah untuk:
Jenis Dokumen: ${docType} (misal: Surat Keputusan / SK, SOP, Notula Rapat, Rencana Kerja / Program, Instrumen Supervisi, atau Panduan)
Judul: ${title}
Terkait Komponen IASP: ${component}
Detail Kebutuhan: ${details || "Dokumen resmi pendukung bukti fisik akreditasi BAN-S/M"}
Identitas Sekolah: SD NEGERI 305 MALUKU TENGAH, Dinas Pendidikan dan Kebudayaan Kabupaten Maluku Tengah, Provinsi Maluku.

Ketentuan penulisan:
- Format standar naskah dinas pendidikan Indonesia (Kop, Konsideran Menimbang/Mengingat jika SK, Diktum Memutuskan, Susunan Lampiran jika perlu, tanggal dan tanda tangan Kepala Sekolah).
- Kalimat lugas, baku, komprehensif, dan langsung dapat disalin/dicetak oleh admin sekolah.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({
      draft: response.text,
      success: true,
    });
  } catch (error: any) {
    console.error("Gemini draft error:", error);
    res.status(500).json({
      error: error?.message || "Gagal membuat draf dokumen",
    });
  }
});

// AI Asesor Interview Simulator
app.post("/api/ai/simulate-interview", async (req, res) => {
  try {
    const { targetRole, component, focusArea } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        qaList: [
          {
            question: "Bagaimana Kepala Sekolah dan Guru menyusun serta mengevaluasi Kurikulum Operasional Sekolah (KOSP) yang melibatkan komite dan orang tua?",
            idealAnswer: "Kami menyusun KOSP setiap awal tahun ajaran melalui workshop tim pengembang kurikulum yang melibatkan Kepala Sekolah, seluruh dewan guru, pengawas pembina, komite sekolah, dan perwakilan orang tua. Kami menunjukkan bukti fisik berupa SK Tim, daftar hadir, notula berita acara rapat, serta dokumen KOSP yang telah disahkan Dinas Pendidikan Maluku Tengah.",
            evidenceTip: "Tunjukkan Map Dokumen Standar Manajemen: SK TPK, Notula, Berita Acara, Foto Dokumentasi Rapat.",
          },
          {
            question: "Bagaimana guru menerapkan pembelajaran berdiferensiasi dan pemanfaatan media digital di ruang kelas SDN 305?",
            idealAnswer: "Guru mengidentifikasi kesiapan dan gaya belajar peserta didik di awal bab, kemudian merancang modul ajar dengan variasi konten dan produk. Guru juga memanfaatkan perangkat Chromebook/laptop serta proyektor sekolah untuk memutar video pembelajaran interaktif.",
            evidenceTip: "Tunjukkan Modul Ajar berdiferensiasi, lembar kerja siswa (LKPD), dan foto kegiatan siswa berdiskusi aktif.",
          },
          {
            question: "Bagaimana sekolah membudayakan kedisiplinan dan nilai religius/karakter siswa setiap hari?",
            idealAnswer: "Setiap pagi kami menerapkan 5S (Senyum, Sapa, Salam, Sopan, Santun), doa bersama sebelum dan sesudah belajar, pembiasaan menyanyikan lagu Indonesia Raya, serta program jumat bersih dan literasi 15 menit sebelum jam pertama.",
            evidenceTip: "Tunjukkan SOP Pembiasaan, Tata Tertib Sekolah, Buku Catatan Pelanggaran/Prestasi Siswa, dan Jadwal Kegiatan Ekstrakurikuler.",
          },
        ],
      });
    }

    const prompt = `Anda adalah Asesor BAN-S/M yang sedang melakukan wawancara visitasi akreditasi di SD NEGERI 305 MALUKU TENGAH.
Peran yang diwawancarai: ${targetRole || "Kepala Sekolah & Guru"}
Komponen Akreditasi: ${component || "Seluruh Komponen IASP"}
Fokus Pembahasan: ${focusArea || "Kesiapan implementasi kurikulum, mutu pembelajaran, disiplin, dan manajemen sekolah"}

Berikan 4 (empat) pertanyaan krusial yang paling sering ditanyakan asesor beserta:
1. Pertanyaan Asesor (kritis, menggali bukti otentik)
2. Jawaban Ideal dan Elegan yang sebaiknya dijawab oleh pihak sekolah
3. Bukti Fisik Pendukung (dokumen/foto/portofolio) yang harus langsung ditunjukkan ke meja asesor saat menjawab

Format output WAJIB JSON murni dengan struktur:
{
  "qaList": [
    {
      "question": "string pertanyaan",
      "idealAnswer": "string jawaban",
      "evidenceTip": "string bukti fisik yang harus ditunjukkan"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini interview simulation error:", error);
    res.status(500).json({
      error: error?.message || "Gagal menghasilkan simulasi wawancara",
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SDN 305 Maluku Tengah server running on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
});
