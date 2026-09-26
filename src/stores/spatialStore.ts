import { defineStore } from 'pinia';
import { idbGetAll, idbPut, idbDelete, STORES } from '../utils/idbStorage';

export interface SpatialParcelAsset {
  parcel_id: string;
  company_id: string;
  site_name: string;
  address: string;
  region_code: string; // Kemendagri code
  province: string;
  regency: string;
  district: string;
  village: string;
  postal_code: string;
  position: '01' | '02' | '03'; // 01 Darat, 02 Hutan, 03 Laut
  latitude: number;
  longitude: number;
  polygon_coordinates: Array<{ lat: number; lng: number }>;
  area_sqm: number;
  area_ha: number;
  is_cross_kab: boolean;
  is_cross_prov: boolean;
  zone_code: 'STANDARD' | '03' | '04'; // Standard, KEK, KPBPB
  zone_name: string;
  rdtr_status: 'SESUAI' | 'TERBATAS' | 'TANPA_RDTR';
  rdtr_zoning_code: string;
  rdtr_sub_zone: string;
  ownership_doc_type: string; // 02 HGB, 01 SHM, 03 Hak Pakai, 04 Sewa
  ownership_doc_number: string;
  sha256_checksum: string;
  created_at: string;
}

const defaultParcels: SpatialParcelAsset[] = [
  {
    parcel_id: 'PARCEL-001-SENTUL',
    company_id: 'COMP-001',
    site_name: 'Plot Sentul Industrial Estate Lot 12-14',
    address: 'Kawasan Industri Sentul Kavling 12-14, Desa Sentul, Kec. Babakan Madang, Kab. Bogor',
    region_code: '32.01.01.2001',
    province: 'Jawa Barat (32)',
    regency: 'Kab. Bogor (3201)',
    district: 'Babakan Madang (320101)',
    village: 'Sentul (3201012001)',
    postal_code: '16810',
    position: '01',
    latitude: -6.54125,
    longitude: 106.86432,
    polygon_coordinates: [
      { lat: -6.54125, lng: 106.86432 },
      { lat: -6.54080, lng: 106.86550 },
      { lat: -6.54210, lng: 106.86590 },
      { lat: -6.54250, lng: 106.86480 }
    ],
    area_sqm: 1500,
    area_ha: 0.15,
    is_cross_kab: false,
    is_cross_prov: false,
    zone_code: 'STANDARD',
    zone_name: 'Kawasan Industri Sentul Sentra',
    rdtr_status: 'SESUAI',
    rdtr_zoning_code: 'KPI',
    rdtr_sub_zone: 'Kawasan Peruntukan Industri (KPI) - Zona Hijau GISTARU',
    ownership_doc_type: '02',
    ownership_doc_number: 'HGB-3201-2024-00981',
    sha256_checksum: 'a9b8c7d6e5f43210123456789abcdef0123456789abcdef0123456789abcdef0',
    created_at: '2026-02-01 14:25'
  },
  {
    parcel_id: 'PARCEL-002-KENDAL-KEK',
    company_id: 'COMP-001',
    site_name: 'Kendal Industrial Park - SEZ Lot D-8',
    address: 'Kawasan Industri Kendal (KEK), Jl. Laut Jawa Kav 8, Mororejo, Kaliwungu, Kab. Kendal',
    region_code: '33.24.10.2005',
    province: 'Jawa Tengah (33)',
    regency: 'Kab. Kendal (3324)',
    district: 'Kaliwungu (332410)',
    village: 'Mororejo',
    postal_code: '51372',
    position: '01',
    latitude: -6.91500,
    longitude: 110.27400,
    polygon_coordinates: [
      { lat: -6.91500, lng: 110.27400 },
      { lat: -6.91420, lng: 110.27850 },
      { lat: -6.91780, lng: 110.27900 },
      { lat: -6.91840, lng: 110.27450 }
    ],
    area_sqm: 5000,
    area_ha: 0.50,
    is_cross_kab: false,
    is_cross_prov: false,
    zone_code: '03', // KEK
    zone_name: 'Kawasan Ekonomi Khusus Kendal (KIK)',
    rdtr_status: 'SESUAI',
    rdtr_zoning_code: 'KEK',
    rdtr_sub_zone: 'Zona Industri Terpadu KEK Kendal',
    ownership_doc_type: '02',
    ownership_doc_number: 'HGB-3324-2025-00431',
    sha256_checksum: 'b8c7d6e5f4a93210123456789abcdef0123456789abcdef0123456789abcdef1',
    created_at: '2026-03-01 09:15'
  },
  {
    parcel_id: 'PARCEL-003-LINTAS-WILAYAH',
    company_id: 'COMP-001',
    site_name: 'Plot Terpadu Perbatasan Bogor - Depok',
    address: 'Jl. Raya Jakarta-Bogor Km 38 (Perbatasan Cibinong, Kab. Bogor & Tapos, Kota Depok)',
    region_code: '32.01.01.1002',
    province: 'Jawa Barat (32)',
    regency: 'Kab. Bogor & Kota Depok (Lintas Wilayah)',
    district: 'Cibinong / Tapos',
    village: 'Cibinong',
    postal_code: '16911',
    position: '01',
    latitude: -6.44200,
    longitude: 106.84500,
    polygon_coordinates: [
      { lat: -6.44200, lng: 106.84500 },
      { lat: -6.44150, lng: 106.84950 },
      { lat: -6.44620, lng: 106.85000 },
      { lat: -6.44680, lng: 106.84550 }
    ],
    area_sqm: 3200,
    area_ha: 0.32,
    is_cross_kab: true,
    is_cross_prov: false,
    zone_code: 'STANDARD',
    zone_name: 'Luar Kawasan Industri',
    rdtr_status: 'SESUAI',
    rdtr_zoning_code: 'CAMPURAN',
    rdtr_sub_zone: 'Zona Campuran Perdagangan & Jasa',
    ownership_doc_type: '01',
    ownership_doc_number: 'SHM-3201-2023-01824',
    sha256_checksum: 'c7d6e5f4a9b83210123456789abcdef0123456789abcdef0123456789abcdef2',
    created_at: '2026-03-10 11:30'
  }
];

export const useSpatialStore = defineStore('spatialStore', {
  state: () => ({
    parcels: [] as SpatialParcelAsset[],
    isHydrated: false,
    selectedParcelId: null as string | null
  }),

  getters: {
    parcelsByCompany: (state) => (companyId: string) => {
      return state.parcels.filter((p) => p.company_id === companyId);
    },
    activeParcel: (state) => {
      return state.parcels.find((p) => p.parcel_id === state.selectedParcelId) || state.parcels[0] || null;
    }
  },

  actions: {
    async init() {
      if (this.isHydrated) return;
      try {
        const stored = await idbGetAll<SpatialParcelAsset>(STORES.SPATIAL_PARCELS);
        if (stored && stored.length > 0) {
          this.parcels = stored;
        } else {
          this.parcels = [...defaultParcels];
          for (const item of defaultParcels) {
            await idbPut(STORES.SPATIAL_PARCELS, item);
          }
        }
      } catch (err) {
        console.warn('Falling back to default parcels:', err);
        this.parcels = [...defaultParcels];
      } finally {
        this.isHydrated = true;
      }
    },

    async addParcel(parcel: Omit<SpatialParcelAsset, 'parcel_id' | 'created_at' | 'sha256_checksum'>) {
      const randomHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const newParcel: SpatialParcelAsset = {
        ...parcel,
        parcel_id: `PARCEL-${Date.now().toString().slice(-6)}`,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        sha256_checksum: randomHash
      };

      this.parcels.unshift(newParcel);
      await idbPut(STORES.SPATIAL_PARCELS, newParcel);
      return newParcel;
    },

    async updateParcel(parcelId: string, updated: Partial<SpatialParcelAsset>) {
      const idx = this.parcels.findIndex((p) => p.parcel_id === parcelId);
      if (idx !== -1) {
        this.parcels[idx] = {
          ...this.parcels[idx],
          ...updated
        };
        await idbPut(STORES.SPATIAL_PARCELS, this.parcels[idx]);
      }
    },

    async deleteParcel(parcelId: string) {
      this.parcels = this.parcels.filter((p) => p.parcel_id !== parcelId);
      await idbDelete(STORES.SPATIAL_PARCELS, parcelId);
    }
  }
});
