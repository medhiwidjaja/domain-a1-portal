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
          {{ isCompleted ? '✓' : '4' }}
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-sm text-gray-900">Tahap 4: Persyaratan Dasar 3 — Bangunan Gedung (PBG & SLF)</h3>
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
            Penilaian teknis arsitektur dan keselamatan bangunan gedung. Diintegrasikan dengan sistem SIMBG Kementerian PUPR.
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
          <span class="text-sm font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">PD-3</span>
          <h3 class="text-sm font-bold text-gray-900">Persetujuan Bangunan Gedung (PBG) & Sertifikat Laik Fungsi (SLF)</h3>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Penilaian teknis arsitektur dan keselamatan bangunan gedung. Diintegrasikan dengan sistem SIMBG Kementerian PUPR.
        </p>
      </div>

      <div class="space-y-4">
        <!-- Screening Question: Need Building? -->
        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <label class="block font-bold text-gray-900 mb-1 text-sm">
            Apakah kegiatan operasional ini memerlukan konstruksi bangunan fisik baru atau renovasi struktur gedung?
          </label>
          <div class="flex items-center space-x-4 mt-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value="Y" v-model="permitStore.activeWizard.formData.memerlukan_bangunan" class="text-blue-600" />
              <span class="font-bold text-gray-800">Ya, Memerlukan Bangunan Gedung Baru / Modifikasi</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value="N" v-model="permitStore.activeWizard.formData.memerlukan_bangunan" class="text-blue-600" />
              <span class="font-bold text-gray-800">Tidak (Bypass: Menggunakan Lahan Terbuka, Sewa Ruang, atau Penangkapan Laut)</span>
            </label>
          </div>
        </div>

        <!-- Branch A: BYPASS PBG & SLF -->
        <div v-if="permitStore.activeWizard.formData.memerlukan_bangunan === 'N'" class="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
          <div class="flex items-center space-x-2 font-bold text-emerald-950">
            <span class="text-lg">✨</span>
            <span>Bypass PBG & SLF: Persyaratan Dasar Terpenuhi Otomatis</span>
          </div>
          <p class="text-[11px] text-emerald-900 leading-relaxed">
            Karena operasional kegiatan usaha Anda tidak mendirikan atau mengubah konstruksi fisik bangunan baru, Anda dibebaskan dari persyaratan persetujuan PBG dan penerbitan SLF di SIMBG PUPR.
          </p>
        </div>

        <!-- Branch B: FILL PBG FORM (If Need Building) -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Jenis Izin Bangunan</label>
              <select v-model="permitStore.activeWizard.formData.jenisIzinBangunan" class="w-full p-2.5 border rounded-lg bg-gray-50 font-semibold">
                <option value="pbg">PBG dan SLF Baru (Konstruksi Baru)</option>
                <option value="slf">SLF untuk Bangunan Terbangun (Gedung Eksisting)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-700 mb-1">Sub Fungsi Pemanfaatan</label>
              <select v-model="permitStore.activeWizard.formData.subFungsiUntukBangunan" class="w-full p-2.5 border rounded-lg bg-white font-semibold">
                <option value="03">03 - Perindustrian / Pabrik / Fasilitas Olah</option>
                <option value="01">01 - Perkantoran</option>
                <option value="02">02 - Perdagangan</option>
                <option value="07">07 - Gudang / Tempat Penyimpanan</option>
                <option value="08">08 - Peternakan</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-700 mb-1">Nama Gedung / Bangunan</label>
              <input v-model="permitStore.activeWizard.formData.namaBangunan" type="text" class="w-full p-2.5 border rounded-lg" />
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Luas Total Lantai (M²)</label>
              <input v-model.number="permitStore.activeWizard.formData.luasTotalBangunan" type="number" class="w-full p-2.5 border rounded-lg font-mono" />
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Tinggi Bangunan (M)</label>
              <input v-model.number="permitStore.activeWizard.formData.tinggiBangunan" type="number" step="0.5" class="w-full p-2.5 border rounded-lg font-mono" />
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Jumlah Lantai</label>
              <input v-model.number="permitStore.activeWizard.formData.jumlahLantai" type="number" class="w-full p-2.5 border rounded-lg font-mono" />
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Kapasitas Penghuni (Orang)</label>
              <input v-model.number="permitStore.activeWizard.formData.jumlahEstimasiPenghuni" type="number" class="w-full p-2.5 border rounded-lg font-mono" />
            </div>
          </div>

          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs flex items-center space-x-2">
            <input type="checkbox" id="checkSimbg" v-model="permitStore.activeWizard.formData.disclaimerSimbg" class="w-4 h-4 text-blue-600 rounded" />
            <label for="checkSimbg" class="text-blue-900 font-medium">
              Saya bersedia melanjutkan proses verifikasi gambar teknis struktur dan arsitektur pada sistem SIMBG Kementerian PUPR.
            </label>
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
import { usePermitStore } from '../../stores/permitStore';

defineProps<{
  isOpen: boolean;
  isCompleted: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
  (e: 'save'): void;
  (e: 'next'): void;
}>();

const permitStore = usePermitStore();
</script>
