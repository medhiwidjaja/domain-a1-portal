<template>
  <div class="border-b border-gray-200 pb-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
            Tahap {{ currentStepNumber }} dari {{ totalStepCount }}
          </span>
          <span class="text-xs font-semibold text-gray-500">
            Alur Persyaratan Dasar (PP 28/2025)
          </span>
        </div>
        <h2 class="text-lg font-bold text-gray-900 mt-1">
          KBLI {{ kbli?.kbli_code }}: {{ kbli?.title }}
        </h2>
      </div>

      <div class="flex items-center space-x-3">
        <button
          @click="$emit('switch-tab', 'kbli')"
          class="text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          ← Ganti KBLI / Scope
        </button>
      </div>
    </div>

    <!-- Multi-Track Permitting Selector (Main KBLI + PB-UMKU) -->
    <div v-if="activeKbliUmkuList.length > 0" class="mt-4 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold text-gray-700 flex items-center space-x-1.5">
          <span>🧭</span>
          <span>Jalur Permohonan Perizinan (Multi-Track Engine):</span>
        </span>
        <span class="text-[10px] text-gray-500 font-medium">
          1 Izin Utama + {{ activeKbliUmkuList.length }} Izin Pendukung (PB-UMKU)
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Track 0: Main KBLI (Default) -->
        <button
          type="button"
          @click="$emit('update:activeTrack', 'MAIN')"
          class="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs border"
          :class="[
            activeTrack === 'MAIN'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/40'
              : 'bg-white text-gray-700 hover:bg-slate-50 border-gray-200'
          ]"
        >
          <span>🏛️</span>
          <span>Izin Utama (KBLI {{ kbli?.kbli_code }})</span>
          <span
            class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
            :class="[
              isMainPermitIssued
                ? (activeTrack === 'MAIN' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800')
                : (activeTrack === 'MAIN' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800')
            ]"
          >
            {{ isMainPermitIssued ? '✓ NIB Terbit' : 'Draf Tahap ' + currentStep }}
          </span>
        </button>

        <!-- Track 1..N: PB-UMKU -->
        <button
          v-for="umku in activeKbliUmkuList"
          :key="umku.umku_code"
          type="button"
          @click="$emit('update:activeTrack', umku.umku_code)"
          class="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs border"
          :class="[
            activeTrack === umku.umku_code
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40'
              : 'bg-white text-gray-700 hover:bg-slate-50 border-gray-200'
          ]"
        >
          <span>📦</span>
          <span class="truncate max-w-[210px]">{{ umku.title }}</span>
          <span
            class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
            :class="[
              isUmkuIssued(umku.umku_code)
                ? (activeTrack === umku.umku_code ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800')
                : isMainPermitIssued
                  ? (activeTrack === umku.umku_code ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800')
                  : (activeTrack === umku.umku_code ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-500')
            ]"
          >
            {{ isUmkuIssued(umku.umku_code) ? '✓ Terbit' : isMainPermitIssued ? 'Siap Diajukan' : '🔒 Menunggu NIB' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Accordion Toolbar (Only for Main Track) -->
    <div v-if="activeTrack === 'MAIN'" class="mt-4 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-semibold text-gray-600">Alur Pengisian Form:</span>
        <span class="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
          Accordion Wizard (5 Tahapan)
        </span>
      </div>
      <button
        type="button"
        @click="$emit('toggle-all-accordions')"
        class="text-xs text-blue-600 hover:text-blue-800 font-bold underline underline-offset-2 flex items-center space-x-1"
      >
        <span>{{ allAccordionsOpen ? '📁 Tutup Semua Tahap' : '📂 Buka Semua Tahap' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kbli: any;
  currentStepNumber: number;
  totalStepCount: number;
  currentStep: number;
  activeTrack: string;
  activeKbliUmkuList: any[];
  isMainPermitIssued: boolean;
  isUmkuIssued: (code: string) => boolean;
  allAccordionsOpen: boolean;
}>();

defineEmits<{
  (e: 'switch-tab', tab: string): void;
  (e: 'update:activeTrack', track: string): void;
  (e: 'toggle-all-accordions'): void;
}>();
</script>
