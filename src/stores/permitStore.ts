import { defineStore } from 'pinia';
import { useCompanyStore } from './companyStore';
import kbliData from '../data/kbli-catalog.json';

export interface KbliItem {
  kbli_code: string;
  title: string;
  risk_code: string;
  risk_level: string;
  authority: string;
  processing_time: string;
  perizinan_usaha: string;
  scopes: any[];
}

export interface PermitApplication {
  id: string;
  companyId: string;
  companyName: string;
  kbliCode: string;
  kbliTitle: string;
  scopeSequence?: string;
  scopeTitle?: string;
  riskCode: string;
  riskLevel: string;
  authority: string;
  processingTime: string;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  stepIndex: number;
  submittedAt?: string;
  approvedAt?: string;
  slaDeadlineSeconds?: number;
  payloadDigest?: string;
  attachedVfcDocIds: string[];
  formData: {
    projectName: string;
    investmentAmount: number;
    locationAddress: string;
    province: string;
    regency: string;
    landAreaSqMetres: number;
    laborCount: number;
    machineryDetails: string;
    notes: string;
  };
  verifiableCredential?: {
    vcId: string;
    issuedAt: string;
    issuer: string;
    credentialType: string;
    proofHash: string;
    qrCodeData: string;
  };
}

export const usePermitStore = defineStore('permitStore', {
  state: () => ({
    catalog: kbliData as KbliItem[],
    searchQuery: '',
    selectedRiskFilter: 'ALL',
    selectedKbli: null as KbliItem | null,

    applications: [
      {
        id: 'PERMIT-2026-001',
        companyId: 'COMP-001',
        companyName: 'PT Nusantara Pratama Enterprise',
        kbliCode: '03111',
        kbliTitle: 'Penangkapan Pisces/Ikan Bersirip di Laut',
        riskCode: 'TI',
        riskLevel: 'Tinggi',
        authority: 'Menteri/Kepala Badan',
        processingTime: '4 Hari',
        status: 'IN_REVIEW' as const,
        stepIndex: 3,
        submittedAt: '2026-09-22 14:00',
        slaDeadlineSeconds: 345600 - 43200,
        payloadDigest: '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        attachedVfcDocIds: ['VFC-DOC-001', 'VFC-DOC-003', 'VFC-DOC-006'],
        formData: {
          projectName: 'Operasi Penangkapan Ikan Laut Sentul Harbor',
          investmentAmount: 4500000000,
          locationAddress: 'Pelabuhan Laut Sentul Blok A',
          province: 'Jawa Barat',
          regency: 'Kab. Bogor',
          landAreaSqMetres: 2500,
          laborCount: 45,
          machineryDetails: '2 Unit Kapal Penangkap 25 GT, Cold Storage System',
          notes: 'Permohonan Izin Berusaha Sektor Kelautan & Perikanan'
        }
      },
      {
        id: 'PERMIT-2026-002',
        companyId: 'COMP-001',
        companyName: 'PT Nusantara Pratama Enterprise',
        kbliCode: '46324',
        kbliTitle: 'Perdagangan Besar Daging Sapi dan Daging Olahan',
        riskCode: 'MR',
        riskLevel: 'Menengah Rendah',
        authority: 'Gubernur',
        processingTime: 'Otomatis',
        status: 'APPROVED' as const,
        stepIndex: 4,
        submittedAt: '2026-09-10 09:00',
        approvedAt: '2026-09-10 09:02',
        payloadDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        attachedVfcDocIds: ['VFC-DOC-001', 'VFC-DOC-002'],
        formData: {
          projectName: 'Perdagangan Daging Sapi Segar',
          investmentAmount: 1200000000,
          locationAddress: 'Kawasan Industri Sentul Kav 18',
          province: 'Jawa Barat',
          regency: 'Kab. Bogor',
          landAreaSqMetres: 1200,
          laborCount: 15,
          machineryDetails: 'Freezer Truck 3 Unit, Chiller Room 50 Ton',
          notes: 'Standard Certificate Verified'
        },
        verifiableCredential: {
          vcId: 'urn:uuid:vc-bkpm-2026-46324-00192',
          issuedAt: '2026-09-10T09:02:00Z',
          issuer: 'did:oss:bkpm:gov:id',
          credentialType: 'VerifiableSertifikatStandar',
          proofHash: 'a9b8c7d6e5f43210123456789abcdef0123456789abcdef0123456789abcdef0',
          qrCodeData: 'https://oss.go.id/verify/vc-bkpm-2026-46324-00192'
        }
      }
    ] as PermitApplication[],

    activeWizard: {
      kbli: null as KbliItem | null,
      selectedScope: null as any | null,
      step: 1,
      formData: {
        // Profil & Smart Engine
        projectName: '',
        investmentAmount: 1500000000,
        locationAddress: '',
        province: 'Jawa Barat',
        regency: 'Kab. Bogor',
        landAreaSqMetres: 1000,
        laborCount: 20,
        machineryDetails: '',
        notes: ''
        status_penanaman_modal: '02' as '01' | '02',
        flag_umkm: 'Y' as 'Y' | 'N',
        laborCount: 25,
        machineryDetails: 'Perangkat & Mesin Produksi Sesuai Standar KBLI',
        notes: 'Permohonan diajukan melalui portal OSS v2 Domain A1',

        // Persyaratan Dasar 1: KKPR
        posisi_lokasi: '01' as '01' | '02' | '03', // 01 Darat, 02 Hutan, 03 Laut
        flag_kolektif: 'N' as 'Y' | 'N',
        jenis_bangunan_kolektif: '01',
        luas_lantai_kolektif: 120,
        satuan_luas_lantai: '02',
        latitude: -6.54125,
        longitude: 106.86432,
        luas_tanah: 1500,
        satuan_luas_tanah: 'm2' as 'm2' | 'ha',
        alamat_usaha: 'Kawasan Industri Sentul Kavling 12-14, Desa Sentul',
        provinsi: '32', // Jawa Barat
        kab_kota: '3201', // Kab Bogor
        kecamatan: '320101', // Babakan Madang
        kelurahan: '3201012001', // Sentul
        kode_pos: '16810',
        flag_kawasan: 'Y' as 'Y' | 'N',
        tipe_kawasan: '01', // Kawasan Industri
        nama_kawasan: 'Kawasan Industri Sentul Sentra',
        flag_rdtr: 'Y' as 'Y' | 'N',

        // PKKPR (Jika non-UMK luar kawasan)
        nomor_pkkpr: '056000000002',
        garis_sempadan_bangunan: 8,
        koefisien_dasar_bangunan: 60,
        koefisien_lantai_bangunan: 2.4,
        koefisien_dasar_hijau: 20,
        status_penguasaan_lahan: '02', // Milik Sendiri
        jenis_dokumen_tanah: '02', // HGB
        nomor_dokumen_tanah: 'HGB-3201-2024-00981',
        nama_pemilik_lahan: 'PT Nusantara Pratama Enterprise',
        nama_penerbit_dokumen_tanah: 'Kantor Pertanahan Kab. Bogor',
        tgl_terbit_tanah: '2024-03-15',

        // Persyaratan Dasar 2: Persetujuan Lingkungan
        flag_has_dokumen_lingkungan: 'N' as 'Y' | 'N',
        jenis_dokumen_lingkungan: 'sppl',
        nomor_lingkungan: '',
        tgl_terbit_lingkungan: '',
        uraian_usaha_lingkungan: 'Kegiatan usaha ini berkomitmen menerapkan pengelolaan limbah dan pencegahan pencemaran lingkungan hidup sesuai baku mutu nasional.',
        flag_pernyataan_sppl: true,

        // Persyaratan Dasar 3: Bangunan Gedung (PBG & SLF)
        memerlukan_bangunan: 'Y' as 'Y' | 'N',
        jenisIzinBangunan: 'pbg' as 'pbg' | 'slf',
        jenisPermohonanBangunan: '01',
        subFungsiUntukBangunan: '03', // Perindustrian
        namaBangunan: 'Gedung Sentra Operasional',
        luasTotalBangunan: 1500,
        tinggiBangunan: 10.5,
        jumlahLantai: 2,
        jumlahEstimasiPenghuni: 40,
        nomorImbUntukSlfEksisting: '',
        disclaimerSimbg: true
      },
      selectedVfcDocIds: [] as string[]
    }
  }),

  getters: {
    filteredCatalog(state): KbliItem[] {
      let list = state.catalog;
      if (state.selectedRiskFilter !== 'ALL') {
        const filter = state.selectedRiskFilter;
        list = list.filter((item) => {
          if (filter === 'R') return item.risk_code === 'R' || item.risk_code === 'RE';
          if (filter === 'TI') return item.risk_code === 'TI' || item.risk_code === 'T';
          return item.risk_code === filter;
        });
      }
      if (!state.searchQuery.trim()) {
        return list;
      }
      const q = state.searchQuery.toLowerCase().trim();
      return list.filter((item) => {
        const matchCode = item.kbli_code.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchScope = item.scopes.some((s: any) => s.title && s.title.toLowerCase().includes(q));
        return matchCode || matchTitle || matchScope;
      });
    },

    activeApplications(state) {
      const companyStore = useCompanyStore();
      return state.applications.filter(
        (a) => a.companyId === companyStore.activeCompanyId
      );
    },

    approvedCredentials(state) {
      const companyStore = useCompanyStore();
      return state.applications.filter(
        (a) => a.companyId === companyStore.activeCompanyId && a.status === 'APPROVED' && a.verifiableCredential
      );
    }
  },

  actions: {
    startWizardForKbli(kbli: KbliItem, scope?: any) {
      const companyStore = useCompanyStore();
      const chosenScope = scope || (kbli.scopes && kbli.scopes[0]) || null;
      this.activeWizard.kbli = kbli;
      this.activeWizard.selectedScope = chosenScope;
      this.activeWizard.step = 1;

      const riskCode = chosenScope?.licensing_requirements?.[0]?.risk_code || kbli.risk_code;
      const isLow = riskCode === 'R' || riskCode === 'RE' || riskCode === 'MR';
      const isHigh = riskCode === 'T' || riskCode === 'TI';
      const isMarine = kbli.kbli_code.startsWith('03');

      this.activeWizard.formData = {
        projectName: `Kegiatan Usaha ${kbli.title}${chosenScope ? ' (Lingkup ' + chosenScope.sequence + ')' : ''}`,
        investmentAmount: 1500000000,
        locationAddress: 'Jl. Industri Utama Sentul Kav. 12',
        province: 'Jawa Barat',
        regency: 'Kab. Bogor',
        landAreaSqMetres: 1200,
        laborCount: 25,
        machineryDetails: 'Perangkat & Mesin Produksi Sesuai Standar KBLI',
        notes: 'Permohonan diajukan melalui portal OSS v2 Domain A1'
        projectName: `Operasi Usaha ${kbli.title}${chosenScope ? ' (Lingkup ' + chosenScope.sequence + ')' : ''}`,
        investmentAmount: isLow ? 3500000000 : isHigh ? 25000000000 : 12000000000,
        status_penanaman_modal: '02',
        flag_umkm: isLow ? 'Y' : 'N',
        laborCount: isLow ? 15 : 45,
        machineryDetails: 'Instalasi dan Perangkat Operasional Sesuai Standar Teknis KBLI',
        notes: 'Permohonan diajukan melalui portal OSS v2 Domain A1 (Persyaratan Dasar)',

        // KKPR
        posisi_lokasi: isMarine ? '03' : '01',
        flag_kolektif: 'N',
        jenis_bangunan_kolektif: '01',
        luas_lantai_kolektif: 120,
        satuan_luas_lantai: '02',
        latitude: -6.54125,
        longitude: 106.86432,
        luas_tanah: isMarine ? 500 : 2500,
        satuan_luas_tanah: 'm2',
        alamat_usaha: 'Kawasan Industri Sentul Kavling 12-14, Desa Sentul',
        provinsi: '32',
        kab_kota: '3201',
        kecamatan: '320101',
        kelurahan: '3201012001',
        kode_pos: '16810',
        flag_kawasan: 'Y',
        tipe_kawasan: '01',
        nama_kawasan: 'Kawasan Industri Sentul Sentra',
        flag_rdtr: 'Y',

        // PKKPR
        nomor_pkkpr: '056000000002',
        garis_sempadan_bangunan: 8,
        koefisien_dasar_bangunan: 60,
        koefisien_lantai_bangunan: 2.4,
        koefisien_dasar_hijau: 20,
        status_penguasaan_lahan: '02',
        jenis_dokumen_tanah: '02',
        nomor_dokumen_tanah: 'HGB-3201-2024-00981',
        nama_pemilik_lahan: companyStore.activeCompany.name,
        nama_penerbit_dokumen_tanah: 'Kantor Pertanahan Kab. Bogor',
        tgl_terbit_tanah: '2024-03-15',

        // Lingkungan
        flag_has_dokumen_lingkungan: 'N',
        jenis_dokumen_lingkungan: isLow ? 'sppl' : isHigh ? 'amdal' : 'ukl/upl',
        nomor_lingkungan: '',
        tgl_terbit_lingkungan: '',
        uraian_usaha_lingkungan: `Rencana kegiatan ${kbli.title} dengan mematuhi baku mutu lingkungan hidup dan pengelolaan limbah operasional sesuai regulasi pemerintah.`,
        flag_pernyataan_sppl: true,

        // PBG & SLF
        memerlukan_bangunan: isMarine ? 'N' : 'Y',
        jenisIzinBangunan: 'pbg',
        jenisPermohonanBangunan: '01',
        subFungsiUntukBangunan: '03',
        namaBangunan: `Gedung Sentra Operasional ${kbli.title}`,
        luasTotalBangunan: 1500,
        tinggiBangunan: 9.5,
        jumlahLantai: 2,
        jumlahEstimasiPenghuni: 35,
        nomorImbUntukSlfEksisting: '',
        disclaimerSimbg: true
      };
      this.activeWizard.selectedVfcDocIds = ['VFC-DOC-001', 'VFC-DOC-002'];

      // Pre-select appropriate documents from VFC if already stored
      this.activeWizard.selectedVfcDocIds = ['VFC-DOC-001', 'VFC-DOC-003'];
    },

    setWizardStep(step: number) {
      this.activeWizard.step = step;
    },

    toggleVfcDocSelection(docId: string) {
      const idx = this.activeWizard.selectedVfcDocIds.indexOf(docId);
      if (idx >= 0) {
        this.activeWizard.selectedVfcDocIds.splice(idx, 1);
      } else {
        this.activeWizard.selectedVfcDocIds.push(docId);
      }
    },

    submitApplication() {
      if (!this.activeWizard.kbli) return null;
      const companyStore = useCompanyStore();
      const kbli = this.activeWizard.kbli;
      const scope = this.activeWizard.selectedScope;
      const reqObj = scope?.licensing_requirements?.[0];

      const riskCode = reqObj?.risk_code || kbli.risk_code;
      const riskLevel = reqObj?.risk_level || kbli.risk_level;
      const authority = reqObj?.authority || kbli.authority;
      const processingTime = reqObj?.processing_time || kbli.processing_time;

      const digest = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const newPermitId = `PERMIT-2026-${Math.floor(100 + Math.random() * 900)}`;
      const isAutoApprove = riskCode === 'R' || riskCode === 'RE' || riskCode === 'MR';

      const newApp: PermitApplication = {
        id: newPermitId,
        companyId: companyStore.activeCompanyId,
        companyName: companyStore.activeCompany.name,
        kbliCode: kbli.kbli_code,
        kbliTitle: kbli.title,
        scopeSequence: scope?.sequence,
        scopeTitle: scope?.title,
        riskCode: riskCode,
        riskLevel: riskLevel,
        authority: authority,
        processingTime: processingTime,
        status: isAutoApprove ? 'APPROVED' : 'IN_REVIEW',
        stepIndex: isAutoApprove ? 4 : 2,
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        approvedAt: isAutoApprove
          ? new Date().toISOString().replace('T', ' ').slice(0, 16)
          : undefined,
        slaDeadlineSeconds: isAutoApprove ? 0 : 259200,
        payloadDigest: digest,
        attachedVfcDocIds: [...this.activeWizard.selectedVfcDocIds],
        formData: { ...this.activeWizard.formData },
        verifiableCredential: isAutoApprove
          ? {
            vcId: `urn:uuid:vc-bkpm-2026-${kbli.kbli_code}-${Math.floor(10000 + Math.random() * 90000)}`,
            issuedAt: new Date().toISOString(),
            issuer: 'did:oss:bkpm:gov:id',
            credentialType:
              riskCode === 'R' || riskCode === 'RE'
                ? 'VerifiableNIB'
                : 'VerifiableSertifikatStandar',
            proofHash: digest,
            qrCodeData: `https://oss.go.id/verify/${newPermitId}`
          }
          : undefined
      };

      this.applications.unshift(newApp);
      this.activeWizard.step = 5;
      return newApp;
    }
  }
});

