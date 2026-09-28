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
          {{ isCompleted ? '✓' : '3' }}
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-sm text-gray-900">Tahap 3: Persyaratan Dasar 2 — Persetujuan Lingkungan (PL)</h3>
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
            Penetapan instrumen lingkungan hidup (SPPL, UKL-UPL, AMDAL) & integrasi AMDALNET KLHK.
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
          <span class="text-sm font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">PD-2</span>
          <h3 class="text-sm font-bold text-gray-900">Persetujuan Lingkungan (PL)</h3>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Penetapan instrumen lingkungan hidup berdasarkan tingkat risiko KBLI (SPPL untuk Rendah/Menengah Rendah, UKL-UPL/PKPLH untuk Menengah Tinggi, AMDAL/SKKL untuk Tinggi).
        </p>
      </div>

      <div class="space-y-4">
        <!-- Environmental Instrument Evaluation Banner -->
        <div class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 font-bold text-emerald-950">
              <span class="text-base">🌱</span>
              <span>Instrumen Wajib Berdasarkan KBLI: {{ requiredEnvironmentalDocType.toUpperCase() }}</span>
            </div>
            <span class="text-[10px] font-mono bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              Risiko: {{ activeScopeReq?.risk_level || permitStore.activeWizard.kbli?.risk_level }}
            </span>
          </div>
          <p class="text-[11px] text-emerald-900 leading-relaxed">
            {{ requiredEnvironmentalDocType === 'sppl'
              ? 'Kegiatan usaha ini berkategori dampak lingkungan rendah, cukup mengisi Surat Pernyataan Kesanggupan Pengelolaan Lingkungan (SPPL) secara mandiri.'
              : requiredEnvironmentalDocType === 'ukl/upl'
              ? 'Kegiatan usaha berkategori dampak menengah tinggi, memerlukan formulir teknis UKL-UPL dan verifikasi persetujuan teknis (PKPLH).'
              : 'Kegiatan usaha berkategori risiko tinggi terhadap lingkungan hidup, wajib menyusun AMDAL terintegrasi sistem Amdalnet KLHK.'
            }}
          </p>
        </div>

        <!-- Question: Has existing document? -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Apakah sudah memiliki dokumen lingkungan sebelumnya?</label>
            <select
              v-model="permitStore.activeWizard.formData.flag_has_dokumen_lingkungan"
              class="w-full p-2.5 border rounded-lg bg-gray-50 font-semibold"
            >
              <option value="N">Belum Ada (Buat / Ajukan Baru Melalui OSS)</option>
              <option value="Y">Sudah Ada dan Masih Berlaku</option>
            </select>
          </div>

          <div v-if="permitStore.activeWizard.formData.flag_has_dokumen_lingkungan === 'Y'">
            <label class="block font-bold text-gray-700 mb-1">Nomor SK / Izin Lingkungan</label>
            <input
              v-model="permitStore.activeWizard.formData.nomor_lingkungan"
              type="text"
              placeholder="Contoh: 660.1/SKKL-2024/DLH"
              class="w-full p-2.5 border rounded-lg font-mono"
            />
          </div>
        </div>

        <!-- Dynamic Form Branch 1: SPPL (R / MR) -->
        <div v-if="requiredEnvironmentalDocType === 'sppl'" class="p-4 bg-white border border-gray-200 rounded-xl space-y-3 text-xs">
          <h5 class="font-bold text-gray-900">Komitmen Surat Pernyataan Pengelolaan Lingkungan (SPPL)</h5>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Uraian Rencana Kegiatan & Upaya Pengelolaan Lingkungan</label>
            <textarea
              v-model="permitStore.activeWizard.formData.uraian_usaha_lingkungan"
              rows="3"
              class="w-full p-2.5 border rounded-lg text-gray-900"
            ></textarea>
          </div>

          <div class="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="checkSppl"
              v-model="permitStore.activeWizard.formData.flag_pernyataan_sppl"
              class="w-4 h-4 text-emerald-600 rounded mt-0.5"
            />
            <label for="checkSppl" class="text-gray-700 leading-relaxed text-[11px]">
              Dengan ini saya menyatakan bersedia menjaga kelestarian fungsi lingkungan hidup, menyediakan sarana pengelolaan limbah operasional, dan siap dilakukan pengawasan berkala oleh instansi yang berwenang.
            </label>
          </div>
        </div>

        <!-- Dynamic Form Branch 2: UKL-UPL / AMDAL (MT / T) -->
        <div v-else class="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3 text-xs">
          <h5 class="font-bold text-gray-900">Uraian Rencana Pengelolaan & Integrasi Dokumen Teknis Lingkungan</h5>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Ringkasan Kajian Dampak Lingkungan</label>
            <textarea
              v-model="permitStore.activeWizard.formData.uraian_usaha_lingkungan"
              rows="3"
              class="w-full p-2.5 border rounded-lg text-gray-900 bg-white"
            ></textarea>
          </div>
        </div>

        <!-- DOCUMENT SLOT: Dokumen Lingkungan / SPPL -->
        <div class="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-bold text-xs text-gray-900 block">Lampiran Dokumen Lingkungan Hidup</span>
              <span class="text-[11px] text-gray-500">Simpan pada VFC folder LINGKUNGAN</span>
            </div>
            <span class="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
              Target Folder: LINGKUNGAN
            </span>
          </div>

          <!-- Existing VFC Document Detected or Upload New -->
          <div v-if="attachedEnvDoc" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div class="flex items-center space-x-2 text-xs">
              <span class="text-base">🌱</span>
              <div>
                <span class="font-bold text-emerald-950 block">{{ attachedEnvDoc.title }}</span>
                <span class="text-[10px] font-mono text-emerald-700">{{ attachedEnvDoc.fileName }} • {{ attachedEnvDoc.fileSize }} • Hash: {{ attachedEnvDoc.sha256.slice(0, 14) }}...</span>
              </div>
            </div>
            <span class="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-300">
              ✓ Terlampir dari VFC
            </span>
          </div>

          <div v-else class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-600 font-semibold">Belum ada dokumen lingkungan terlampir.</p>
            <div class="mt-3 flex justify-center items-center space-x-3">
              <select
                v-if="availableEnvDocs.length > 0"
                @change="onSelectExistingDoc($event, 'LINGKUNGAN')"
                class="text-xs p-2 border rounded-lg bg-gray-50"
              >
                <option value="">-- Pilih dari Filing Cabinet --</option>
                <option v-for="d in availableEnvDocs" :key="d.id" :value="d.id">
                  {{ d.title }} ({{ d.fileName }})
                </option>
              </select>

              <label class="cursor-pointer px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition">
                <span>+ Unggah Dokumen Lingkungan Baru</span>
                <input type="file" class="hidden" @change="onInlineUpload($event, 'LINGKUNGAN', 'Dokumen Pengelolaan Lingkungan')" />
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
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();

const activeScope = computed(() => {
  return permitStore.activeWizard.selectedScope || permitStore.activeWizard.kbli?.scopes?.[0] || null;
});

const activeScopeReq = computed(() => {
  return activeScope.value?.licensing_requirements?.[0] || null;
});

const requiredEnvironmentalDocType = computed(() => {
  const riskCode = activeScopeReq.value?.risk_code || permitStore.activeWizard.kbli?.risk_code || 'MR';
  if (riskCode === 'R' || riskCode === 'RE' || riskCode === 'MR') return 'sppl';
  if (riskCode === 'MT') return 'ukl/upl';
  return 'amdal';
});

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

const availableEnvDocs = computed(() => {
  return currentCompanyDocs.value.filter((d) => d.category === 'LINGKUNGAN');
});

const attachedEnvDoc = computed(() => {
  return currentCompanyDocs.value.find(
    (d) =>
      permitStore.activeWizard.selectedVfcDocIds.includes(d.id) &&
      d.category === 'LINGKUNGAN'
  );
});

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
