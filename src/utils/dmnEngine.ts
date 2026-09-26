/**
 * Target Architecture: Two-Stage Decoupled DMN 1.3 Engine
 * Implementation based on Section 5 & 6 of TO-BE Specification:
 * - Stage 1: Evaluates KBLI Scope & Scale -> Outputs Risk Tier, Statutory SLA, and Typed Dynamic Parameter Schema
 * - Stage 2: Evaluates Dynamic Parameters + Automated Spatial Flags -> Outputs Deterministic Authority Routing
 */

export interface DynamicFormField {
  key: string;
  label: string;
  type: 'number' | 'enum' | 'boolean' | 'string';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  required: boolean;
  default?: any;
  help_text?: string;
}

export interface DynamicParameterSchema {
  title: string;
  description: string;
  fields: DynamicFormField[];
}

export interface Stage1RequirementsResult {
  risk_tier: 'R' | 'MR' | 'MT' | 'T';
  statutory_sla_days: number;
  perizinan_usaha: string[];
  parameters_schema: DynamicParameterSchema;
}

export interface AuthorityRoutingInput {
  kbli_code: string;
  status_penanaman_modal: '01' | '02'; // 01 PMA, 02 PMDN
  is_cross_prov: boolean;
  is_cross_kab: boolean;
  zone_code: 'STANDARD' | '03' | '04'; // 03 KEK, 04 KPBPB (Batam)
  zone_name?: string;
  dynamic_params: Record<string, any>;
}

export interface AuthorityRoutingResult {
  kode_kewenangan: '00' | '01' | '02' | '03' | '04';
  authority_tier: 'Pusat' | 'Provinsi' | 'Kab/Kota' | 'KEK' | 'KPBPB';
  authority_name: string;
  designated_verifier_agency: string;
  matched_rule_id: string;
  matched_rule_desc: string;
  statutory_sla_days: number;
}

/**
 * STAGE 1 DMN: Evaluates KBLI scope & business scale
 */
export function evaluateStage1KbliRequirements(
  kbliCode: string,
  scopeSequence = 1,
  businessScale: 'Mikro' | 'Kecil' | 'Menengah' | 'Besar' = 'Besar'
): Stage1RequirementsResult {
  const cleanCode = kbliCode.trim();

  // KBLI 36001: Pengambilan, Penampungan & Penyaluran Air Minum
  if (cleanCode === '36001') {
    const isHighScale = businessScale === 'Besar' || businessScale === 'Menengah';
    return {
      risk_tier: isHighScale ? 'MT' : 'MR',
      statutory_sla_days: isHighScale ? 14 : 5,
      perizinan_usaha: isHighScale ? ['Izin Pengusahaan Air Minum', 'Sertifikat Standar'] : ['Sertifikat Standar'],
      parameters_schema: {
        title: 'Parameter Teknis Pengusahaan Air Minum (Permen PUPR 06/2021)',
        description: 'Parameter fisik kapasitas debit pengambilan air baku dan lintas wilayah sungai.',
        fields: [
          {
            key: 'water_intake_source',
            label: 'Sumber Pengambilan Air Baku',
            type: 'enum',
            required: true,
            default: 'groundwater',
            options: [
              { value: 'surface_water', label: 'Air Permukaan (Sungai / Danau)' },
              { value: 'groundwater', label: 'Air Tanah Dalam' },
              { value: 'seawater', label: 'Desalinasi Air Laut' }
            ],
            help_text: 'Tentukan sumber mata air atau badan air utama yang digunakan.'
          },
          {
            key: 'intake_capacity_debit',
            label: 'Rencana Debit Pengambilan Air Baku',
            type: 'number',
            unit: 'm³/bulan',
            min: 1,
            max: 500000,
            step: 1,
            required: true,
            default: 45,
            help_text: 'Ambang batas kewenangan: < 30 m³/bln (Kab/Kota), >= 30 m³/bln (Provinsi).'
          },
          {
            key: 'crosses_river_basin',
            label: 'Apakah lokasi berada pada Wilayah Sungai Lintas Provinsi?',
            type: 'boolean',
            required: true,
            default: false,
            help_text: 'Jika berada pada DAS Lintas Provinsi, kewenangan langsung dialihkan ke Kementerian PUPR (Pusat).'
          }
        ]
      }
    };
  }

  // KBLI 03111: Penangkapan Ikan Laut
  if (cleanCode === '03111') {
    return {
      risk_tier: 'MT',
      statutory_sla_days: 14,
      perizinan_usaha: ['Surat Izin Usaha Perikanan (SIUP)', 'Surat Izin Penangkapan Ikan (SIPI)'],
      parameters_schema: {
        title: 'Parameter Teknis Penangkapan Ikan Laut (Permen KKP 10/2021)',
        description: 'Parameter tonase kapal penangkap ikan dan batas zona wilayah penangkapan laut.',
        fields: [
          {
            key: 'vessel_tonnage_gt',
            label: 'Ukuran Tonase Kapal Penangkap Ikan (Gross Tonnage)',
            type: 'number',
            unit: 'GT',
            min: 1,
            max: 1000,
            step: 1,
            required: true,
            default: 28,
            help_text: 'Ambang kewenangan: < 5 GT (Kab/Kota), 5-30 GT (Provinsi), > 30 GT (KKP Pusat).'
          },
          {
            key: 'marine_fishing_zone',
            label: 'Wilayah Jalur Penangkapan Ikan',
            type: 'enum',
            required: true,
            default: '4_to_12_nm',
            options: [
              { value: 'coastal_under_4nm', label: 'Jalur I A: Pesisir s.d 4 Mil Laut' },
              { value: '4_to_12_nm', label: 'Jalur II: Wilayah Perairan 4 s.d 12 Mil Laut' },
              { value: 'above_12nm_zeei', label: 'Jalur III: Di atas 12 Mil Laut / ZEEI / Laut Lepas' }
            ],
            help_text: 'Wilayah perairan > 12 mil laut atau ZEEI menjadi kewenangan penuh Menteri Kelautan & Perikanan.'
          },
          {
            key: 'fishing_gear_type',
            label: 'Jenis Alat Tangkap yang Digunakan',
            type: 'enum',
            required: true,
            default: 'purse_seine',
            options: [
              { value: 'purse_seine', label: 'Pukat Cincin (Purse Seine Pelagis)' },
              { value: 'drift_longline', label: 'Rawai Hanyut (Drift Longline)' },
              { value: 'gillnet', label: 'Jaring Insang Hanyut (Drift Gillnet)' },
              { value: 'pole_and_line', label: 'Pancing Huhate (Pole and Line)' }
            ]
          }
        ]
      }
    };
  }

  // KBLI 01285: Perkebunan Lada & Rempah-Rempah
  if (cleanCode === '01285') {
    return {
      risk_tier: 'MR',
      statutory_sla_days: 5,
      perizinan_usaha: ['NIB (Nomor Induk Berusaha)', 'Sertifikat Standar Usaha Perkebunan'],
      parameters_schema: {
        title: 'Parameter Teknis Usaha Perkebunan Lada (Permen Pertanian 15/2021)',
        description: 'Parameter luas areal budidaya dan fasilitas unit pengolahan hasil panen.',
        fields: [
          {
            key: 'plantation_area_ha',
            label: 'Luas Areal Kebun Tanaman',
            type: 'number',
            unit: 'Hektar (Ha)',
            min: 0.1,
            max: 10000,
            step: 0.5,
            required: true,
            default: 15,
            help_text: 'Areal kebun >= 25 Ha memerlukan penilaian kelayakan teknis unit perkebunan.'
          },
          {
            key: 'processing_facility_type',
            label: 'Unit Pengolahan Hasil Panen',
            type: 'enum',
            required: true,
            default: 'drying_cleaning',
            options: [
              { value: 'drying_cleaning', label: 'Pembersihan & Pengeringan Biji Lada Mandiri' },
              { value: 'milling_grinding', label: 'Penggilingan / Bubuk Halus Terstandar' },
              { value: 'essential_oil', label: 'Penyulingan Minyak Atsiri (Oleoresin)' }
            ]
          },
          {
            key: 'crosses_forest_area',
            label: 'Apakah lokasi berbatasan langsung dengan Hutan Lindung/Konservasi?',
            type: 'boolean',
            required: true,
            default: false
          }
        ]
      }
    };
  }

  // KBLI 10794: Industri Kerupuk, Keripik & Sejenisnya
  if (cleanCode === '10794') {
    return {
      risk_tier: 'R',
      statutory_sla_days: 0, // Otomatis
      perizinan_usaha: ['NIB (Perizinan Tunggal)', 'Sertifikat SPP-IRT / Halal'],
      parameters_schema: {
        title: 'Parameter Kapasitas Produksi Kerupuk & Makanan Ringan (Kemenperin)',
        description: 'Parameter kapasitas harian dan sumber energi pengeringan.',
        fields: [
          {
            key: 'daily_production_capacity_kg',
            label: 'Kapasitas Produksi Harian',
            type: 'number',
            unit: 'Kg / Hari',
            min: 5,
            max: 50000,
            step: 10,
            required: true,
            default: 300,
            help_text: 'Produksi > 1.000 kg/hari dialihkan ke verifikasi teknis Dinas Perindustrian.'
          },
          {
            key: 'fuel_energy_type',
            label: 'Sumber Energi Mesin Penggorengan/Oven',
            type: 'enum',
            required: true,
            default: 'lpg',
            options: [
              { value: 'lpg', label: 'Gas LPG / Gas Alam PGN' },
              { value: 'electric', label: 'Listrik Industri (Oven Listrik)' },
              { value: 'biomass', label: 'Biomassa / Kayu Bakar Legal' }
            ]
          }
        ]
      }
    };
  }

  // Standard Fallback for other KBLIs
  return {
    risk_tier: businessScale === 'Besar' ? 'MT' : 'MR',
    statutory_sla_days: businessScale === 'Besar' ? 14 : 5,
    perizinan_usaha: ['NIB', 'Sertifikat Standar Terverifikasi'],
    parameters_schema: {
      title: `Ketentuan Kapasitas Operasional KBLI ${cleanCode}`,
      description: 'Parameter teknis umum skala kegiatan usaha.',
      fields: [
        {
          key: 'production_capacity_annual',
          label: 'Estimasi Kapasitas Produksi / Layanan Tahunan',
          type: 'number',
          unit: 'Unit / Tahun',
          min: 1,
          max: 10000000,
          required: true,
          default: 1200
        },
        {
          key: 'hazardous_material_flag',
          label: 'Apakah menggunakan bahan berbahaya & beracun (B3)?',
          type: 'boolean',
          required: true,
          default: false
        }
      ]
    }
  };
}

/**
 * STAGE 2 DMN: Evaluates Authority Routing
 * Implements deterministic decision tables from Section 6.2
 */
export function evaluateStage2AuthorityRouting(input: AuthorityRoutingInput): AuthorityRoutingResult {
  const {
    kbli_code,
    status_penanaman_modal,
    is_cross_prov,
    is_cross_kab,
    zone_code,
    zone_name,
    dynamic_params
  } = input;

  const cleanKbli = kbli_code.trim();

  // RULE 1: Foreign Investment (PMA) Absolute Routing to Pusat ('00')
  if (status_penanaman_modal === '01') {
    return {
      kode_kewenangan: '00',
      authority_tier: 'Pusat',
      authority_name: 'Menteri Investasi / Kepala BKPM RI',
      designated_verifier_agency: 'Deputi Bidang Pelayanan Penanaman Modal (BKPM Pusat)',
      matched_rule_id: 'RULE_PMA_NATIONAL_00',
      matched_rule_desc: 'Sesuai BKPM 4/2021 & PP 5/2021: Seluruh entitas Penanaman Modal Asing (PMA) menjadi kewenangan mutlak Pemerintah Pusat.',
      statutory_sla_days: 14
    };
  }

  // RULE 2: Cross-Provincial Boundary -> Pusat ('00')
  if (is_cross_prov) {
    return {
      kode_kewenangan: '00',
      authority_tier: 'Pusat',
      authority_name: 'Kementerian Koordinator / Kementerian Teknis Terkait',
      designated_verifier_agency: 'Direktorat Jenderal Sektoral Kementerian Pusat',
      matched_rule_id: 'RULE_SPATIAL_CROSS_PROV_00',
      matched_rule_desc: 'Analisis spasial mendeteksi tapak proyek memotong batas administratif antar-Provinsi -> Kewenangan Pusat.',
      statutory_sla_days: 14
    };
  }

  // RULE 3: Special Economic Zone (KEK) -> Administrator KEK ('03')
  if (zone_code === '03') {
    return {
      kode_kewenangan: '03',
      authority_tier: 'KEK',
      authority_name: `Administrator Kawasan Ekonomi Khusus (${zone_name || 'KEK'})`,
      designated_verifier_agency: `Administrator Pelayanan Terpadu Satu Pintu ${zone_name || 'KEK'}`,
      matched_rule_id: 'RULE_ZONE_KEK_03',
      matched_rule_desc: 'Tapak proyek berada di dalam deliniasi Kawasan Ekonomi Khusus (KEK) -> Kewenangan Administrator KEK.',
      statutory_sla_days: 5
    };
  }

  // RULE 4: Free Trade Zone (KPBPB) -> BP Batam / Badan Pengusahaan ('04')
  if (zone_code === '04') {
    return {
      kode_kewenangan: '04',
      authority_tier: 'KPBPB',
      authority_name: 'Badan Pengusahaan Kawasan Perdagangan Bebas & Pelabuhan Bebas (BP Batam)',
      designated_verifier_agency: 'Direktorat Pelayanan Terpadu Satu Pintu BP Batam',
      matched_rule_id: 'RULE_ZONE_KPBPB_04',
      matched_rule_desc: 'Tapak proyek berada di dalam Kawasan Perdagangan Bebas dan Pelabuhan Bebas (KPBPB) -> Kewenangan Badan Pengusahaan.',
      statutory_sla_days: 5
    };
  }

  // RULE 5: Cross-Regency / Cross-Kabupaten/Kota -> Provinsi ('01')
  if (is_cross_kab) {
    return {
      kode_kewenangan: '01',
      authority_tier: 'Provinsi',
      authority_name: 'Gubernur (DPMPTSP Provinsi)',
      designated_verifier_agency: 'Dinas Penanaman Modal & PTSP Provinsi Terkait',
      matched_rule_id: 'RULE_SPATIAL_CROSS_KAB_01',
      matched_rule_desc: 'Analisis spasial mendeteksi poligon melintasi batas lebih dari 1 Kabupaten/Kota -> Kewenangan dialihkan ke Provinsi.',
      statutory_sla_days: 10
    };
  }

  // ==========================================
  // SECTOR-SPECIFIC DECISION TABLES (KBLI)
  // ==========================================

  // KBLI 36001: Air Minum
  if (cleanKbli === '36001') {
    const debit = Number(dynamic_params.intake_capacity_debit) || 0;
    const crossesRiverBasin = Boolean(dynamic_params.crosses_river_basin);

    if (crossesRiverBasin) {
      return {
        kode_kewenangan: '00',
        authority_tier: 'Pusat',
        authority_name: 'Menteri Pekerjaan Umum dan Perumahan Rakyat (PUPR)',
        designated_verifier_agency: 'Balai Besar Wilayah Sungai (BBWS) / Ditjen Sumber Daya Air',
        matched_rule_id: 'RULE_36001_RIVER_BASIN_00',
        matched_rule_desc: 'Intake berada pada Wilayah Sungai Lintas Provinsi -> Kewenangan Balai Besar Wilayah Sungai PUPR Pusat.',
        statutory_sla_days: 14
      };
    }

    if (debit >= 30) {
      return {
        kode_kewenangan: '01',
        authority_tier: 'Provinsi',
        authority_name: 'Gubernur (Dinas ESDM / PUPR Provinsi)',
        designated_verifier_agency: 'DPMPTSP Provinsi (Seksi Pengendalian Sumber Daya Air)',
        matched_rule_id: 'RULE_36001_DEBIT_GE_30_01',
        matched_rule_desc: 'Kapasitas debit pengambilan air baku >= 30 m³/bulan -> Kewenangan Pemerintah Provinsi.',
        statutory_sla_days: 10
      };
    }

    return {
      kode_kewenangan: '02',
      authority_tier: 'Kab/Kota',
      authority_name: 'Bupati / Walikota',
      designated_verifier_agency: 'DPMPTSP Kabupaten/Kota (Seksi Perizinan Air Tanah)',
      matched_rule_id: 'RULE_36001_DEBIT_LT_30_02',
      matched_rule_desc: 'Kapasitas debit pengambilan air baku < 30 m³/bulan pada satu wilayah tunggal -> Kewenangan Kabupaten/Kota.',
      statutory_sla_days: 5
    };
  }

  // KBLI 03111: Penangkapan Ikan Laut
  if (cleanKbli === '03111') {
    const vesselGt = Number(dynamic_params.vessel_tonnage_gt) || 0;
    const marineZone = dynamic_params.marine_fishing_zone || '';

    if (vesselGt > 30 || marineZone === 'above_12nm_zeei') {
      return {
        kode_kewenangan: '00',
        authority_tier: 'Pusat',
        authority_name: 'Menteri Kelautan dan Perikanan (KKP RI)',
        designated_verifier_agency: 'Direktorat Perizinan dan Kenelayanan (Ditjen Perikanan Tangkap KKP)',
        matched_rule_id: 'RULE_03111_GT_GT_30_00',
        matched_rule_desc: 'Kapal perikanan > 30 GT atau beroperasi di Jalur III (> 12 Mil / ZEEI) -> Kewenangan Menteri KKP Pusat.',
        statutory_sla_days: 14
      };
    }

    if (vesselGt >= 5 || marineZone === '4_to_12_nm') {
      return {
        kode_kewenangan: '01',
        authority_tier: 'Provinsi',
        authority_name: 'Gubernur (Dinas Kelautan dan Perikanan Provinsi)',
        designated_verifier_agency: 'Dinas Kelautan & Perikanan Provinsi (Bidang Perikanan Tangkap)',
        matched_rule_id: 'RULE_03111_GT_5_30_01',
        matched_rule_desc: 'Kapal perikanan 5 s.d 30 GT pada Jalur II (4-12 Mil Laut) -> Kewenangan Gubernur / Provinsi.',
        statutory_sla_days: 10
      };
    }

    return {
      kode_kewenangan: '02',
      authority_tier: 'Kab/Kota',
      authority_name: 'Bupati / Walikota (Dinas Perikanan Kab/Kota)',
      designated_verifier_agency: 'Dinas Perikanan Kabupaten/Kota (Pelayanan Nelayan Kecil)',
      matched_rule_id: 'RULE_03111_GT_LT_5_02',
      matched_rule_desc: 'Kapal perikanan nelayan kecil < 5 GT di wilayah perairan pesisir <= 4 Mil -> Kewenangan Kabupaten/Kota.',
      statutory_sla_days: 5
    };
  }

  // KBLI 01285: Lada / Perkebunan
  if (cleanKbli === '01285') {
    const areaHa = Number(dynamic_params.plantation_area_ha) || 0;
    if (areaHa >= 25) {
      return {
        kode_kewenangan: '01',
        authority_tier: 'Provinsi',
        authority_name: 'Gubernur (Dinas Perkebunan Provinsi)',
        designated_verifier_agency: 'DPMPTSP Provinsi (Bidang Perizinan Pertanian & Perkebunan)',
        matched_rule_id: 'RULE_01285_AREA_GE_25_01',
        matched_rule_desc: 'Luas kebun tanaman lada >= 25 Hektar -> Kewenangan Pemerintah Provinsi.',
        statutory_sla_days: 10
      };
    }
    return {
      kode_kewenangan: '02',
      authority_tier: 'Kab/Kota',
      authority_name: 'Bupati / Walikota',
      designated_verifier_agency: 'Dinas Pertanian & Perkebunan Kabupaten/Kota',
      matched_rule_id: 'RULE_01285_AREA_LT_25_02',
      matched_rule_desc: 'Luas kebun perkebunan rakyat < 25 Hektar pada wilayah tunggal -> Kewenangan Kabupaten/Kota.',
      statutory_sla_days: 5
    };
  }

  // DEFAULT FALLBACK FOR OTHER KBLIS
  return {
    kode_kewenangan: '02',
    authority_tier: 'Kab/Kota',
    authority_name: 'Bupati / Walikota',
    designated_verifier_agency: 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP Kab/Kota)',
    matched_rule_id: 'RULE_DEFAULT_DOMESTIC_LOCAL_02',
    matched_rule_desc: 'Proyek PMDN dalam satu wilayah administratif kabupaten/kota standar -> Kewenangan Bupati/Walikota.',
    statutory_sla_days: 5
  };
}
