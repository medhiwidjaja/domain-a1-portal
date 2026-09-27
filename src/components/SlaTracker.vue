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

    <!-- PB-UMKU Next Step Card (Shown when main permit is issued and application requires PB-UMKU) -->
    <div
      v-if="isMainPermitIssued && requiredUmkuList.length > 0"
      class="mt-5 p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200 rounded-2xl space-y-3.5 shadow-2xs text-left"
    >
      <div class="flex items-start sm:items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-white border border-amber-300 shadow-2xs flex items-center justify-center text-xl shrink-0">
          📦
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h4 class="font-bold text-sm text-amber-950 flex items-center space-x-2">
              <span>Langkah Berikutnya: Izin Pendukung Usaha (PB-UMKU)</span>
              <span
                class="text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono shadow-2xs"
                :class="pendingUmkuCount > 0 ? 'bg-amber-200 text-amber-950 border border-amber-300' : 'bg-emerald-200 text-emerald-950 border border-emerald-300'"
              >
                {{ pendingUmkuCount > 0 ? `${pendingUmkuCount} Wajib Diselesaikan` : 'Semua PB-UMKU Selesai' }}
              </span>
            </h4>
          </div>
          <p class="text-xs text-amber-900/85 mt-0.5 leading-relaxed">
            Izin utama (<strong>{{ mainPermitTypeLabel }}</strong>) Anda telah resmi terbit. Sesuai ketentuan PP 5/2021, sebelum kegiatan operasional komersial dimulai, Anda wajib melengkapi <strong>{{ requiredUmkuList.length }} PB-UMKU</strong> berikut yang dapat diajukan secara paralel:
          </p>
        </div>
      </div>

      <div class="space-y-2 pt-1">
        <div
          v-for="u in requiredUmkuList"
          :key="u.umku_code"
          class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-amber-200/90 hover:border-amber-300 rounded-xl gap-3 transition shadow-2xs"
        >
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-xs text-gray-900">{{ u.title }}</span>
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {{ u.umku_code }}
              </span>
            </div>
            <div class="flex items-center space-x-2 text-[11px] text-gray-500">
              <span>🏛️ {{ u.authority }}</span>
              <span>•</span>
              <span class="font-mono text-emerald-700 font-semibold">⏱️ SLA: {{ u.processing_time }}</span>
            </div>
          </div>

          <div class="flex items-center space-x-2 shrink-0">
            <span
              v-if="isUmkuIssued(u.umku_code)"
              class="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center space-x-1"
            >
              <span>✅</span>
              <span>Izin Terbit</span>
            </span>
            <span
              v-else
              class="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg flex items-center space-x-1"
            >
              <span>⏳</span>
              <span>Belum Selesai</span>
            </span>

            <button
              type="button"
              @click="onApplyUmkuClick(u)"
              class="px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              :class="isUmkuIssued(u.umku_code)
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'"
            >
              <span>{{ isUmkuIssued(u.umku_code) ? 'Lihat Izin Terbit' : 'Ajukan PB UMKU' }}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PermitApplication } from '../stores/permitStore';
import { usePermitStore } from '../stores/permitStore';
import { useCredentialStore } from '../stores/credentialStore';

const props = defineProps<{
  application: PermitApplication;
}>();

const emit = defineEmits<{
  (e: 'apply-umku', payload: { application: PermitApplication; umku: any }): void;
}>();

const permitStore = usePermitStore();
const credentialStore = useCredentialStore();

const isMainPermitIssued = computed(() => {
  return (
    props.application.status === 'APPROVED' ||
    props.application.stepIndex >= 4 ||
    !!props.application.verifiableCredential ||
    credentialStore.activeCompanyCredentials.some(
      (c) =>
        ['NIB', 'SERTIFIKAT_STANDAR'].includes(c.category) &&
        c.kbliCode === props.application.kbliCode
    )
  );
});

const requiredUmkuList = computed(() => {
  const kbli = permitStore.catalog.find((k) => k.kbli_code === props.application.kbliCode);
  if (!kbli || !kbli.scopes) return [];

  // 1. Match by scope sequence
  let matchedScope = props.application.scopeSequence
    ? kbli.scopes.find((s) => s.sequence === props.application.scopeSequence)
    : null;

  // 2. Match by scope title
  if (!matchedScope && props.application.scopeTitle) {
    matchedScope = kbli.scopes.find((s) => s.title === props.application.scopeTitle);
  }

  // 3. Fallback to first scope with pb_umku or scopes[0]
  if (!matchedScope) {
    matchedScope =
      kbli.scopes.find((s) => Array.isArray(s.pb_umku) && s.pb_umku.length > 0) ||
      kbli.scopes[0];
  }

  if (!matchedScope) return [];

  if (Array.isArray(matchedScope.pb_umku) && matchedScope.pb_umku.length > 0) {
    return matchedScope.pb_umku;
  }

  if (Array.isArray(matchedScope.licensing_requirements)) {
    for (const lr of matchedScope.licensing_requirements) {
      if (Array.isArray(lr.pb_umku) && lr.pb_umku.length > 0) {
        return lr.pb_umku;
      }
    }
  }

  return [];
});

function isUmkuIssued(umkuCode: string): boolean {
  return credentialStore.activeCompanyCredentials.some(
    (c) =>
      c.category === 'PB_UMKU' &&
      (c.claims?.umku_code === umkuCode || c.title.includes(umkuCode))
  );
}

const pendingUmkuCount = computed(() => {
  return requiredUmkuList.value.filter((u) => !isUmkuIssued(u.umku_code)).length;
});

const mainPermitTypeLabel = computed(() => {
  if (props.application.verifiableCredential?.credentialType === 'VerifiableNIB') {
    return 'NIB';
  }
  if (props.application.verifiableCredential?.credentialType === 'VerifiableSertifikatStandar') {
    return 'Sertifikat Standar';
  }
  if (props.application.riskCode === 'R' || props.application.riskCode === 'RE') {
    return 'NIB (Risiko Rendah)';
  }
  if (props.application.riskCode === 'MR') {
    return 'Sertifikat Standar (Risiko Menengah Rendah)';
  }
  if (props.application.riskCode === 'MT') {
    return 'Sertifikat Standar Terverifikasi';
  }
  return 'Izin (Risiko Tinggi)';
});

function onApplyUmkuClick(umku: any) {
  emit('apply-umku', {
    application: props.application,
    umku
  });
}

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

