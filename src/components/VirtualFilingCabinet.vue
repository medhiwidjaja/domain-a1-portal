<template>
  <div class="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
    <!-- Island Header -->
    <div class="bg-slate-900 text-white p-4 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
            VFC Zone 1
          </span>
          <h2 class="text-sm font-bold tracking-tight">Virtual Filing Cabinet</h2>
        </div>

        <button
          @click="showUploadModal = true"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow transition flex items-center space-x-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Upload File</span>
        </button>
      </div>

      <p class="text-[11px] text-slate-300 mt-1">
        Vault dokumen pribadi investor. Dokumen dapat digunakan kembali (reuse) pada pengajuan izin.
      </p>

      <!-- Category Filter Pills -->
      <div class="flex space-x-1.5 overflow-x-auto mt-3 pb-1 scrollbar-none">
        <button
          v-for="cat in categories"
          :key="cat.key"
          @click="activeCategory = cat.key"
          :class="[
            'px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center space-x-1 whitespace-nowrap',
            activeCategory === cat.key
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          ]"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
          <span
            :class="[
              'text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold',
              activeCategory === cat.key ? 'bg-white text-blue-900' : 'bg-slate-700 text-slate-200'
            ]"
          >
            {{ getCount(cat.key) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Island Body -->
    <div class="p-4 overflow-y-auto flex-1 max-h-[calc(100vh-230px)] space-y-3 bg-slate-50/50">
      <!-- FOLDER 1-4: Standard Document Categories -->
      <div v-if="activeCategory !== 'CREDENTIALS'">
        <div v-if="filteredDocs.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-white p-4">
          <svg class="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="mt-2 text-xs font-semibold text-gray-700">Belum ada dokumen di folder ini.</p>
          <button
            @click="showUploadModal = true"
            class="mt-2 text-[11px] font-bold text-blue-600 hover:underline"
          >
            + Upload Dokumen Baru
          </button>
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="doc in filteredDocs"
            :key="doc.id"
            class="border border-gray-200 rounded-xl p-3 bg-white hover:border-blue-300 hover:shadow-xs transition"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-2.5">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 text-xs line-clamp-1">{{ doc.title }}</h4>
                  <p class="text-[10px] font-mono text-gray-500 mt-0.5 truncate max-w-[190px]">{{ doc.fileName }}</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">{{ doc.fileSize }} • {{ doc.uploadedAt }}</p>
                </div>
              </div>

              <span class="text-[9px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                SHA-256
              </span>
            </div>

            <div class="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span class="text-gray-400 text-[10px] font-mono truncate max-w-[150px]">{{ doc.sha256.slice(0, 16) }}...</span>
              <button
                @click="previewDoc(doc)"
                class="font-semibold text-blue-600 hover:underline"
              >
                Preview File
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- FOLDER 5: Verifiable Credentials (VC) Portfolio -->
      <div v-else>
        <div v-if="approvedCredentials.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-white p-4">
          <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <p class="text-xs font-semibold text-gray-700">Belum ada Verifiable Credential resmi terbit.</p>
          <p class="text-[10px] text-gray-400 mt-1">Ajukan permohonan KBLI untuk mendapatkan Sertifikat Standar / NIB resmi.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="app in approvedCredentials"
            :key="app.id"
            class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-xl p-4 shadow-md border border-slate-700 relative overflow-hidden"
          >
            <!-- Watermark -->
            <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
              <svg class="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>

            <!-- VC Header -->
            <div class="flex items-center justify-between">
              <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <svg class="w-2.5 h-2.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>W3C VC</span>
              </span>

              <span class="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {{ app.verifiableCredential?.credentialType }}
              </span>
            </div>

            <div class="mt-2.5">
              <h4 class="font-bold text-xs text-white line-clamp-1">{{ app.kbliTitle }}</h4>
              <p class="text-[10px] text-slate-300">KBLI {{ app.kbliCode }} • {{ app.companyName }}</p>

              <div class="mt-2 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-[10px] space-y-1 font-mono">
                <div class="truncate text-emerald-300">
                  <span class="text-slate-400 font-sans font-bold">VC ID:</span> {{ app.verifiableCredential?.vcId }}
                </div>
                <div class="text-slate-300">
                  <span class="text-slate-400 font-sans font-bold">Terbit:</span> {{ formatDate(app.verifiableCredential?.issuedAt) }}
                </div>
                <div class="truncate text-blue-300">
                  <span class="text-slate-400 font-sans font-bold">Hash:</span> {{ app.verifiableCredential?.proofHash.slice(0, 20) }}...
                </div>
              </div>
            </div>

            <!-- VC Actions -->
            <div class="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
              <button
                @click="activeQrVc = app.verifiableCredential"
                class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-white rounded border border-slate-600 transition flex items-center space-x-1"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                </svg>
                <span>QR Check</span>
              </button>

              <button
                @click="downloadPdf(app)"
                class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white rounded shadow transition flex items-center space-x-1"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>Unduh PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div class="flex justify-between items-center pb-4 border-b">
          <h3 class="text-base font-bold text-gray-900">Upload Dokumen Baru ke VFC Vault</h3>
          <button @click="showUploadModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleUpload" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">Kategori Folder VFC</label>
            <select v-model="newDoc.category" class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-gray-50 font-semibold text-gray-800">
              <option value="PERUSAHAAN">Profil Perusahaan (Akta, NPWP, NIK)</option>
              <option value="LOKASI">Lokasi & Tata Ruang (Sertifikat HGB, GIS)</option>
              <option value="LINGKUNGAN">Lingkungan (SPPL, UKL-UPL, AMDAL)</option>
              <option value="PERMOHONAN">Permohonan (Pakta Integritas, Specimen)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">Judul / Nama Dokumen</label>
            <input
              v-model="newDoc.title"
              type="text"
              required
              placeholder="Contoh: Akta Perubahan Notaris 2026"
              class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">Pilih File (PDF, GeoJSON, PNG max 10MB)</label>
            <input
              type="file"
              @change="onFileSelected"
              required
              class="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            ℹ️ Dokumen akan otomatis dihitung hash SHA-256 dan disimpan pada MinIO S3 Virtual Filing Cabinet (VFC Zone 1) terisolasi.
          </div>

          <div class="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="showUploadModal = false"
              class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
            >
              Upload ke Vault VFC
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- QR Verification Modal -->
    <div v-if="activeQrVc" class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center text-gray-900 shadow-2xl">
        <h3 class="text-base font-bold">QR Code Verifikasi W3C VC</h3>
        <p class="text-xs text-gray-500 mt-1">Pindai QR ini untuk verifikasi keaslian dokumen di ledger publik BKPM</p>

        <div class="my-6 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl inline-block">
          <svg class="w-40 h-40 text-slate-900 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm0 5h3v3h-3v-3zm-5-5h3v3h-3v-3zm0 5h3v3h-3v-3z"/>
          </svg>
        </div>

        <p class="text-[10px] font-mono text-gray-400 break-all">{{ activeQrVc.qrCodeData }}</p>

        <button
          @click="activeQrVc = null"
          class="mt-6 w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVfcStore, type VfcDocument } from '../stores/vfcStore';
import { useCompanyStore } from '../stores/companyStore';
import { usePermitStore } from '../stores/permitStore';

const vfcStore = useVfcStore();
const companyStore = useCompanyStore();
const permitStore = usePermitStore();

const activeCategory = ref('PERUSAHAAN');
const showUploadModal = ref(false);
const activeQrVc = ref<any>(null);

const categories = [
  { key: 'PERUSAHAAN', label: 'Perusahaan', icon: '🏢' },
  { key: 'LOKASI', label: 'Lokasi & GIS', icon: '🗺️' },
  { key: 'LINGKUNGAN', label: 'Lingkungan', icon: '🌱' },
  { key: 'PERMOHONAN', label: 'Syarat', icon: '📄' },
  { key: 'CREDENTIALS', label: 'Verifiable Credentials', icon: '📜' }
];

const selectedFile = ref<File | null>(null);
const newDoc = ref({
  category: 'PERUSAHAAN' as const,
  title: ''
});

const filteredDocs = computed(() => {
  return vfcStore.documentsByCategory(companyStore.activeCompanyId, activeCategory.value);
});

const approvedCredentials = computed(() => {
  return permitStore.approvedCredentials;
});

function getCount(category: string) {
  if (category === 'CREDENTIALS') {
    return approvedCredentials.value.length;
  }
  return vfcStore.documentsByCategory(companyStore.activeCompanyId, category).length;
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
}

function handleUpload() {
  if (!newDoc.value.title) return;
  const fileName = selectedFile.value ? selectedFile.value.name : 'dokumen_vfc.pdf';
  const fileSize = selectedFile.value ? `${(selectedFile.value.size / 1024 / 1024).toFixed(1)} MB` : '1.5 MB';

  vfcStore.addDocument({
    companyId: companyStore.activeCompanyId,
    category: newDoc.value.category,
    title: newDoc.value.title,
    fileName: fileName,
    fileSize: fileSize,
    url: '#'
  });

  showUploadModal.value = false;
  newDoc.value.title = '';
  selectedFile.value = null;
}

function previewDoc(doc: VfcDocument) {
  alert(`Preview Dokumen VFC:\nJudul: ${doc.title}\nNama File: ${doc.fileName}\nUkuran: ${doc.fileSize}\nSHA-256 Hash: ${doc.sha256}`);
}

function formatDate(iso?: string) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return iso;
  }
}

function downloadPdf(app: any) {
  alert(`Mengunduh dokumen PDF resmi Verifiable Credential:\nID: ${app.verifiableCredential?.vcId}\nKBLI: ${app.kbliCode} - ${app.kbliTitle}\n\nDokumen resmi ditandatangani secara elektronik (BSrE) oleh ${app.authority}.`);
}
</script>
