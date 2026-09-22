<template>
  <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="bg-slate-900 text-white p-6">
      <h2 class="text-xl font-bold">Pencarian Kode KBLI 2020 & Preview Aturan DMN</h2>
      <p class="text-slate-300 text-sm mt-1">
        Cari klasifikasi KBLI 5-digit untuk menemukan tingkat risiko, persyaratan izin, kewenangan (Gubernur/Menteri), dan estimasi waktu pemrosesan secara transparan sebelum memulai pengajuan.
      </p>

      <!-- Search Controls -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="md:col-span-3 relative">
          <input
            v-model="permitStore.searchQuery"
            type="text"
            placeholder="Cari kode (03111), nama kegiatan (ikan), atau ruang lingkup..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <div>
          <select
            v-model="permitStore.selectedRiskFilter"
            class="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Tingkat Risiko</option>
            <option value="R">Rendah (R)</option>
            <option value="MR">Menengah Rendah (MR)</option>
            <option value="MT">Menengah Tinggi (MT)</option>
            <option value="TI">Tinggi (TI)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results List -->
    <div class="p-6">
      <div v-if="permitStore.filteredCatalog.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-base font-semibold">Kode atau kata kunci KBLI tidak ditemukan.</p>
        <p class="text-xs text-gray-400 mt-1">Coba gunakan kata kunci umum seperti "ikan", "restoran", "perdagangan".</p>
      </div>

      <div v-else class="space-y-4">
        <div class="text-xs text-gray-500 font-medium">
          Menampilkan <span class="font-bold text-gray-900">{{ permitStore.filteredCatalog.length }}</span> hasil klasifikasi KBLI
        </div>

        <div
          v-for="item in permitStore.filteredCatalog.slice(0, 15)"
          :key="item.kbli_code"
          class="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition bg-white"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                  KBLI {{ item.kbli_code }}
                </span>
                <span :class="getRiskBadgeClass(item.risk_code)">
                  Risiko: {{ item.risk_level }} ({{ item.risk_code }})
                </span>
                <span class="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md">
                  Kewenangan: {{ item.authority }}
                </span>
                <span class="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                  SLA: {{ item.processing_time }}
                </span>
              </div>

              <h3 class="font-bold text-gray-900 text-sm mt-2">{{ item.title }}</h3>
              <p class="text-xs text-gray-600 mt-1 line-clamp-2" v-if="item.scopes && item.scopes[0]">
                {{ item.scopes[0].title }}
              </p>
            </div>

            <div class="flex items-center space-x-3 shrink-0">
              <button
                @click="openDetailModal(item)"
                class="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Preview Aturan
              </button>
              <button
                @click="selectForSubmission(item)"
                class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
              >
                Pilih KBLI & Ajukan →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail DMN Modal -->
    <div v-if="detailModalKbli" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div class="flex justify-between items-center pb-4 border-b">
          <div>
            <span class="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              KBLI {{ detailModalKbli.kbli_code }}
            </span>
            <h3 class="text-lg font-bold text-gray-900 mt-1">{{ detailModalKbli.title }}</h3>
          </div>
          <button @click="detailModalKbli = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="mt-4 space-y-4">
          <!-- 4 Summary Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Tingkat Risiko</span>
              <span class="font-bold text-gray-900 text-sm">{{ detailModalKbli.risk_level }}</span>
            </div>
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Jenis Perizinan</span>
              <span class="font-bold text-blue-700 text-sm">{{ detailModalKbli.perizinan_usaha }}</span>
            </div>
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Kewenangan Verifikasi</span>
              <span class="font-bold text-gray-900 text-sm">{{ detailModalKbli.authority }}</span>
            </div>
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Waktu Pemrosesan SLA</span>
              <span class="font-bold text-emerald-700 text-sm">{{ detailModalKbli.processing_time }}</span>
            </div>
          </div>

          <!-- Requirements Checklist from YAML -->
          <div v-if="detailModalKbli.scopes[0] && detailModalKbli.scopes[0].licensing_requirements[0]">
            <h4 class="font-bold text-xs text-gray-900 mb-2">Persyaratan Dokumen & Legalitas Usaha:</h4>
            <ul class="space-y-1.5 text-xs text-gray-700 bg-slate-50 p-4 rounded-lg border">
              <li
                v-for="(req, idx) in detailModalKbli.scopes[0].licensing_requirements[0].requirements"
                :key="idx"
                class="flex items-start space-x-2"
              >
                <span class="text-blue-600 font-bold">•</span>
                <span>{{ req }}</span>
              </li>
              <li v-if="detailModalKbli.scopes[0].licensing_requirements[0].requirements.length === 0" class="text-gray-400 italic">
                Tidak ada dokumen prasyarat khusus (Otomatis diterbitkan).
              </li>
            </ul>
          </div>

          <!-- Obligations -->
          <div v-if="detailModalKbli.scopes[0] && detailModalKbli.scopes[0].licensing_requirements[0]">
            <h4 class="font-bold text-xs text-gray-900 mb-2">Kewajiban Pelaku Usaha Pasca-Izin:</h4>
            <ul class="space-y-1.5 text-xs text-gray-700 bg-amber-50/60 p-4 rounded-lg border border-amber-200">
              <li
                v-for="(ob, idx) in detailModalKbli.scopes[0].licensing_requirements[0].obligations"
                :key="idx"
                class="flex items-start space-x-2"
              >
                <span class="text-amber-600 font-bold">•</span>
                <span>{{ ob }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button
            @click="detailModalKbli = null"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Tutup
          </button>
          <button
            @click="selectForSubmission(detailModalKbli)"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
          >
            Lanjutkan Pengajuan dengan KBLI Ini →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePermitStore, type KbliItem } from '../stores/permitStore';

const permitStore = usePermitStore();
const detailModalKbli = ref<KbliItem | null>(null);

const emit = defineEmits(['select-kbli']);

function getRiskBadgeClass(code: string) {
  switch (code) {
    case 'R':
      return 'text-xs font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-md';
    case 'MR':
      return 'text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md';
    case 'MT':
      return 'text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md';
    case 'TI':
      return 'text-xs font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-md';
    default:
      return 'text-xs font-bold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-md';
  }
}

function openDetailModal(item: KbliItem) {
  detailModalKbli.value = item;
}

function selectForSubmission(item: KbliItem) {
  detailModalKbli.value = null;
  emit('select-kbli', item);
}
</script>

