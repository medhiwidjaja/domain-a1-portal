<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
            ID: {{ application.id }}
          </span>
          <span :class="getStatusBadgeClass(application.status)">
            {{ application.status }}
          </span>
        </div>
        <h3 class="text-base font-bold text-gray-900 mt-1">
          {{ application.kbliTitle }} (KBLI {{ application.kbliCode }})
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          {{ application.companyName }} • Disubmit: {{ application.submittedAt }}
        </p>
      </div>

      <div class="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-right">
        <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">SLA Target & Sisa Waktu</span>
        <span class="text-xs font-bold text-emerald-700 font-mono">
          Target: {{ application.processingTime }} • Sisa: {{ remainingSlaText }}
        </span>
      </div>
    </div>

    <!-- Stepper Progress Bar -->
    <div class="mt-6">
      <div class="relative flex items-center justify-between">
        <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
        <div
          class="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 -z-10"
          :style="{ width: progressPercent + '%' }"
        ></div>

        <!-- Step 1: Draft preserved -->
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
            1
          </div>
          <span class="text-xs font-semibold text-gray-800 mt-2">Draf Preserved</span>
          <span class="text-[10px] text-gray-400">VFC Zone 1</span>
        </div>

        <!-- Step 2: Submitted & Sealed -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow',
              application.stepIndex >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            ]"
          >
            2
          </div>
          <span class="text-xs font-semibold text-gray-800 mt-2">Submitted & Sealed</span>
          <span class="text-[10px] text-gray-400">Domain B2 Envelope</span>
        </div>

        <!-- Step 3: Verifikasi Teknis K/L/D -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow',
              application.stepIndex >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            ]"
          >
            3
          </div>
          <span class="text-xs font-semibold text-gray-800 mt-2">Verifikasi Teknis</span>
          <span class="text-[10px] text-gray-400">{{ application.authority }}</span>
        </div>

        <!-- Step 4: Approved & Credential Issued -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow',
              application.stepIndex >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            ]"
          >
            4
          </div>
          <span class="text-xs font-semibold text-gray-800 mt-2">Credential Issued</span>
          <span class="text-[10px] text-gray-400">W3C VC Portfolio</span>
        </div>
      </div>
    </div>

    <!-- Logs / Detail Metadata -->
    <div class="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-600 gap-1">
        <span>Deterministic Payload Hash (`payload_digest`):</span>
        <span class="font-mono text-gray-900 truncate max-w-md text-[11px]">{{ application.payloadDigest }}</span>
      </div>
      <div class="flex justify-between items-center text-gray-600">
        <span>Dokumen Terlampir dari VFC:</span>
        <span class="font-semibold text-blue-700">{{ application.attachedVfcDocIds.length }} Dokumen Sah</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PermitApplication } from '../stores/permitStore';

const props = defineProps<{
  application: PermitApplication;
}>();

const progressPercent = computed(() => {
  switch (props.application.stepIndex) {
    case 1: return 10;
    case 2: return 40;
    case 3: return 70;
    case 4: return 100;
    default: return 0;
  }
});

const remainingSlaText = computed(() => {
  if (props.application.status === 'APPROVED') return 'Selesai (Approved)';
  if (props.application.status === 'REJECTED') return 'Ditolak';
  return '3 Hari 18 Jam';
});

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded';
    case 'IN_REVIEW':
      return 'text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded';
    case 'SUBMITTED':
      return 'text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded';
    default:
      return 'text-xs font-bold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded';
  }
}
</script>

