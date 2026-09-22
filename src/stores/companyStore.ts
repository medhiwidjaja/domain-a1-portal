import { defineStore } from 'pinia';

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
}

export const useCompanyStore = defineStore('companyStore', {
  state: () => ({
    companies: [
      {
        id: 'COMP-001',
        name: 'PT FairWorx Indonesia Enterprise',
        type: 'PT' as const,
        nib: '9120001234567',
        npwp: '01.234.567.8-012.000',
        address: 'Jl. Jendral Sudirman Kav. 45, Jakarta Selatan',
        sector: 'Teknologi & Kelautan',
        capital: 5000000000,
        role: 'Direktur Utama',
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
        privileges: [
          'PRIV_DRAFT_CREATE_EDIT',
          'PRIV_DRAFT_SUBMIT',
          'PRIV_VFC_DOCUMENT_MANAGE'
        ]
      }
    ] as BusinessEntity[],
    activeCompanyId: 'COMP-001'
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
    setActiveCompany(id: string) {
      if (this.companies.some((c) => c.id === id)) {
        this.activeCompanyId = id;
      }
    }
  }
});

