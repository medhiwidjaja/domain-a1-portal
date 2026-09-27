import { defineStore } from 'pinia';
import { useCompanyStore } from './companyStore';
import kbliData from '../data/kbli-catalog.json';
import { idbGetAll, idbPut, getAppState, setAppState, STORES } from '../utils/idbStorage';
import {
  evaluateStage1KbliRequirements,
  evaluateStage2AuthorityRouting,
  type Stage1RequirementsResult,
  type AuthorityRoutingResult
} from '../utils/dmnEngine';
import type { SpatialParcelAsset } from './spatialStore';

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
  assigned_authority_code?: string;
  designated_verifier_agency?: string;
  matched_rule_id?: string;
  statutory_sla_days?: number;
  dynamic_params?: Record<string, any>;
  spatial_parcel_binding_id?: string | null;
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
    isHydrated: false,
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
      },
      {
        id: 'PERMIT-2026-003',
        companyId: 'COMP-001',
        companyName: 'PT Nusantara Pratama Enterprise',
        kbliCode: '01286',
        kbliTitle: 'Pertanian Tanaman Obat atau Biofarmaka Non Rimpang',
        scopeSequence: 'B',
        scopeTitle: 'Produksi Benih Kina, Adas Pinang dan Gambir',
        riskCode: 'MR',
        riskLevel: 'Menengah Rendah',
        authority: 'Gubernur / Dinas Pertanian Provinsi',
        processingTime: 'Otomatis',
        status: 'APPROVED' as const,
        stepIndex: 4,
        submittedAt: '2026-09-25 10:30',
        approvedAt: '2026-09-25 10:32',
        payloadDigest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        attachedVfcDocIds: ['VFC-DOC-001', 'VFC-DOC-003'],
        formData: {
          projectName: 'Operasi Perbenihan Tanaman Obat Non Rimpang Sentul',
          investmentAmount: 3200000000,
          locationAddress: 'Kawasan Industri Sentul Kavling 14, Desa Sentul',
          province: 'Jawa Barat',
          regency: 'Kab. Bogor',
          landAreaSqMetres: 2000,
          laborCount: 20,
          machineryDetails: 'Laboratorium Uji Mutu Benih, Green House 800 m2',
          notes: 'Izin Utama (Sertifikat Standar) Terbit - Memerlukan Pemenuhan PB-UMKU'
        },
        verifiableCredential: {
          vcId: 'urn:uuid:vc-bkpm-2026-01286-00388',
          issuedAt: '2026-09-25T10:32:00Z',
          issuer: 'did:oss:bkpm:gov:id',
          credentialType: 'VerifiableSertifikatStandar',
          proofHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
          qrCodeData: 'https://oss.go.id/verify/vc-bkpm-2026-01286-00388'
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
        lingkunganPaymentVerified: false,
        lingkunganProofFileName: '',

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
        disclaimerSimbg: true,

        // DMN 1.3 & Automated Spatial Target Architecture
        dynamic_params: {} as Record<string, any>,
        assigned_authority_code: '02' as '00' | '01' | '02' | '03' | '04',
        authority_tier: 'Kab/Kota' as 'Pusat' | 'Provinsi' | 'Kab/Kota' | 'KEK' | 'KPBPB',
        designated_verifier_agency: 'DPMPTSP Kab. Bogor',
        matched_rule_id: 'RULE_DEFAULT_DOMESTIC_LOCAL_02',
        matched_rule_desc: 'Proyek PMDN dalam satu wilayah administratif kabupaten/kota standar -> Kewenangan Bupati/Walikota.',
        statutory_sla_days: 5,
        spatial_parcel_binding_id: null as string | null,
        is_cross_kab: false,
        is_cross_prov: false,
        zone_code: 'STANDARD' as 'STANDARD' | '03' | '04',
        zone_name: 'Kawasan Industri Sentul Sentra',
        rdtr_status: 'SESUAI' as 'SESUAI' | 'TERBATAS' | 'TANPA_RDTR',
        polygon_coordinates: [
          { lat: -6.54125, lng: 106.86432 },
          { lat: -6.54080, lng: 106.86550 },
          { lat: -6.54210, lng: 106.86590 },
          { lat: -6.54250, lng: 106.86480 }
        ] as Array<{ lat: number; lng: number }>
      },
      selectedVfcDocIds: [] as string[],
      activeTrack: 'MAIN' as string,
      openAccordions: { 1: true, 2: false, 3: false, 4: false, 5: false } as Record<number, boolean>,
      umkuFormData: {} as Record<string, any>
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
    async init() {
      if (this.isHydrated) return;
      try {
        const storedApps = await idbGetAll<PermitApplication>(STORES.PERMITS);
        if (storedApps && storedApps.length > 0) {
          if (!storedApps.some((a) => a.id === 'PERMIT-2026-003')) {
            const sample003 = this.applications.find((a) => a.id === 'PERMIT-2026-003');
            if (sample003) {
              storedApps.push(sample003);
              await idbPut(STORES.PERMITS, sample003);
            }
          }
          this.applications = storedApps;
        } else {
          for (const app of this.applications) {
            await idbPut(STORES.PERMITS, app);
          }
        }
        const savedDraft = await getAppState<any>('active_wizard_draft');
        if (savedDraft && savedDraft.kbli) {
          const catalogItem = this.catalog.find((k) => k.kbli_code === savedDraft.kbli.kbli_code);
          if (catalogItem) {
            savedDraft.kbli = catalogItem;
            if (savedDraft.selectedScope) {
              const matchedScope = catalogItem.scopes?.find((s) => s.sequence === savedDraft.selectedScope.sequence);
              if (matchedScope) {
                savedDraft.selectedScope = matchedScope;
              }
            }
          }
          this.activeWizard = {
            ...this.activeWizard,
            ...savedDraft,
            formData: {
              ...this.activeWizard.formData,
              ...(savedDraft.formData || {})
            },
            openAccordions: savedDraft.openAccordions || {
              1: savedDraft.step === 1,
              2: savedDraft.step === 2,
              3: savedDraft.step === 3,
              4: savedDraft.step === 4,
              5: savedDraft.step === 5
            },
            umkuFormData: savedDraft.umkuFormData || {},
            activeTrack: savedDraft.activeTrack || 'MAIN'
          };
        } else if (!this.activeWizard.kbli) {
          const defaultKbli = this.catalog.find((k) => k.kbli_code === '01285');
          if (defaultKbli) {
            this.startWizardForKbli(defaultKbli, defaultKbli.scopes[0]);
          }
        }
      } catch (err) {
        console.warn('IDB permit hydration fallback:', err);
      } finally {
        this.isHydrated = true;
      }
    },

    runStage2Routing() {
      if (!this.activeWizard.kbli) return;
      const routingResult = evaluateStage2AuthorityRouting({
        kbli_code: this.activeWizard.kbli.kbli_code,
        status_penanaman_modal: this.activeWizard.formData.status_penanaman_modal,
        is_cross_prov: this.activeWizard.formData.is_cross_prov,
        is_cross_kab: this.activeWizard.formData.is_cross_kab,
        zone_code: this.activeWizard.formData.zone_code,
        zone_name: this.activeWizard.formData.zone_name,
        dynamic_params: this.activeWizard.formData.dynamic_params
      });

      this.activeWizard.formData.assigned_authority_code = routingResult.kode_kewenangan;
      this.activeWizard.formData.authority_tier = routingResult.authority_tier;
      this.activeWizard.formData.designated_verifier_agency = routingResult.designated_verifier_agency;
      this.activeWizard.formData.matched_rule_id = routingResult.matched_rule_id;
      this.activeWizard.formData.matched_rule_desc = routingResult.matched_rule_desc;
      this.activeWizard.formData.statutory_sla_days = routingResult.statutory_sla_days;
    },

    bindSpatialParcel(parcel: SpatialParcelAsset) {
      this.activeWizard.formData.spatial_parcel_binding_id = parcel.parcel_id;
      this.activeWizard.formData.alamat_usaha = parcel.address;
      this.activeWizard.formData.latitude = parcel.latitude;
      this.activeWizard.formData.longitude = parcel.longitude;
      this.activeWizard.formData.luas_tanah = parcel.area_sqm;
      this.activeWizard.formData.satuan_luas_tanah = 'm2';
      this.activeWizard.formData.posisi_lokasi = parcel.position;
      this.activeWizard.formData.is_cross_kab = parcel.is_cross_kab;
      this.activeWizard.formData.is_cross_prov = parcel.is_cross_prov;
      this.activeWizard.formData.zone_code = parcel.zone_code;
      this.activeWizard.formData.zone_name = parcel.zone_name;
      this.activeWizard.formData.flag_kawasan = parcel.zone_code !== 'STANDARD' || parcel.zone_name.includes('Industri') ? 'Y' : 'N';
      this.activeWizard.formData.tipe_kawasan = parcel.zone_code === '03' ? '02' : '01';
      this.activeWizard.formData.nama_kawasan = parcel.zone_name;
      this.activeWizard.formData.rdtr_status = parcel.rdtr_status;
      this.activeWizard.formData.flag_rdtr = parcel.rdtr_status === 'SESUAI' ? 'Y' : 'N';
      this.activeWizard.formData.jenis_dokumen_tanah = parcel.ownership_doc_type;
      this.activeWizard.formData.nomor_dokumen_tanah = parcel.ownership_doc_number;
      this.activeWizard.formData.polygon_coordinates = [...parcel.polygon_coordinates];

      this.runStage2Routing();
      this.persistDraft();
    },

    updateDynamicParam(key: string, value: any) {
      this.activeWizard.formData.dynamic_params[key] = value;
      this.runStage2Routing();
      this.persistDraft();
    },

    async persistDraft() {
      try {
        await setAppState('active_wizard_draft', this.activeWizard);
      } catch (e) {
        // silent
      }
    },

    startWizardForKbli(kbli: KbliItem, scope?: any) {
      const companyStore = useCompanyStore();
      const chosenScope = scope || (kbli.scopes && kbli.scopes[0]) || null;
      this.activeWizard.kbli = kbli;
      this.activeWizard.selectedScope = chosenScope;
      this.activeWizard.step = 1;
      this.activeWizard.activeTrack = 'MAIN';
      this.activeWizard.openAccordions = { 1: true, 2: false, 3: false, 4: false, 5: false };
      this.activeWizard.umkuFormData = {};

      const riskCode = chosenScope?.licensing_requirements?.[0]?.risk_code || kbli.risk_code;
      const isLow = riskCode === 'R' || riskCode === 'RE' || riskCode === 'MR';
      const isHigh = riskCode === 'T' || riskCode === 'TI';
      const isMarine = kbli.kbli_code.startsWith('03');

      // Run Stage 1 DMN to obtain parameter schema & defaults
      const stage1 = evaluateStage1KbliRequirements(
        kbli.kbli_code,
        Number(chosenScope?.sequence || 1),
        companyStore.activeCompany.scale || 'Besar'
      );

      const dynamicDefaults: Record<string, any> = {};
      for (const field of stage1.parameters_schema.fields) {
        dynamicDefaults[field.key] = field.default !== undefined ? field.default : '';
      }

      this.activeWizard.formData = {
        projectName: `Operasi Usaha ${kbli.title}${chosenScope ? ' (Lingkup ' + chosenScope.sequence + ')' : ''}`,
        investmentAmount: isLow ? 3500000000 : isHigh ? 25000000000 : 12000000000,
        status_penanaman_modal: (companyStore.activeCompany.status_penanaman_modal || '02') as '01' | '02',
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
        lingkunganPaymentVerified: false,
        lingkunganProofFileName: '',

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
        disclaimerSimbg: true,

        // DMN & Spatial Bindings
        dynamic_params: dynamicDefaults,
        assigned_authority_code: '02',
        authority_tier: 'Kab/Kota',
        designated_verifier_agency: 'DPMPTSP Kab. Bogor',
        matched_rule_id: 'RULE_DEFAULT_DOMESTIC_LOCAL_02',
        matched_rule_desc: 'Proyek PMDN dalam satu wilayah administratif kabupaten/kota standar -> Kewenangan Bupati/Walikota.',
        statutory_sla_days: stage1.statutory_sla_days,
        spatial_parcel_binding_id: null,
        is_cross_kab: false,
        is_cross_prov: false,
        zone_code: 'STANDARD',
        zone_name: 'Kawasan Industri Sentul Sentra',
        rdtr_status: 'SESUAI',
        polygon_coordinates: [
          { lat: -6.54125, lng: 106.86432 },
          { lat: -6.54080, lng: 106.86550 },
          { lat: -6.54210, lng: 106.86590 },
          { lat: -6.54250, lng: 106.86480 }
        ]
      };

      this.activeWizard.selectedVfcDocIds = ['VFC-DOC-001', 'VFC-DOC-003'];
      this.runStage2Routing();
      this.persistDraft();
    },

    setWizardStep(step: number) {
      this.activeWizard.step = step;
      this.persistDraft();
    },

    toggleVfcDocSelection(docId: string) {
      const idx = this.activeWizard.selectedVfcDocIds.indexOf(docId);
      if (idx >= 0) {
        this.activeWizard.selectedVfcDocIds.splice(idx, 1);
      } else {
        this.activeWizard.selectedVfcDocIds.push(docId);
      }
      this.persistDraft();
    },

    async submitApplication() {
      if (!this.activeWizard.kbli) return null;
      const companyStore = useCompanyStore();
      const kbli = this.activeWizard.kbli;
      const scope = this.activeWizard.selectedScope;
      const reqObj = scope?.licensing_requirements?.[0];

      const riskCode = reqObj?.risk_code || kbli.risk_code;
      const riskLevel = reqObj?.risk_level || kbli.risk_level;
      const authority = this.activeWizard.formData.designated_verifier_agency || reqObj?.authority || kbli.authority;
      const processingTime = `${this.activeWizard.formData.statutory_sla_days} Hari Kerja`;

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
        slaDeadlineSeconds: isAutoApprove ? 0 : this.activeWizard.formData.statutory_sla_days * 86400,
        payloadDigest: digest,
        attachedVfcDocIds: [...this.activeWizard.selectedVfcDocIds],
        assigned_authority_code: this.activeWizard.formData.assigned_authority_code,
        designated_verifier_agency: this.activeWizard.formData.designated_verifier_agency,
        matched_rule_id: this.activeWizard.formData.matched_rule_id,
        statutory_sla_days: this.activeWizard.formData.statutory_sla_days,
        dynamic_params: { ...this.activeWizard.formData.dynamic_params },
        spatial_parcel_binding_id: this.activeWizard.formData.spatial_parcel_binding_id,
        formData: {
          projectName: this.activeWizard.formData.projectName,
          investmentAmount: this.activeWizard.formData.investmentAmount,
          locationAddress: this.activeWizard.formData.alamat_usaha,
          province: this.activeWizard.formData.provinsi,
          regency: this.activeWizard.formData.kab_kota,
          landAreaSqMetres: this.activeWizard.formData.luas_tanah,
          laborCount: this.activeWizard.formData.laborCount,
          machineryDetails: this.activeWizard.formData.machineryDetails,
          notes: this.activeWizard.formData.notes
        },
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
      await idbPut(STORES.PERMITS, newApp);
      this.activeWizard.step = 6;
      await this.persistDraft();
      return newApp;
    },

    async updateApplication(app: PermitApplication) {
      const idx = this.applications.findIndex((a) => a.id === app.id);
      if (idx !== -1) {
        this.applications[idx] = { ...app };
        await idbPut(STORES.PERMITS, this.applications[idx]);
      }
    },

    async updateApplicationStatus(id: string, status: PermitApplication['status'], stepIndex?: number) {
      const app = this.applications.find((a) => a.id === id);
      if (app) {
        app.status = status;
        if (stepIndex !== undefined) app.stepIndex = stepIndex;
        if (status === 'APPROVED' && !app.approvedAt) {
          app.approvedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        }
        await idbPut(STORES.PERMITS, app);
      }
    },

    async resetWizard() {
      const defaultKbli = this.catalog.find((k) => k.kbli_code === '01285');
      if (defaultKbli) {
        this.startWizardForKbli(defaultKbli, defaultKbli.scopes[0]);
      }
    }
  }
});

