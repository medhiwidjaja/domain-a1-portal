import { defineStore } from 'pinia';
import { idbGetAll, idbPut, getAppState, setAppState, STORES } from '../utils/idbStorage';

export interface BusinessEntity {
  id: string;
  name: string;
  type: 'PT' | 'CV' | 'PERORANGAN' | 'KOPERASI' | 'BULN';
  nib?: string;
  npwp: string;
  address: string;
  sector: string;
  capital: number; // IDR
  role: string;
  privileges: string[];
  status_penanaman_modal?: '01' | '02'; // 01 PMA, 02 PMDN
  ahu_sk_number?: string;
  ahu_date?: string;
  notary_name?: string;
  kswp_status?: 'VALID' | 'INVALID';
  tax_compliance?: string;
  scale?: 'Mikro' | 'Kecil' | 'Menengah' | 'Besar';
  directors?: Array<{ name: string; nik: string; position: string }>;
  shareholders?: Array<{ name: string; percentage: number; nationality: string }>;
}

export const useCompanyStore = defineStore('companyStore', {
  state: () => ({
    companies: [
      {
        id: 'COMP-001',
        name: 'PT Nusantara Pratama Enterprise',
        type: 'PT' as const,
        nib: '9120001234567',
        npwp: '01.234.567.8-012.000',
        address: 'Jl. Jendral Sudirman Kav. 45, Jakarta Selatan',
        sector: 'Teknologi & Kelautan',
        capital: 15000000000,
        role: 'Direktur Utama',
        status_penanaman_modal: '02' as const, // PMDN
        ahu_sk_number: 'AHU-0038921.AH.01.01.TAHUN 2024',
        ahu_date: '2024-04-18',
        notary_name: 'Bambang Soeprapto, S.H., M.Kn.',
        kswp_status: 'VALID' as const,
        tax_compliance: 'Wajib Pajak Patuh (SPT Tahunan Terpenuhi)',
        scale: 'Besar' as const,
        directors: [
          { name: 'Budi Santoso', nik: '3175012345678000', position: 'Direktur Utama' },
          { name: 'Siti Rahmawati', nik: '3175087654321000', position: 'Direktur Keuangan' }
        ],
        shareholders: [
          { name: 'Budi Santoso', percentage: 60, nationality: 'Indonesia' },
          { name: 'PT Mitra Investama Bersama', percentage: 40, nationality: 'Indonesia' }
        ],
        privileges: [
          'PRIV_DRAFT_CREATE_EDIT',
          'PRIV_DRAFT_SUBMIT',
          'PRIV_VFC_DOCUMENT_MANAGE',
          'PRIV_SPATIAL_GIS_EDIT',
          'PRIV_COMPANY_SETTINGS'
        ]
      },
      {
        id: 'COMP-002',
        name: 'CV Jaya Abadi Maritim',
        type: 'CV' as const,
        nib: '9120009876543',
        npwp: '02.987.654.3-045.000',
        address: 'Jl. Raya Pelabuhan No. 12, Surabaya',
        sector: 'Perikanan & Pengolahan',
        capital: 800000000,
        role: 'Kolaborator Staf Perizinan',
        status_penanaman_modal: '02' as const,
        ahu_sk_number: 'AHU-0012984.CV.01.02.TAHUN 2023',
        ahu_date: '2023-08-10',
        notary_name: 'Hendro Wijaya, S.H.',
        kswp_status: 'VALID' as const,
        tax_compliance: 'Status KSWP Memenuhi Syarat',
        scale: 'Kecil' as const,
        directors: [
          { name: 'Ahmad Dahlan', nik: '3578012345678001', position: 'Persero Pengurus' }
        ],
        shareholders: [
          { name: 'Ahmad Dahlan', percentage: 70, nationality: 'Indonesia' },
          { name: 'Faisal Basri', percentage: 30, nationality: 'Indonesia' }
        ],
        privileges: [
          'PRIV_DRAFT_CREATE_EDIT',
          'PRIV_VFC_DOCUMENT_MANAGE',
          'PRIV_SPATIAL_GIS_EDIT'
        ]
      },
      {
        id: 'COMP-003',
        name: 'Pelaku Usaha Perorangan (Budi Santoso)',
        type: 'PERORANGAN' as const,
        nib: '1234567890123',
        npwp: '31.750.123.4-098.000',
        address: 'Jl. Merdeka No. 8, Bandung',
        sector: 'Usaha Mikro Kuliner & Perdagangan',
        capital: 50000000,
        role: 'Pemilik Usaha',
        status_penanaman_modal: '02' as const,
        kswp_status: 'VALID' as const,
        tax_compliance: 'Wajib Pajak Orang Pribadi Valid',
        scale: 'Mikro' as const,
        directors: [
          { name: 'Budi Santoso', nik: '3175012345678000', position: 'Pemilik' }
        ],
        shareholders: [
          { name: 'Budi Santoso', percentage: 100, nationality: 'Indonesia' }
        ],
        privileges: [
          'PRIV_DRAFT_CREATE_EDIT',
          'PRIV_DRAFT_SUBMIT',
          'PRIV_VFC_DOCUMENT_MANAGE'
        ]
      }
    ] as BusinessEntity[],
    activeCompanyId: 'COMP-001',
    isHydrated: false
  }),
  getters: {
    activeCompany(state): BusinessEntity {
      return (
        state.companies.find((c) => c.id === state.activeCompanyId) ||
        state.companies[0]
      );
    },
    canSubmit(state): boolean {
      const company = state.companies.find((c) => c.id === state.activeCompanyId);
      return company ? company.privileges.includes('PRIV_DRAFT_SUBMIT') : false;
    }
  },
  actions: {
    async init() {
      if (this.isHydrated) return;
      try {
        const storedCompanies = await idbGetAll<BusinessEntity>(STORES.COMPANIES);
        if (storedCompanies && storedCompanies.length > 0) {
          this.companies = storedCompanies;
        } else {
          for (const c of this.companies) {
            await idbPut(STORES.COMPANIES, c);
          }
        }
        const activeId = await getAppState<string>('activeCompanyId');
        if (activeId && this.companies.some((c) => c.id === activeId)) {
          this.activeCompanyId = activeId;
        }
      } catch (err) {
        console.warn('IDB company hydration fallback:', err);
      } finally {
        this.isHydrated = true;
      }
    },
    async setActiveCompany(id: string) {
      if (this.companies.some((c) => c.id === id)) {
        this.activeCompanyId = id;
        await setAppState('activeCompanyId', id);
      }
    },
    async updateCompanyProfile(id: string, updatedData: Partial<BusinessEntity>) {
      const index = this.companies.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.companies[index] = {
          ...this.companies[index],
          ...updatedData
        };
        await idbPut(STORES.COMPANIES, this.companies[index]);
      }
    }
  }
});

