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
            isOpen ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
          ]"
        >
          5
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-sm text-gray-900">Tahap 5: Persyaratan Khusus KBLI & Lampiran Dokumen Filing Cabinet</h3>
            <span
              v-if="isOpen"
              class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
            >
              Aktif
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">
            Lampirkan dokumen dari Virtual Filing Cabinet (VFC Zone 1). Siap disegel untuk snapshot permohonan.
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
      <!-- Persyaratan Dasar Complete Banner -->
      <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-950 shadow-2xs">
        <span class="text-xl">🛡️</span>
        <div>
          <span class="font-bold block text-emerald-950">Persyaratan Dasar Selesai — NIB Credential Resmi Diterbitkan!</span>
          <p class="text-[11px] mt-0.5 text-emerald-800 leading-relaxed">
            Seluruh Persyaratan Dasar (KKPR Tata Ruang, Persetujuan Lingkungan, dan PBG/SLF Bangunan Gedung) telah berhasil divalidasi dan disegel ke dalam brankas VFC Anda. NIB Credential resmi telah aktif. Lampirkan dokumen persyaratan teknis sektor di bawah ini sebelum mengirim berkas final.
          </p>
        </div>
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-bold bg-blue-600 text-white px-2 py-0.5 rounded">VFC</span>
          <h3 class="text-sm font-bold text-gray-900">Persyaratan Khusus KBLI & Lampiran Dokumen Filing Cabinet</h3>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Lampirkan dokumen dari Virtual Filing Cabinet (VFC Zone 1). Jika belum tersimpan, Anda dapat mengunggahnya secara langsung di sini.
        </p>
      </div>

      <!-- Specific Requirements List from KBLI Catalog -->
      <div class="space-y-3">
        <h4 class="font-bold text-xs text-gray-900 uppercase tracking-wider">
          Checklist Ketentuan Teknis Sektor KBLI {{ permitStore.activeWizard.kbli?.kbli_code }}:
        </h4>

        <div v-if="reqList.length > 0" class="space-y-2">
          <div
            v-for="(req, idx) in reqList"
            :key="idx"
            class="p-3 bg-white border border-gray-200 rounded-xl flex items-start space-x-2.5 text-xs"
          >
            <span class="text-blue-600 font-bold mt-0.5">•</span>
            <span class="text-gray-800 leading-relaxed font-medium">{{ req }}</span>
          </div>
        </div>
        <div v-else class="p-3 bg-gray-50 border rounded-lg text-xs text-gray-500 italic">
          Tidak ada dokumen prasyarat sektoral tambahan (Otomatis diproses).
        </div>
      </div>

      <!-- VFC Document Selection & Upload -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Pilih Dokumen Legalitas Tersimpan di Vault VFC:
          </h4>
          <label class="cursor-pointer text-[11px] font-bold text-blue-600 hover:underline">
            + Unggah Dokumen Tambahan ke VFC
            <input type="file" class="hidden" @change="onInlineUpload($event, 'PENGAJUAN', 'Dokumen Permohonan Tambahan')" />
          </label>
        </div>

        <div class="space-y-2">
          <div
            v-for="doc in currentCompanyDocs"
            :key="doc.id"
            @click="permitStore.toggleVfcDocSelection(doc.id)"
            :class="[
              'p-3.5 border rounded-xl cursor-pointer transition flex items-center justify-between',
              permitStore.activeWizard.selectedVfcDocIds.includes(doc.id)
                ? 'border-blue-500 bg-blue-50/70 shadow-xs'
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
                <span class="text-[11px] font-mono text-gray-500">{{ doc.fileName }} • {{ doc.fileSize }} • Hash: {{ doc.sha256.slice(0, 12) }}...</span>
              </div>
            </div>

            <span class="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Folder: {{ doc.category }}
            </span>
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
          @click="$emit('open-precommit')"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
        >
          <span>🔒</span>
          <span>Tinjau Komitmen & Segel SHA-256 →</span>
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
}>();

defineEmits<{
  (e: 'toggle'): void;
  (e: 'save'): void;
  (e: 'open-precommit'): void;
}>();

const permitStore = usePermitStore();
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();

const activeScope = computed(() => {
  return permitStore.activeWizard.selectedScope || permitStore.activeWizard.kbli?.scopes?.[0] || null;
});

const reqList = computed(() => {
  const scope = activeScope.value;
  if (!scope || !scope.licensing_requirements || !scope.licensing_requirements[0]) {
    return [];
  }
  return scope.licensing_requirements[0].requirements || [];
});

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

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
