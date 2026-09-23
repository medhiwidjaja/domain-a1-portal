<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div v-if="!permitStore.activeWizard.kbli" class="text-center py-16">
      <div class="p-4 bg-blue-50 text-blue-600 rounded-2xl inline-block mb-3">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900">Belum Ada KBLI Yang Dipilih</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto mt-1">
        Silakan pilih kode KBLI 2020 terlebih dahulu dari menu Pencarian KBLI untuk memulai formulir wizard permohonan izin.
      </p>
      <button
        @click="$emit('switch-tab', 'kbli')"
        class="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
      >
        Buka Pencarian KBLI →
      </button>
    </div>

    <div v-else class="space-y-6">
      <!-- Wizard Stepper Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <span class="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
            Wizard Step {{ permitStore.activeWizard.step }} dari 4
          </span>
          <h2 class="text-xl font-bold text-gray-900 mt-1">
            Formulir Permohonan: KBLI {{ permitStore.activeWizard.kbli.kbli_code }} - {{ permitStore.activeWizard.kbli.title }}
          </h2>
        </div>
        <button
          @click="$emit('switch-tab', 'kbli')"
          class="text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          ← Ganti KBLI
        </button>
      </div>

      <!-- STEP 1: Upfront DMN Rule Preview -->
      <div v-if="permitStore.activeWizard.step === 1" class="space-y-6">
        <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-5 shadow-xs">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  Preview DMN Evaluasi Rules
                </span>
                <span class="text-xs font-semibold text-blue-900">
                  Regulasi PP 28/2025 (Current Cohort)
                </span>
              </div>
              <h3 class="text-base font-bold text-gray-900 mt-2">
                Upfront Transparency: Persyaratan & SLA KBLI {{ permitStore.activeWizard.kbli.kbli_code }}
              </h3>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-500 block">Kewenangan Regulator</span>
              <span class="text-xs font-bold text-blue-800">{{ permitStore.activeWizard.kbli.authority }}</span>
              <span class="text-xs font-bold text-blue-800">{{ activeScope?.licensing_requirements?.[0]?.authority || permitStore.activeWizard.kbli.authority }}</span>
            </div>
          </div>

          <!-- Selected Scope Banner -->
          <div v-if="activeScope" class="mt-3 bg-blue-100/70 p-3 rounded-lg border border-blue-200">
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold bg-blue-700 text-white px-2 py-0.5 rounded font-mono">
                Ruang Lingkup {{ activeScope.sequence }}
              </span>
              <span class="text-xs font-bold text-blue-950">
                Lingkup Kegiatan Terpilih
              </span>
            </div>
            <p class="text-xs text-blue-900 mt-1 leading-relaxed">{{ activeScope.title }}</p>
          </div>

          <!-- 4 Pillar Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
            <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
              <span class="text-gray-500 block">Tingkat Risiko</span>
              <span class="font-bold text-sm text-gray-900">{{ permitStore.activeWizard.kbli.risk_level }}</span>
            </div>

            <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
              <span class="text-gray-500 block">Output Dokumen Izin</span>
              <span class="font-bold text-sm text-blue-700">{{ permitStore.activeWizard.kbli.perizinan_usaha }}</span>
            </div>

            <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
              <span class="text-gray-500 block">Target Waktu SLA</span>
              <span class="font-bold text-sm text-emerald-700">{{ permitStore.activeWizard.kbli.processing_time }}</span>
            </div>

            <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
              <span class="text-gray-500 block">Kewajiban Pengawasan</span>
              <span class="font-bold text-sm text-amber-700">LKPM Triwulanan</span>
            </div>
          </div>

          <!-- Requirements checklist preview -->
          <div class="mt-4 bg-white p-4 rounded-lg border border-blue-100 text-xs">
            <span class="font-bold text-gray-900 block mb-2">📋 Dokumen & Form Yang Wajib Dilengkapi Saat Pengajuan:</span>
            <ul class="space-y-1 text-gray-700">
              <li class="flex items-center space-x-2">
                <span class="text-green-600">✓</span>
                <span>Data Profil Perusahaan & Hak Akses Direksi (VFC Auto-fill)</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-green-600">✓</span>
                <span>Koordinat Poligon GIS Lokasi Usaha & Kesesuaian Tata Ruang (KKPR)</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-green-600">✓</span>
                <span>Dokumen Komitmen Lingkungan (SPPL / UKL-UPL)</span>
              </li>
              <li class="flex items-center space-x-2" v-for="(req, idx) in reqList" :key="idx">
                <span class="text-blue-600">✓</span>
                <span>{{ req }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button
            @click="permitStore.setWizardStep(2)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Lanjut ke Isian Parameter Usaha & Lokasi →
          </button>
        </div>
      </div>

      <!-- STEP 2: Form Parameters & Location GIS -->
      <div v-else-if="permitStore.activeWizard.step === 2" class="space-y-4">
        <h3 class="font-bold text-sm text-gray-900 border-b pb-2">Isian Data Proyek Usaha & Lokasi Spatial (GIS)</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Nama Proyek Kegiatan Usaha</label>
            <input
              v-model="permitStore.activeWizard.formData.projectName"
              type="text"
              class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Rencana Nilai Investasi (IDR)</label>
            <input
              v-model.number="permitStore.activeWizard.formData.investmentAmount"
              type="number"
              class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900 font-mono"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Alamat Lokasi Usaha</label>
            <input
              v-model="permitStore.activeWizard.formData.locationAddress"
              type="text"
              class="w-full p-2.5 border rounded-lg text-gray-900"
            />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Jumlah Tenaga Kerja Indonesia</label>
            <input
              v-model.number="permitStore.activeWizard.formData.laborCount"
              type="number"
              class="w-full p-2.5 border rounded-lg text-gray-900"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block font-bold text-gray-700 mb-1">Detail Spesifikasi Mesin & Fasilitas Utama</label>
            <textarea
              v-model="permitStore.activeWizard.formData.machineryDetails"
              rows="2"
              class="w-full p-2.5 border rounded-lg text-gray-900"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-between pt-4 border-t">
          <button
            @click="permitStore.setWizardStep(1)"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Kembali
          </button>
          <button
            @click="permitStore.setWizardStep(3)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Lanjut ke Lampiran Dokumen VFC Vault →
          </button>
        </div>
      </div>

      <!-- STEP 3: VFC Document Selection -->
      <div v-else-if="permitStore.activeWizard.step === 3" class="space-y-4">
        <h3 class="font-bold text-sm text-gray-900 border-b pb-2">Pilih Dokumen Prasyarat dari Virtual Filing Cabinet (VFC)</h3>
        <p class="text-xs text-gray-500">
          Pilih dokumen legalitas yang telah tersimpan pada VFC Zone 1 Anda untuk dilampirkan secara otomatis pada permohonan ini tanpa upload ulang.
        </p>

        <div class="space-y-2">
          <div
            v-for="doc in currentCompanyDocs"
            :key="doc.id"
            @click="permitStore.toggleVfcDocSelection(doc.id)"
            :class="[
              'p-4 border rounded-xl cursor-pointer transition flex items-center justify-between',
              permitStore.activeWizard.selectedVfcDocIds.includes(doc.id)
                ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <input
                type="checkbox"
                :checked="permitStore.activeWizard.selectedVfcDocIds.includes(doc.id)"
                class="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <span class="text-xs font-bold text-gray-900 block">{{ doc.title }}</span>
                <span class="text-[11px] font-mono text-gray-500">{{ doc.fileName }} • {{ doc.fileSize }}</span>
              </div>
            </div>

            <span class="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Folder: {{ doc.category }}
            </span>
          </div>
        </div>

        <div class="flex justify-between pt-4 border-t">
          <button
            @click="permitStore.setWizardStep(2)"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Kembali
          </button>
          <button
            @click="showPreCommitModal = true"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Tinjau & Lakukan Pre-Commit Hashing →
          </button>
        </div>
      </div>

      <!-- STEP 5: Success & Submitted -->
      <div v-else-if="permitStore.activeWizard.step === 5" class="text-center py-12 space-y-4">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="text-2xl font-extrabold text-gray-900">Permohonan Berhasil Disubmit!</h2>
        <p class="text-xs text-gray-600 max-w-md mx-auto">
          Paket permohonan telah disegel dengan SHA-256 payload digest dan diteruskan ke Universal Workflow Orchestrator (Domain B2).
        </p>
        <div class="pt-4 flex justify-center space-x-3">
          <button
            @click="$emit('switch-tab', 'dashboard')"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Pantau Progress SLA di Dashboard →
          </button>
          <button
            @click="$emit('switch-tab', 'credentials')"
            class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Lihat Portfolio Credential →
          </button>
        </div>
      </div>
    </div>

    <!-- Pre-Commit Modal -->
    <div v-if="showPreCommitModal" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100">
        <div class="flex items-center space-x-3 text-amber-600 pb-4 border-b border-gray-100">
          <div class="p-3 bg-amber-100 rounded-xl">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">Konfirmasi Pre-Commit & Penyegelan Snapshot</h3>
            <p class="text-xs text-gray-500">Pernyataan Hukum & Transmisi Data Resmi</p>
          </div>
        </div>

        <div class="mt-4 space-y-4 text-xs text-gray-700">
          <p class="font-medium leading-relaxed">
            Anda akan melakukan komitmen akhir pengajuan permohonan perizinan berusaha. Sistem Domain A1 akan melakukan tindakan:
          </p>

          <ul class="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 font-bold">1.</span>
              <span>Membuat **Submission Snapshot** permanen yang menyegel formulir dan salinan dokumen VFC.</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 font-bold">2.</span>
              <span>Menghasilkan hash deterministik SHA-256 (`payload_digest`) sebagai bukti integritas data.</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-600 font-bold">3.</span>
              <span>Meneruskan paket permohonan ke **Domain B2 (Workflow Orchestrator)** untuk verifikasi teknis K/L/D.</span>
            </li>
          </ul>

          <!-- SHA-256 Digest Preview -->
          <div class="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px]">
            <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Simulasi SHA-256 Payload Digest:</span>
            <span class="text-emerald-400 break-all">{{ mockDigest }}</span>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            ⚠️ <strong>Penting:</strong> Seluruh data yang disampaikan adalah sah dan dapat dipertanggungjawabkan secara hukum. Draf tidak dapat diubah setelah transmisi ke regulator.
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            @click="showPreCommitModal = false"
            class="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Kembali ke Form
          </button>
          <button
            @click="handleConfirmSubmit"
            class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Konfirmasi & Kirim Permohonan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePermitStore } from '../stores/permitStore';
import { useVfcStore } from '../stores/vfcStore';
import { useCompanyStore } from '../stores/companyStore';

defineEmits(['switch-tab']);

const permitStore = usePermitStore();
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();

const showPreCommitModal = ref(false);

const mockDigest = computed(() => {
  return Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
});

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

const activeScope = computed(() => {
  return permitStore.activeWizard.selectedScope || permitStore.activeWizard.kbli?.scopes?.[0] || null;
});

const reqList = computed(() => {
  const kbli = permitStore.activeWizard.kbli;
  if (!kbli || !kbli.scopes[0] || !kbli.scopes[0].licensing_requirements[0]) {
  const scope = activeScope.value;
  if (!scope || !scope.licensing_requirements || !scope.licensing_requirements[0]) {
    return [];
  }
  return kbli.scopes[0].licensing_requirements[0].requirements;
  return scope.licensing_requirements[0].requirements || [];
});

function handleConfirmSubmit() {
  showPreCommitModal.value = false;
  permitStore.submitApplication();
}
</script>

