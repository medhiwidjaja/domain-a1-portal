import { defineStore } from 'pinia';

export interface VfcDocument {
  id: string;
  companyId: string;
  category: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  sha256: string;
  url: string;
}

export interface VfcCustomCategory {
  key: string;
  label: string;
  icon: string;
  createdAt?: string;
}

export const useVfcStore = defineStore('vfcStore', {
  state: () => ({
    customCategories: [
      {
        key: 'CUSTOM_TEKNIS',
        label: 'Spesifikasi & Mesin',
        icon: '⚙️'
      },
      {
        key: 'CUSTOM_KEUANGAN',
        label: 'Laporan Keuangan & Modal',
        icon: '💰'
      }
    ] as VfcCustomCategory[],

    documents: [
      {
        id: 'VFC-DOC-001',
        companyId: 'COMP-001',
        category: 'PERUSAHAAN',
        title: 'Akta Pendirian PT Nusantara Pratama',
        fileName: 'akta_pendirian_nusantara_2024.pdf',
        fileSize: '2.4 MB',
        uploadedAt: '2026-01-15 10:30',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        url: '#'
      },
      {
        id: 'VFC-DOC-002',
        companyId: 'COMP-001',
        category: 'PERUSAHAAN',
        title: 'NPWP Perusahaan (DJP Verified)',
        fileName: 'npwp_pt_nusantara.pdf',
        fileSize: '840 KB',
        uploadedAt: '2026-01-15 10:35',
        sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        url: '#'
      },
      {
        id: 'VFC-DOC-003',
        companyId: 'COMP-001',
        category: 'LOKASI',
        title: 'Sertifikat Hak Guna Bangunan (HGB) Sentul Area',
        fileName: 'sertifikat_hgb_sentul.pdf',
        fileSize: '4.1 MB',
        uploadedAt: '2026-02-01 14:20',
        sha256: 'f876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        url: '#'
      },
      {
        id: 'VFC-DOC-004',
        companyId: 'COMP-001',
        category: 'LOKASI',
        title: 'Peta Poligon GIS Koordinat Usaha (GeoJSON)',
        fileName: 'poligon_lokasi_usaha_sentul.json',
        fileSize: '120 KB',
        uploadedAt: '2026-02-01 14:25',
        sha256: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        url: '#'
      },
      {
        id: 'VFC-DOC-005',
        companyId: 'COMP-001',
        category: 'LINGKUNGAN',
        title: 'Surat Pernyataan Pengelolaan Lingkungan (SPPL)',
        fileName: 'sppl_mandiri_nusantara.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2026-02-10 09:15',
        sha256: '99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff',
        url: '#'
      },
      {
        id: 'VFC-DOC-006',
        companyId: 'COMP-001',
        category: 'PENGAJUAN',
        title: 'Pakta Integritas & Rencana Investasi Kapal',
        fileName: 'pakta_integritas_penanggungjawab.pdf',
        fileSize: '950 KB',
        uploadedAt: '2026-03-01 11:00',
        sha256: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
        url: '#'
      },
      {
        id: 'VFC-DOC-007',
        companyId: 'COMP-001',
        category: 'CUSTOM_TEKNIS',
        title: 'Spesifikasi Mesin Kapal & Alat Tangkap Ramah Lingkungan',
        fileName: 'spek_mesin_kapal_v2.pdf',
        fileSize: '3.1 MB',
        uploadedAt: '2026-03-05 16:40',
        sha256: '44556677889900112233445566778899aabbccddeeff00112233445566778899',
        url: '#'
      }
    ] as VfcDocument[]
  }),

  getters: {
    documentsByCompany: (state) => (companyId: string) => {
      return state.documents.filter((d) => d.companyId === companyId);
    },

    documentsByCategory: (state) => (companyId: string, category: string) => {
      return state.documents.filter((d) => {
        if (d.companyId !== companyId) return false;
        if (category === 'PENGAJUAN' || category === 'PERMOHONAN') {
          return d.category === 'PENGAJUAN' || d.category === 'PERMOHONAN';
        }
        return d.category === category;
      });
    }
  },

  actions: {
    addDocument(doc: Omit<VfcDocument, 'id' | 'uploadedAt' | 'sha256'>) {
      const randomHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const newDoc: VfcDocument = {
        ...doc,
        id: `VFC-DOC-${Date.now().toString().slice(-6)}`,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        sha256: randomHash
      };
      this.documents.unshift(newDoc);
      return newDoc;
    },

    addCustomCategory(label: string, icon = '📁') {
      const key = `CUSTOM_${label.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
      const newCategory: VfcCustomCategory = {
        key,
        label,
        icon: icon || '📁',
        createdAt: new Date().toISOString()
      };
      this.customCategories.push(newCategory);
      return newCategory;
    },

    removeCustomCategory(key: string) {
      this.customCategories = this.customCategories.filter((c) => c.key !== key);
    }
  }
});
