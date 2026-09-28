<template>
  <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs transition bg-white">
    <!-- Accordion Toggle Button -->
    <button
      type="button"
      @click="$emit('toggle')"
      class="w-full px-5 py-4 flex items-center justify-between text-left transition select-none bg-slate-50 hover:bg-slate-100/80"
    >
      <div class="flex items-center space-x-3.5">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition"
          :class="[
            isCompleted ? 'bg-emerald-600 text-white' :
            isOpen ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
          ]"
        >
          {{ isCompleted ? '✓' : '2' }}
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-sm text-gray-900">Tahap 2: Persyaratan Dasar 1 — Kesesuaian Tata Ruang (KKPR) & Studio Spasial</h3>
            <span
              v-if="isCompleted"
              class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
            >
              Selesai
            </span>
            <span
              v-else-if="isOpen"
              class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
            >
              Aktif
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">
            Validasi lokasi tapak terhadap RDTR/RTRW, studio poligon GIS, dan integrasi aset perpustakaan lahan VFC.
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2 text-gray-400">
        <span class="text-xs font-semibold hidden sm:inline">{{ isOpen ? 'Tutup' : 'Buka' }}</span>
        <svg
          class="w-4 h-4 transform transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </button>

    <!-- Accordion Content -->
    <div v-show="isOpen" class="p-5 border-t border-gray-200 space-y-6 bg-white">
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-bold bg-blue-600 text-white px-2 py-0.5 rounded">PD-1</span>
          <h3 class="text-sm font-bold text-gray-900">Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR)</h3>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Validasi lokasi tapak usaha terhadap Rencana Tata Ruang (RTRW/RDTR). Berdasarkan skala usaha dan kawasan, sistem menentukan jalur otomatis atau verifikasi PKKPR.
        </p>
      </div>

      <!-- Site Asset Binder & Vector GIS Studio Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-gray-200 rounded-xl shadow-2xs">
        <div class="flex items-center space-x-2.5">
          <span class="p-2 bg-blue-100 text-blue-800 rounded-lg text-base">🗺️</span>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold text-gray-900">
                {{ permitStore.activeWizard.formData.spatial_parcel_binding_id ? 'Aset Lokasi Terikat dari VFC:' : 'Tapak Lokasi Proyek:' }}
              </span>
              <span class="text-blue-700 font-bold text-xs">{{ permitStore.activeWizard.formData.alamat_usaha }}</span>
            </div>
            <p class="text-[10px] text-gray-500 mt-0.5">
              Luas Lahan: {{ permitStore.activeWizard.formData.luas_tanah.toLocaleString('id-ID') }} m² • Status Tata Ruang: <strong>{{ permitStore.activeWizard.formData.rdtr_status }}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('open-spatial-picker')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <span>📂</span>
          <span>Pilih Aset dari VFC Lokasi</span>
        </button>
      </div>

      <!-- Embedded Interactive Vector GIS Map Canvas Studio -->
      <InteractiveGisStudio
        :initialCoordinates="permitStore.activeWizard.formData.polygon_coordinates"
        :siteName="permitStore.activeWizard.formData.alamat_usaha"
        :address="permitStore.activeWizard.formData.alamat_usaha"
        :isCrossKab="permitStore.activeWizard.formData.is_cross_kab"
        :isCrossProv="permitStore.activeWizard.formData.is_cross_prov"
        :zoneCode="permitStore.activeWizard.formData.zone_code"
        :zoneName="permitStore.activeWizard.formData.zone_name"
        @save-parcel="onStudioSaveParcel"
      />

      <!-- Matra & Tipe Lokasi -->
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Matra Posisi Lokasi</label>
            <select
              v-model="permitStore.activeWizard.formData.posisi_lokasi"
              class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold"
            >
              <option value="01">01 - Ruang Darat (ATR / BPN)</option>
              <option value="02">02 - Ruang Hutan (KLHK)</option>
              <option value="03">03 - Ruang Laut (KKP / KKPRL)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Tipe Lokasi Usaha</label>
            <select
              v-model="permitStore.activeWizard.formData.flag_kolektif"
              class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold"
            >
              <option value="N">Individual (Tapak Mandiri)</option>
              <option value="Y">Kolektif (Sewa Gedung / Mall / Ruko)</option>
            </select>
          </div>

          <div v-if="permitStore.activeWizard.formData.flag_kolektif === 'Y'">
            <label class="block font-bold text-gray-700 mb-1">Jenis Bangunan Kolektif</label>
            <select
              v-model="permitStore.activeWizard.formData.jenis_bangunan_kolektif"
              class="w-full p-2.5 border rounded-lg bg-white text-gray-900 font-semibold"
            >
              <option value="01">Gedung Perkantoran</option>
              <option value="02">Pusat Perbelanjaan / Mall</option>
              <option value="03">Ruko / Rukan</option>
              <option value="04">Pasar Rakyat</option>
            </select>
          </div>
        </div>

        <!-- Geospasial Coordinates & Address -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Garis Lintang (Latitude)</label>
            <input
              v-model.number="permitStore.activeWizard.formData.latitude"
              type="number"
              step="0.00001"
              class="w-full p-2.5 border rounded-lg font-mono"
            />
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Garis Bujur (Longitude)</label>
            <input
              v-model.number="permitStore.activeWizard.formData.longitude"
              type="number"
              step="0.00001"
              class="w-full p-2.5 border rounded-lg font-mono"
            />
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Luas Lahan</label>
            <input
              v-model.number="permitStore.activeWizard.formData.luas_tanah"
              type="number"
              class="w-full p-2.5 border rounded-lg font-mono"
            />
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Satuan Luas</label>
            <select
              v-model="permitStore.activeWizard.formData.satuan_luas_tanah"
              class="w-full p-2.5 border rounded-lg bg-gray-50 font-semibold"
            >
              <option value="m2">M² (Meter Persegi)</option>
              <option value="ha">Ha (Hektar)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="md:col-span-2">
            <label class="block font-bold text-gray-700 mb-1">Alamat Lengkap Usaha</label>
            <input
              v-model="permitStore.activeWizard.formData.alamat_usaha"
              type="text"
              class="w-full p-2.5 border rounded-lg"
            />
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Kode Pos</label>
            <input
              v-model="permitStore.activeWizard.formData.kode_pos"
              type="text"
              class="w-full p-2.5 border rounded-lg font-mono"
            />
          </div>
        </div>

        <!-- Kawasan Status Controls -->
        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-3">
          <span class="font-bold text-gray-900 block">Karakteristik & Status Peruntukan Wilayah:</span>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-gray-600 mb-1">Apakah Berada Dalam Kawasan?</label>
              <select v-model="permitStore.activeWizard.formData.flag_kawasan" class="w-full p-2 border rounded-lg bg-white font-semibold">
                <option value="Y">Ya (Kawasan Industri / KEK)</option>
                <option value="N">Tidak (Luar Kawasan)</option>
              </select>
            </div>

            <div v-if="permitStore.activeWizard.formData.flag_kawasan === 'Y'">
              <label class="block text-gray-600 mb-1">Jenis Kawasan</label>
              <select v-model="permitStore.activeWizard.formData.tipe_kawasan" class="w-full p-2 border rounded-lg bg-white font-semibold">
                <option value="01">Kawasan Industri</option>
                <option value="02">Kawasan Ekonomi Khusus (KEK)</option>
                <option value="03">Kawasan Pariwisata</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-600 mb-1">Ketersediaan RDTR Digital</label>
              <select v-model="permitStore.activeWizard.formData.flag_rdtr" class="w-full p-2 border rounded-lg bg-white font-semibold">
                <option value="Y">Ya (RDTR Terintegrasi Tersedia)</option>
                <option value="N">Tidak Ada RDTR</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Evaluation Result Banner -->
        <div
          :class="[
            'p-3.5 rounded-xl border text-xs',
            isKkprAutomatic
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          ]"
        >
          <div class="flex items-center space-x-2 font-bold">
            <span>{{ isKkprAutomatic ? '⚡ Jalur Otomatis: Pernyataan Mandiri KKPR' : '⏳ Jalur Verifikasi Manual: PKKPR ATR/BPN' }}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white border">
              Status: {{ isKkprAutomatic ? 'Terbit Otomatis' : 'Perlu Penilaian 20 Hari' }}
            </span>
          </div>
          <p class="text-[11px] mt-1 leading-relaxed">
            {{ isKkprAutomatic
              ? 'Karena proyek Anda berada dalam kawasan industri, memiliki RDTR, atau berskala UMK, KKPR diterbitkan langsung tanpa perlu pembayaran PNBP verifikasi.'
              : 'Karena lokasi berada di luar kawasan terintegrasi dan berskala non-UMK, pengajuan memerlukan konfirmasi intensitas ruang dan verifikasi teknis oleh Kementerian ATR/BPN.'
            }}
          </p>
        </div>

        <!-- Conditional PKKPR Intensity Form (Only if Manual Verification) -->
        <div v-if="!isKkprAutomatic" class="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-xs space-y-3">
          <h5 class="font-bold text-gray-900">Formulir Konfirmasi Intensitas Ruang & Penguasaan Lahan (PKKPR)</h5>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label class="block text-gray-600 mb-1">GSB (Meter)</label>
              <input v-model.number="permitStore.activeWizard.formData.garis_sempadan_bangunan" type="number" class="w-full p-2 border rounded-lg bg-white font-mono" />
            </div>
            <div>
              <label class="block text-gray-600 mb-1">KDB Maksimum (%)</label>
              <input v-model.number="permitStore.activeWizard.formData.koefisien_dasar_bangunan" type="number" class="w-full p-2 border rounded-lg bg-white font-mono" />
            </div>
            <div>
              <label class="block text-gray-600 mb-1">KLB Maksimum (Rasio)</label>
              <input v-model.number="permitStore.activeWizard.formData.koefisien_lantai_bangunan" type="number" step="0.1" class="w-full p-2 border rounded-lg bg-white font-mono" />
            </div>
            <div>
              <label class="block text-gray-600 mb-1">KDH Minimum (%)</label>
              <input v-model.number="permitStore.activeWizard.formData.koefisien_dasar_hijau" type="number" class="w-full p-2 border rounded-lg bg-white font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-gray-600 mb-1">Status Penguasaan Lahan</label>
              <select v-model="permitStore.activeWizard.formData.status_penguasaan_lahan" class="w-full p-2 border rounded-lg bg-white">
                <option value="02">Milik Sendiri</option>
                <option value="01">Sewa</option>
                <option value="03">Pinjam Pakai</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-600 mb-1">Jenis Dokumen Hak Tanah</label>
              <select v-model="permitStore.activeWizard.formData.jenis_dokumen_tanah" class="w-full p-2 border rounded-lg bg-white font-semibold">
                <option value="02">HGB (Hak Guna Bangunan)</option>
                <option value="01">SHM (Sertifikat Hak Milik)</option>
                <option value="03">HGU (Hak Guna Usaha)</option>
                <option value="04">Perjanjian Sewa</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-600 mb-1">Nomor Dokumen Tanah</label>
              <input v-model="permitStore.activeWizard.formData.nomor_dokumen_tanah" type="text" class="w-full p-2 border rounded-lg bg-white font-mono" />
            </div>
          </div>
        </div>

        <!-- DOCUMENT SLOT: Bukti Hak Tanah / Peta Geospasial -->
        <div class="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-xs text-gray-900 block">Lampiran Bukti Penguasaan Lahan / Peta GIS</span>
              <span class="text-[11px] text-gray-500">Wajib dilampirkan dari Virtual Filing Cabinet atau diunggah baru</span>
            </div>
            <span class="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
              Target Folder: LOKASI
            </span>
          </div>

          <!-- Existing VFC Document Detected or Upload New -->
          <div v-if="attachedLandDoc" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div class="flex items-center space-x-2 text-xs">
              <span class="text-base">📄</span>
              <div>
                <span class="font-bold text-emerald-950 block">{{ attachedLandDoc.title }}</span>
                <span class="text-[10px] font-mono text-emerald-700">{{ attachedLandDoc.fileName }} • {{ attachedLandDoc.fileSize }} • Hash: {{ attachedLandDoc.sha256.slice(0, 14) }}...</span>
              </div>
            </div>
            <span class="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-300">
              ✓ Terlampir dari VFC
            </span>
          </div>

          <!-- Inline Uploader if not attached yet -->
          <div v-else class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-600 font-semibold">Belum ada dokumen tanah terlampir untuk proyek ini.</p>
            <p class="text-[10px] text-gray-400 mt-0.5">Pilih dokumen yang ada di Filing Cabinet atau unggah file baru langsung ke VFC Vault:</p>
            <div class="mt-3 flex justify-center items-center space-x-3">
              <select
                v-if="availableLandDocs.length > 0"
                @change="onSelectExistingDoc($event, 'LOKASI')"
                class="text-xs p-2 border rounded-lg bg-gray-50"
              >
                <option value="">-- Pilih dari Filing Cabinet --</option>
                <option v-for="d in availableLandDocs" :key="d.id" :value="d.id">
                  {{ d.title }} ({{ d.fileName }})
                </option>
              </select>

              <label class="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition">
                <span>+ Unggah Dokumen Tanah Baru</span>
                <input type="file" class="hidden" @change="onInlineUpload($event, 'LOKASI', 'Sertifikat Tanah & Peta Lahan')" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          @click="$emit('save')"
          class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
        >
          <span>💾</span>
          <span>Simpan</span>
        </button>
        <button
          type="button"
          @click="$emit('next')"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <span>Lanjut</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermitStore } from '../../stores/permitStore';
import { useVfcStore } from '../../stores/vfcStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useSpatialStore, type SpatialParcelAsset } from '../../stores/spatialStore';
import InteractiveGisStudio from '../InteractiveGisStudio.vue';

defineProps<{
  isOpen: boolean;
  isCompleted: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
  (e: 'save'): void;
  (e: 'next'): void;
  (e: 'open-spatial-picker'): void;
}>();

const permitStore = usePermitStore();
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();
const spatialStore = useSpatialStore();

const isKkprAutomatic = computed(() => {
  const form = permitStore.activeWizard.formData;
  return form.flag_kawasan === 'Y' || form.flag_rdtr === 'Y' || form.flag_umkm === 'Y';
});

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

const availableLandDocs = computed(() => {
  return currentCompanyDocs.value.filter(
    (d) => d.category === 'LOKASI' || d.category === 'PERUSAHAAN'
  );
});

const attachedLandDoc = computed(() => {
  return currentCompanyDocs.value.find(
    (d) =>
      permitStore.activeWizard.selectedVfcDocIds.includes(d.id) &&
      (d.category === 'LOKASI' || d.category === 'PERUSAHAAN')
  );
});

function onStudioSaveParcel(parcelData: Partial<SpatialParcelAsset>) {
  spatialStore.addParcel({
    company_id: companyStore.activeCompanyId,
    site_name: parcelData.site_name || 'Plot Proyek KBLI ' + permitStore.activeWizard.kbli?.kbli_code,
    address: parcelData.address || permitStore.activeWizard.formData.alamat_usaha,
    region_code: '32.01.01.2001',
    province: permitStore.activeWizard.formData.provinsi,
    regency: permitStore.activeWizard.formData.kab_kota,
    district: permitStore.activeWizard.formData.kecamatan,
    village: permitStore.activeWizard.formData.kelurahan,
    postal_code: permitStore.activeWizard.formData.kode_pos,
    position: permitStore.activeWizard.formData.posisi_lokasi,
    latitude: parcelData.latitude || permitStore.activeWizard.formData.latitude,
    longitude: parcelData.longitude || permitStore.activeWizard.formData.longitude,
    polygon_coordinates: parcelData.polygon_coordinates || permitStore.activeWizard.formData.polygon_coordinates,
    area_sqm: parcelData.area_sqm || permitStore.activeWizard.formData.luas_tanah,
    area_ha: parcelData.area_ha || (permitStore.activeWizard.formData.luas_tanah / 10000),
    is_cross_kab: parcelData.is_cross_kab || false,
    is_cross_prov: parcelData.is_cross_prov || false,
    zone_code: parcelData.zone_code || 'STANDARD',
    zone_name: parcelData.zone_name || 'Kawasan Industri',
    rdtr_status: parcelData.rdtr_status || 'SESUAI',
    rdtr_zoning_code: 'KPI',
    rdtr_sub_zone: parcelData.rdtr_sub_zone || 'Kawasan Peruntukan Industri (KPI)',
    ownership_doc_type: permitStore.activeWizard.formData.jenis_dokumen_tanah,
    ownership_doc_number: permitStore.activeWizard.formData.nomor_dokumen_tanah
  }).then((p) => {
    permitStore.bindSpatialParcel(p);
    alert(`✅ Aset Lokasi "${p.site_name}" berhasil disimpan ke VFC dan dikaitkan ke formulir KKPR!`);
  });
}

function onSelectExistingDoc(e: Event, category: string) {
  const target = e.target as HTMLSelectElement;
  const docId = target.value;
  if (docId && !permitStore.activeWizard.selectedVfcDocIds.includes(docId)) {
    permitStore.activeWizard.selectedVfcDocIds.push(docId);
  }
}

async function onInlineUpload(e: Event, category: string, defaultTitle: string) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;

  const newDoc = await vfcStore.addDocument({
    companyId: companyStore.activeCompanyId,
    category,
    title: `${defaultTitle} (${permitStore.activeWizard.kbli?.kbli_code || 'VFC'})`,
    fileName: file.name,
    fileSize: fileSize === '0.0 MB' ? '850 KB' : fileSize,
    url: '#'
  });

  if (!permitStore.activeWizard.selectedVfcDocIds.includes(newDoc.id)) {
    permitStore.activeWizard.selectedVfcDocIds.push(newDoc.id);
  }

  await permitStore.persistDraft();
  target.value = '';
}
</script>
