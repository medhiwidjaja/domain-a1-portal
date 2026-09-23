<template>
  <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="bg-slate-900 text-white p-6">
      <h2 class="text-xl font-bold">Pencarian Kode KBLI 2020 & Preview Aturan DMN</h2>
      <p class="text-slate-300 text-sm mt-1">
        Cari klasifikasi KBLI 5-digit untuk menemukan tingkat risiko, persyaratan izin, kewenangan (Gubernur/Menteri), dan estimasi waktu pemrosesan secara transparan sebelum memulai pengajuan.
      </p>
    <!-- Header & Search Bar -->
    <div class="p-6 bg-slate-900 text-white">
      <div class="max-w-3xl">
        <span class="bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
          Katalog KBLI 2020 & Regulasi PP 28/2025
        </span>
        <h2 class="text-xl font-bold mt-2">Pencarian Klasifikasi Baku Lapangan Usaha Indonesia</h2>
        <p class="text-xs text-slate-300 mt-1">
          Daftar 200 KBLI lengkap dengan ruang lingkup kegiatan (scopes), tingkat risiko, kewenangan regulator, dan prasyarat perizinan.
        </p>
      </div>

      <!-- Search Controls -->
      <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <!-- Search & Filters -->
      <div class="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="md:col-span-3 relative">
          <input
            v-model="permitStore.searchQuery"
            type="text"
            placeholder="Cari kode (03111), nama kegiatan (ikan), atau ruang lingkup..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Cari kode KBLI (mis: 01285, 03111), judul kegiatan, atau kata kunci komoditas..."
            class="w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <option value="R">Rendah (R / RE)</option>
            <option value="MR">Menengah Rendah (MR)</option>
            <option value="MT">Menengah Tinggi (MT)</option>
            <option value="TI">Tinggi (TI)</option>
            <option value="TI">Tinggi (T / TI)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results List -->
    <div class="p-6">
      <div v-if="permitStore.filteredCatalog.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-base font-semibold">Kode atau kata kunci KBLI tidak ditemukan.</p>
        <p class="text-xs text-gray-400 mt-1">Coba gunakan kata kunci umum seperti "ikan", "restoran", "perdagangan".</p>
        <p class="text-xs text-gray-400 mt-1">Coba gunakan kata kunci umum seperti "01285", "jagung", "ikan", atau "rimpang".</p>
      </div>

      <div v-else class="space-y-4">
      <div v-else class="space-y-6">
        <div class="text-xs text-gray-500 font-medium">
          Menampilkan <span class="font-bold text-gray-900">{{ permitStore.filteredCatalog.length }}</span> hasil klasifikasi KBLI
        </div>

        <!-- KBLI CARDS -->
        <div
          v-for="item in permitStore.filteredCatalog.slice(0, displayLimit)"
          :key="item.kbli_code"
          class="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition bg-white"
          class="border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition bg-white space-y-4"
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
          <!-- KBLI Header Row -->
          <div class="border-b border-gray-100 pb-3">
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
              <span class="text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-md ml-auto">
                {{ item.scopes?.length || 0 }} Ruang Lingkup
              </span>
            </div>

              <h3 class="font-bold text-gray-900 text-sm mt-2">{{ item.title }}</h3>
              <p class="text-xs text-gray-600 mt-1 line-clamp-2" v-if="item.scopes && item.scopes[0]">
                {{ item.scopes[0].title }}
              </p>
            <h3 class="font-bold text-gray-900 text-base mt-2">{{ item.title }}</h3>
          </div>

          <!-- SCOPES SECTION: EACH SCOPE WITH TITLE & ACTIONS -->
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs text-gray-700 font-bold">
              <span class="flex items-center space-x-1.5">
                <span>📑</span>
                <span>Pilih Ruang Lingkup Kegiatan (Scope) KBLI:</span>
              </span>
              <span class="text-[11px] text-gray-400 font-normal">
                Setiap ruang lingkup memiliki persyaratan & kewenangan tersendiri
              </span>
            </div>

            <div class="flex items-center space-x-3 shrink-0">
              <button
                @click="openDetailModal(item)"
                class="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            <!-- List of Scopes -->
            <div class="space-y-2.5">
              <div
                v-for="scope in item.scopes"
                :key="scope.sequence"
                class="border border-gray-200/90 rounded-xl p-4 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-300 transition"
              >
                Preview Aturan
              </button>
              <button
                @click="selectForSubmission(item)"
                class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
              >
                Pilih KBLI & Ajukan →
              </button>
                <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <!-- Scope Info -->
                  <div class="space-y-1.5 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs font-bold bg-blue-700 text-white px-2 py-0.5 rounded font-mono">
                        Ruang Lingkup {{ scope.sequence }}
                      </span>
                      <span
                        v-if="scope.licensing_requirements?.[0]?.risk_level"
                        :class="getRiskBadgeClass(scope.licensing_requirements[0].risk_code || item.risk_code)"
                      >
                        {{ scope.licensing_requirements[0].risk_level }} ({{ scope.licensing_requirements[0].risk_code || item.risk_code }})
                      </span>
                      <span
                        v-if="scope.licensing_requirements?.[0]?.authority"
                        class="text-[11px] font-medium bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                      >
                        Kewenangan: {{ scope.licensing_requirements[0].authority }}
                      </span>
                      <span
                        v-if="scope.licensing_requirements?.[0]?.processing_time"
                        class="text-[11px] font-medium bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded"
                      >
                        SLA: {{ scope.licensing_requirements[0].processing_time }}
                      </span>
                    </div>

                    <!-- Scope Title -->
                    <p class="text-xs text-gray-800 font-medium leading-relaxed pt-1">
                      {{ scope.title }}
                    </p>
                  </div>

                  <!-- Action Buttons for this scope -->
                  <div class="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0">
                    <button
                      @click="openDetailModal(item, scope)"
                      class="px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-2xs transition whitespace-nowrap"
                    >
                      Preview Aturan
                    </button>
                    <button
                      @click="selectForSubmission(item, scope)"
                      class="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition whitespace-nowrap"
                    >
                      Pilih KBLI & Ajukan →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="permitStore.filteredCatalog.length > displayLimit" class="text-center pt-2">
          <button
            @click="displayLimit += 30"
            class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-300"
          >
            Tampilkan Lebih Banyak (Menampilkan {{ Math.min(displayLimit, permitStore.filteredCatalog.length) }} dari {{ permitStore.filteredCatalog.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Detail DMN Modal -->
    <!-- Detail DMN Modal with Scope Selector -->
    <div v-if="detailModalKbli" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div class="flex justify-between items-center pb-4 border-b">
          <div>
            <span class="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              KBLI {{ detailModalKbli.kbli_code }}
            </span>
            <h3 class="text-lg font-bold text-gray-900 mt-1">{{ detailModalKbli.title }}</h3>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                KBLI {{ detailModalKbli.kbli_code }}
              </span>
              <span
                v-if="activeModalScope"
                class="font-mono text-xs font-bold bg-blue-700 text-white px-2 py-0.5 rounded"
              >
                Ruang Lingkup {{ activeModalScope.sequence }}
              </span>
            </div>
            <h3 class="text-base font-bold text-gray-900 mt-1">{{ detailModalKbli.title }}</h3>
          </div>
          <button @click="detailModalKbli = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Scope Switcher Tabs inside Modal (if multiple scopes) -->
        <div v-if="detailModalKbli.scopes && detailModalKbli.scopes.length > 1" class="mt-3 border-b border-gray-200">
          <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Pilih Ruang Lingkup:
          </div>
          <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              v-for="s in detailModalKbli.scopes"
              :key="s.sequence"
              @click="detailModalScope = s"
              :class="[
                'px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap border',
                activeModalScope?.sequence === s.sequence
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              ]"
            >
              Ruang Lingkup {{ s.sequence }}
            </button>
          </div>
        </div>

        <!-- Active Scope Description Banner -->
        <div v-if="activeModalScope" class="mt-3 bg-blue-50 p-3 rounded-xl border border-blue-200">
          <span class="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Deskripsi Lingkup Kegiatan:
          </span>
          <p class="text-xs text-blue-950 mt-0.5 font-medium leading-relaxed">
            {{ activeModalScope.title }}
          </p>
        </div>

        <div class="mt-4 space-y-4">
          <!-- 4 Summary Cards -->
          <!-- 4 Summary Cards based on active scope -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Tingkat Risiko</span>
              <span class="font-bold text-gray-900 text-sm">{{ detailModalKbli.risk_level }}</span>
              <span class="font-bold text-gray-900 text-sm">
                {{ modalScopeReq?.risk_level || detailModalKbli.risk_level }}
              </span>
            </div>
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Jenis Perizinan</span>
              <span class="font-bold text-blue-700 text-sm">{{ detailModalKbli.perizinan_usaha }}</span>
              <span class="font-bold text-blue-700 text-sm">
                {{ modalScopeReq?.perizinan_usaha?.join(', ') || detailModalKbli.perizinan_usaha }}
              </span>
            </div>
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Kewenangan Verifikasi</span>
              <span class="font-bold text-gray-900 text-sm">{{ detailModalKbli.authority }}</span>
              <span class="font-bold text-gray-900 text-sm">
                {{ modalScopeReq?.authority || detailModalKbli.authority }}
              </span>
            </div>
            <div class="p-3 bg-gray-50 border rounded-lg">
              <span class="text-gray-500 block">Waktu Pemrosesan SLA</span>
              <span class="font-bold text-emerald-700 text-sm">{{ detailModalKbli.processing_time }}</span>
              <span class="font-bold text-emerald-700 text-sm">
                {{ modalScopeReq?.processing_time || detailModalKbli.processing_time }}
              </span>
            </div>
          </div>

          <!-- Requirements Checklist from YAML -->
          <div v-if="detailModalKbli.scopes[0] && detailModalKbli.scopes[0].licensing_requirements[0]">
          <!-- Requirements Checklist from YAML for this scope -->
          <div>
            <h4 class="font-bold text-xs text-gray-900 mb-2">Persyaratan Dokumen & Legalitas Usaha:</h4>
            <ul class="space-y-1.5 text-xs text-gray-700 bg-slate-50 p-4 rounded-lg border">
              <li
                v-for="(req, idx) in detailModalKbli.scopes[0].licensing_requirements[0].requirements"
                v-for="(req, idx) in modalScopeRequirements"
                :key="idx"
                class="flex items-start space-x-2"
              >
                <span class="text-blue-600 font-bold">•</span>
                <span>{{ req }}</span>
              </li>
              <li v-if="detailModalKbli.scopes[0].licensing_requirements[0].requirements.length === 0" class="text-gray-400 italic">
              <li v-if="modalScopeRequirements.length === 0" class="text-gray-400 italic">
                Tidak ada dokumen prasyarat khusus (Otomatis diterbitkan).
              </li>
            </ul>
          </div>

          <!-- Obligations -->
          <div v-if="detailModalKbli.scopes[0] && detailModalKbli.scopes[0].licensing_requirements[0]">
          <!-- Obligations for this scope -->
          <div>
            <h4 class="font-bold text-xs text-gray-900 mb-2">Kewajiban Pelaku Usaha Pasca-Izin:</h4>
            <ul class="space-y-1.5 text-xs text-gray-700 bg-amber-50/60 p-4 rounded-lg border border-amber-200">
              <li
                v-for="(ob, idx) in detailModalKbli.scopes[0].licensing_requirements[0].obligations"
                v-for="(ob, idx) in modalScopeObligations"
                :key="idx"
                class="flex items-start space-x-2"
              >
                <span class="text-amber-600 font-bold">•</span>
                <span>{{ ob }}</span>
              </li>
              <li v-if="modalScopeObligations.length === 0" class="text-gray-400 italic">
                Kewajiban umum sesuai ketentuan peraturan perundang-undangan.
              </li>
            </ul>
          </div>

          <!-- Parameters determining authority if present -->
          <div v-if="modalScopeParameters.length > 0">
            <h4 class="font-bold text-xs text-gray-900 mb-2">Parameter Penentu Kewenangan & Lokasi:</h4>
            <ul class="space-y-1 text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border">
              <li v-for="(param, idx) in modalScopeParameters" :key="idx" class="flex items-center space-x-2">
                <span class="text-emerald-600">✓</span>
                <span>{{ param }}</span>
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
            @click="selectForSubmission(detailModalKbli, activeModalScope)"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
          >
            Lanjutkan Pengajuan dengan KBLI Ini →
            Pilih Ruang Lingkup {{ activeModalScope?.sequence }} & Ajukan Izin →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ref, computed } from 'vue';
import { usePermitStore, type KbliItem } from '../stores/permitStore';

const permitStore = usePermitStore();
const detailModalKbli = ref<KbliItem | null>(null);
const detailModalScope = ref<any | null>(null);
const displayLimit = ref(20);

const emit = defineEmits(['select-kbli']);
const emit = defineEmits<{
  (e: 'select-kbli', payload: { kbli: KbliItem; scope: any }): void;
}>();

const activeModalScope = computed(() => {
  if (detailModalScope.value) return detailModalScope.value;
  if (detailModalKbli.value && detailModalKbli.value.scopes && detailModalKbli.value.scopes.length > 0) {
    return detailModalKbli.value.scopes[0];
  }
  return null;
});

const modalScopeReq = computed(() => {
  return activeModalScope.value?.licensing_requirements?.[0] || null;
});

const modalScopeRequirements = computed<string[]>(() => {
  const reqs: string[] = [];
  if (activeModalScope.value && activeModalScope.value.licensing_requirements) {
    for (const lr of activeModalScope.value.licensing_requirements) {
      if (Array.isArray(lr.requirements)) {
        for (const r of lr.requirements) {
          if (!reqs.includes(r)) reqs.push(r);
        }
      }
    }
  }
  return reqs;
});

const modalScopeObligations = computed<string[]>(() => {
  const obs: string[] = [];
  if (activeModalScope.value && activeModalScope.value.licensing_requirements) {
    for (const lr of activeModalScope.value.licensing_requirements) {
      if (Array.isArray(lr.obligations)) {
        for (const o of lr.obligations) {
          if (!obs.includes(o)) obs.push(o);
        }
      }
    }
  }
  return obs;
});

const modalScopeParameters = computed<string[]>(() => {
  const params: string[] = [];
  if (activeModalScope.value && activeModalScope.value.licensing_requirements) {
    for (const lr of activeModalScope.value.licensing_requirements) {
      if (Array.isArray(lr.parameters)) {
        for (const p of lr.parameters) {
          if (!params.includes(p)) params.push(p);
        }
      }
    }
  }
  return params;
});

function getRiskBadgeClass(code: string) {
  switch (code) {
    case 'R':
    case 'RE':
      return 'text-xs font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-md';
    case 'MR':
      return 'text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md';
    case 'MT':
      return 'text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-md';
    case 'T':
    case 'TI':
      return 'text-xs font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-md';
    default:
      return 'text-xs font-bold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-md';
  }
}

function openDetailModal(item: KbliItem) {
function openDetailModal(item: KbliItem, scope?: any) {
  detailModalKbli.value = item;
  detailModalScope.value = scope || (item.scopes && item.scopes[0]) || null;
}

function selectForSubmission(item: KbliItem) {
function selectForSubmission(item: KbliItem, scope?: any) {
  const chosenScope = scope || (item.scopes && item.scopes[0]) || null;
  detailModalKbli.value = null;
  emit('select-kbli', item);
  detailModalScope.value = null;
  emit('select-kbli', { kbli: item, scope: chosenScope });
}
</script>

