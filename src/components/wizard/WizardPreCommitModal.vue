<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center space-x-3 text-amber-600 pb-4 border-b border-gray-100">
          <div class="p-3 bg-amber-100 rounded-xl">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">Penyegelan Snapshot Persyaratan Dasar (Pre-Commit)</h3>
            <p class="text-xs text-gray-500">Pernyataan Hukum & Transmisi Data ke Domain B2</p>
          </div>
        </div>

        <div class="mt-4 space-y-4 text-xs text-gray-700">
          <p class="font-medium leading-relaxed">
            Anda akan melakukan komitmen akhir pengajuan permohonan perizinan berusaha. Sistem Domain A1 akan melakukan tindakan:
          </p>
          <!-- Compliance Recap -->
          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-[11px]">
            <div class="flex justify-between">
              <span class="text-gray-500">KBLI & Ruang Lingkup:</span>
              <span class="font-bold text-gray-900">{{ permitStore.activeWizard.kbli?.kbli_code }} (Lingkup {{ activeScope?.sequence }})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Status KKPR:</span>
              <span class="font-bold text-emerald-700">{{ isKkprAutomatic ? 'Pernyataan Mandiri (Otomatis)' : 'Verifikasi PKKPR' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Persetujuan Lingkungan:</span>
              <span class="font-bold text-emerald-700">{{ requiredEnvironmentalDocType.toUpperCase() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">PBG & SLF:</span>
              <span class="font-bold text-blue-700">
                {{ permitStore.activeWizard.formData.memerlukan_bangunan === 'Y' ? 'Pengajuan SIMBG PUPR' : 'Bypass (Terpenuhi Otomatis)' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Dokumen VFC Terlampir:</span>
              <span class="font-mono font-bold text-purple-700">{{ permitStore.activeWizard.selectedVfcDocIds.length }} File</span>
            </div>
          </div>

          <ul class="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 font-bold">1.</span>
              <span>Membuat <strong>Submission Snapshot</strong> permanen yang menyegel formulir dan salinan dokumen VFC.</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 font-bold">2.</span>
              <span>Menghasilkan hash deterministik SHA-256 (<code>payload_digest</code>) sebagai bukti integritas data.</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 font-bold">3.</span>
              <span>Meneruskan paket permohonan ke <strong>Domain B2 (Workflow Orchestrator)</strong> untuk verifikasi teknis K/L/D.</span>
            </li>
          </ul>

          <!-- Deterministic SHA-256 Digest Preview -->
          <div class="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px]">
            <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Simulasi SHA-256 Payload Digest:</span>
            <span class="text-emerald-400 break-all">{{ mockDigest }}</span>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            ⚠️ <strong>Pernyataan Kepatuhan:</strong> Seluruh data formulir persyaratan dasar yang disampaikan adalah sah dan dapat dipertanggungjawabkan secara hukum. Draf tidak dapat diubah setelah transmisi.
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            @click="$emit('close')"
            class="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            @click="$emit('confirm')"
            class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Segel & Kirim Permohonan</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermitStore } from '../../stores/permitStore';

defineProps<{
  show: boolean;
  mockDigest: string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const permitStore = usePermitStore();

const activeScope = computed(() => {
  return permitStore.activeWizard.selectedScope || permitStore.activeWizard.kbli?.scopes?.[0] || null;
});

const activeScopeReq = computed(() => {
  return activeScope.value?.licensing_requirements?.[0] || null;
});

const isKkprAutomatic = computed(() => {
  const form = permitStore.activeWizard.formData;
  return form.flag_kawasan === 'Y' || form.flag_rdtr === 'Y' || form.flag_umkm === 'Y';
});

const requiredEnvironmentalDocType = computed(() => {
  const riskCode = activeScopeReq.value?.risk_code || permitStore.activeWizard.kbli?.risk_code || 'MR';
  if (riskCode === 'R' || riskCode === 'RE' || riskCode === 'MR') return 'sppl';
  if (riskCode === 'MT') return 'ukl/upl';
  return 'amdal';
});
</script>
