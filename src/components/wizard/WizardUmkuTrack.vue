<template>
  <div v-if="selectedPbUmku" class="space-y-6">
    <!-- PB-UMKU Track Header -->
    <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-5 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="bg-amber-800/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              Jalur PB-UMKU: {{ selectedPbUmku.umku_code }}
            </span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="[
                isUmkuIssued(selectedPbUmku.umku_code)
                  ? 'bg-emerald-400 text-slate-900'
                  : isMainPermitIssued
                    ? 'bg-white text-amber-900'
                    : 'bg-amber-900/60 text-amber-200'
              ]"
            >
              {{ isUmkuIssued(selectedPbUmku.umku_code) ? '✅ Izin Terbit (Aktif)' : isMainPermitIssued ? '📝 Siap Diajukan' : '🔒 Menunggu Penerbitan NIB' }}
            </span>
          </div>
          <h2 class="text-lg font-bold">{{ selectedPbUmku.title }}</h2>
          <p class="text-xs text-amber-100 max-w-2xl leading-relaxed">
            {{ selectedPbUmku.description }}
          </p>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            @click="$emit('switch-to-main')"
            class="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition"
          >
            ← Kembali ke Izin Utama
          </button>
        </div>
      </div>

      <!-- Metadata Tags -->
      <div class="mt-4 pt-3 border-t border-amber-400/40 flex flex-wrap items-center gap-2 text-xs">
        <span class="bg-amber-700/80 px-2.5 py-1 rounded-lg">
          Instansi Pembina: <strong>{{ selectedPbUmku.authority }}</strong>
        </span>
        <span class="bg-amber-700/80 px-2.5 py-1 rounded-lg">
          SLA Pemrosesan: <strong>{{ selectedPbUmku.processing_time }}</strong>
        </span>
        <span v-if="selectedPbUmku.pnbp_fee" class="bg-amber-700/80 px-2.5 py-1 rounded-lg">
          Biaya PNBP: <strong>{{ selectedPbUmku.pnbp_fee }}</strong>
        </span>
        <span class="bg-amber-700/80 px-2.5 py-1 rounded-lg font-mono">
          Induk: <strong>KBLI {{ permitStore.activeWizard.kbli?.kbli_code }}</strong>
        </span>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- STATE A: LOCKED (Main Permit not yet issued) -->
    <!-- ============================================== -->
    <div v-if="!isMainPermitIssued" class="border border-amber-200 bg-amber-50/40 rounded-2xl p-6 space-y-6">
      <div class="flex items-start space-x-4">
        <div class="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold">
          🔒
        </div>
        <div class="space-y-1 flex-1">
          <h3 class="text-sm font-bold text-amber-950">
            PB-UMKU Memerlukan Izin Utama / NIB Terlebih Dahulu (PP 5/2021)
          </h3>
          <p class="text-xs text-amber-800 leading-relaxed">
            Berdasarkan ketentuan Pasal 4 ayat (2) PP 5/2021 dan arsitektur perizinan terpadu Domain A1, Nomor Induk Berusaha (NIB) merupakan identitas tunggal legalitas usaha. Permohonan perizinan pendukung (PB-UMKU) memerlukan nomor referensi NIB induk yang sah sebelum berkas verifikasi teknis dapat dikirimkan ke kementerian pembina teknis (<strong>{{ selectedPbUmku.authority }}</strong>).
          </p>
          <div class="pt-2">
            <button
              type="button"
              @click="$emit('switch-to-main')"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center space-x-2"
            >
              <span>🏛️</span>
              <span>Lanjutkan & Selesaikan Draf Izin Utama Terlebih Dahulu →</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Document Preparation Checklist in VFC -->
      <div class="bg-white border border-amber-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-xs text-gray-900">
              📋 Persiapan Dokumen Teknis PB-UMKU di Virtual Filing Cabinet:
            </h4>
            <p class="text-[11px] text-gray-500">
              Anda dapat menyiapkan dan mengunggah dokumen persyaratan ke VFC Anda sekarang agar saat NIB terbit, PB-UMKU dapat langsung diajukan dalam 1-klik.
            </p>
          </div>
          <button
            type="button"
            @click="$emit('switch-tab', 'vfc')"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
          >
            Buka VFC Vault →
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="(req, rIdx) in selectedPbUmku.requirements"
            :key="rIdx"
            class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 transition"
            :class="getUmkuRequirementDocId(selectedPbUmku.umku_code, req) ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span :class="getUmkuRequirementDocId(selectedPbUmku.umku_code, req) ? 'text-emerald-600' : 'text-amber-600'" class="font-bold">•</span>
                <span class="text-gray-800 font-medium">{{ req }}</span>
              </div>
              <label class="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded text-[11px] font-semibold cursor-pointer transition flex items-center space-x-1 shrink-0 shadow-2xs">
                <span>📤</span>
                <span>{{ getUmkuRequirementDocId(selectedPbUmku.umku_code, req) ? 'Ganti File' : '+ Unggah ke VFC' }}</span>
                <input
                  type="file"
                  class="hidden"
                  @change="onUmkuUpload($event, selectedPbUmku, req)"
                />
              </label>
            </div>

            <!-- Bound Doc Preview in Preparation Mode -->
            <div
              v-if="getBoundDoc(selectedPbUmku.umku_code, req)"
              class="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900"
            >
              <div class="flex items-center space-x-2 truncate">
                <span>✅</span>
                <span class="font-bold truncate">{{ getBoundDoc(selectedPbUmku.umku_code, req)?.fileName }}</span>
                <span class="text-emerald-700 text-[10px] font-mono">({{ getBoundDoc(selectedPbUmku.umku_code, req)?.fileSize }})</span>
              </div>
              <span class="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded font-mono shrink-0">
                Tersimpan di VFC: {{ selectedPbUmku.title }}
              </span>
            </div>
          </div>
        </div>

        <!-- Obligations Preview -->
        <div v-if="selectedPbUmku.obligations && selectedPbUmku.obligations.length > 0" class="pt-2 border-t border-gray-100">
          <span class="text-[11px] font-bold text-gray-700 block mb-1">
            ⚖️ Kewajiban Regulasi yang Akan Melekat:
          </span>
          <ul class="text-[11px] text-gray-600 space-y-1">
            <li v-for="(o, oIdx) in selectedPbUmku.obligations" :key="oIdx" class="flex items-center space-x-1.5">
              <span class="text-emerald-600">✓</span>
              <span>{{ o }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- STATE B: UNLOCKED & READY FOR SUBMISSION -->
    <!-- ============================================== -->
    <div v-else-if="!isUmkuIssued(selectedPbUmku.umku_code)" class="space-y-6">
      <!-- Unlocked Notice Banner -->
      <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
        <div class="flex items-center space-x-3">
          <span class="text-xl">✅</span>
          <div>
            <span class="font-bold block">NIB Izin Utama Telah Terbit — Formulir PB-UMKU Terbuka</span>
            <span class="text-[11px] text-emerald-700">
              PB-UMKU ini independen dan dapat diajukan tanpa menunggu PB-UMKU lainnya. NIB Induk: <strong>{{ mainPermitRecord?.id || companyStore.activeCompany.nib }}</strong>.
            </span>
          </div>
        </div>
        <span class="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1 rounded-full font-mono shrink-0">
          PP 5/2021 Terverifikasi
        </span>
      </div>

      <!-- PB-UMKU Submission Form -->
      <div class="border border-gray-200 rounded-2xl p-6 bg-white space-y-6 shadow-xs">
        <h3 class="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
          <span>📝</span>
          <span>Formulir Permohonan Teknis: {{ selectedPbUmku.title }}</span>
        </h3>

        <!-- Parameter Usaha Teknis -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-gray-700">Nomor NIB Induk (Otomatis)</label>
            <input
              type="text"
              readonly
              :value="mainPermitRecord?.id || companyStore.activeCompany.nib"
              class="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 font-mono text-xs cursor-not-allowed"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-gray-700">Nama Badan Usaha / Pemohon</label>
            <input
              type="text"
              readonly
              :value="companyStore.activeCompany.name"
              class="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 text-xs cursor-not-allowed"
            />
          </div>

          <div class="md:col-span-2 space-y-1">
            <label class="font-bold text-gray-700">Nama Objek / Varietas / Komoditas Teknis *</label>
            <input
              type="text"
              v-model="getUmkuForm(selectedPbUmku.umku_code).varietyName"
              placeholder="Contoh: Varietas Rimpang Jahe Merah Sentul Unggul V1"
              class="w-full p-2.5 border border-gray-300 rounded-xl text-gray-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div class="md:col-span-2 space-y-1">
            <label class="font-bold text-gray-700">Deskripsi Karakteristik Teknis & Hasil Uji Laboratorium *</label>
            <textarea
              rows="3"
              v-model="getUmkuForm(selectedPbUmku.umku_code).technicalDescription"
              placeholder="Uraikan karakteristik agronomis, metodologi pemuliaan, atau spesifikasi mutu teknis..."
              class="w-full p-2.5 border border-gray-300 rounded-xl text-gray-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
            ></textarea>
          </div>

          <div class="md:col-span-2 space-y-1">
            <label class="font-bold text-gray-700">Lokasi Kebun Percobaan / Fasilitas / Balai Pengujian *</label>
            <input
              type="text"
              v-model="getUmkuForm(selectedPbUmku.umku_code).testingLocation"
              placeholder="Contoh: Balai Penelitian Tanaman Obat dan Laboratorium Terpadu"
              class="w-full p-2.5 border border-gray-300 rounded-xl text-gray-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        <!-- Binding Dokumen Teknis dari VFC -->
        <div class="pt-4 border-t border-gray-100 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-bold text-xs text-gray-900">
                📂 Tautkan Dokumen Persyaratan Teknis dari VFC:
              </h4>
              <p class="text-[11px] text-gray-500">
                Centang dokumen yang relevan dari brankas dokumen Anda atau unggah langsung.
              </p>
            </div>
            <span class="text-[11px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
              {{ getUmkuForm(selectedPbUmku.umku_code).selectedDocIds.length }} Dokumen Terkait
            </span>
          </div>

          <div class="space-y-2.5">
            <div
              v-for="(req, rIdx) in selectedPbUmku.requirements"
              :key="rIdx"
              class="p-3.5 bg-slate-50 border rounded-xl space-y-2.5 transition"
              :class="getUmkuRequirementDocId(selectedPbUmku.umku_code, req) ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-gray-800 flex items-center space-x-1.5">
                  <span :class="getUmkuRequirementDocId(selectedPbUmku.umku_code, req) ? 'text-emerald-600' : 'text-amber-600'">•</span>
                  <span>{{ req }}</span>
                </span>
                <label class="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded-lg text-[11px] font-semibold cursor-pointer transition flex items-center space-x-1 shadow-2xs">
                  <span>📤</span>
                  <span>{{ getUmkuRequirementDocId(selectedPbUmku.umku_code, req) ? 'Ganti / Upload Baru' : '+ Upload File' }}</span>
                  <input
                    type="file"
                    class="hidden"
                    @change="onUmkuUpload($event, selectedPbUmku, req)"
                  />
                </label>
              </div>

              <!-- Select from existing VFC docs -->
              <div class="flex items-center space-x-2 text-xs">
                <select
                  :value="getUmkuRequirementDocId(selectedPbUmku.umku_code, req)"
                  @change="onUmkuSelectDoc($event, selectedPbUmku.umku_code, req)"
                  class="flex-1 p-2 bg-white border rounded-lg text-xs transition"
                  :class="getUmkuRequirementDocId(selectedPbUmku.umku_code, req) ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-medium' : 'border-gray-300 text-gray-700'"
                >
                  <option value="">-- Pilih Dokumen dari VFC Vault --</option>
                  <option
                    v-for="d in currentCompanyDocs"
                    :key="d.id"
                    :value="d.id"
                  >
                    {{ d.title }} ({{ d.category }} - {{ d.fileSize }})
                  </option>
                </select>
              </div>

              <!-- Bound Document Info Badge -->
              <div
                v-if="getBoundDoc(selectedPbUmku.umku_code, req)"
                class="flex items-center justify-between p-2 bg-emerald-50/90 border border-emerald-200 rounded-lg text-[11px] text-emerald-900"
              >
                <div class="flex items-center space-x-2 truncate">
                  <span class="text-xs">📁</span>
                  <span class="font-bold truncate">{{ getBoundDoc(selectedPbUmku.umku_code, req)?.title }}</span>
                  <span class="text-emerald-700 text-[10px] font-mono shrink-0">({{ getBoundDoc(selectedPbUmku.umku_code, req)?.fileName }} • {{ getBoundDoc(selectedPbUmku.umku_code, req)?.fileSize }})</span>
                </div>
                <span class="text-[9px] bg-emerald-200/90 text-emerald-900 font-bold px-2 py-0.5 rounded font-mono shrink-0">
                  Tersimpan di VFC: {{ selectedPbUmku.title }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pernyataan Hukum -->
        <div class="pt-4 border-t border-gray-100">
          <label class="flex items-start space-x-2.5 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              v-model="getUmkuForm(selectedPbUmku.umku_code).declarationAgreed"
              class="mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span class="leading-relaxed">
              Saya menyatakan bahwa seluruh data karakteristik teknis dan dokumen persyaratan yang dilampirkan adalah sah, akurat, dan memenuhi standar teknis yang ditetapkan oleh <strong>{{ selectedPbUmku.authority }}</strong>.
            </span>
          </label>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            @click="$emit('switch-to-main')"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            ← Kembali ke Izin Utama
          </button>

          <button
            type="button"
            :disabled="isSubmittingUmku || !getUmkuForm(selectedPbUmku.umku_code).declarationAgreed"
            @click="handleUmkuSubmit(selectedPbUmku)"
            class="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <span>🔒</span>
            <span>{{ isSubmittingUmku ? 'Memproses Credential...' : 'Kirim Permohonan PB-UMKU & Terbitkan Credential →' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- STATE C: ISSUED / APPROVED (Verifiable Credential) -->
    <!-- ============================================== -->
    <div v-else class="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-6 space-y-6 shadow-xs">
      <div class="text-center py-4 space-y-2">
        <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          📜
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          Verifiable Credential PB-UMKU Telah Terbit!
        </h3>
        <p class="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
          Permohonan perizinan pendukung <strong>{{ selectedPbUmku.title }}</strong> telah disetujui oleh <strong>{{ selectedPbUmku.authority }}</strong> dan disegel sebagai W3C Verifiable Credential.
        </p>
      </div>

      <!-- Credential Card Details -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white p-5 rounded-2xl shadow-xl max-w-xl mx-auto space-y-4 border border-amber-600/40">
        <div class="flex items-center justify-between border-b border-slate-700 pb-3">
          <span class="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
            <span>📦</span>
            <span>{{ selectedPbUmku.title }}</span>
          </span>
          <span class="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            AKTIF (W3C VC)
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <span class="text-slate-400 block text-[10px]">Nomor Izin PB-UMKU:</span>
            <span class="font-bold text-white text-[11px] truncate block">
              {{ getUmkuCredential(selectedPbUmku.umku_code)?.claims?.nomor_izin_umku }}
            </span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">NIB Induk Terikat:</span>
            <span class="font-bold text-amber-300 text-[11px]">
              {{ getUmkuCredential(selectedPbUmku.umku_code)?.claims?.nomor_nib_induk }}
            </span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-400 block text-[10px]">Objek / Varietas Terdaftar:</span>
            <span class="text-white text-[11px]">
              {{ getUmkuCredential(selectedPbUmku.umku_code)?.claims?.nama_varietas }}
            </span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-400 block text-[10px]">Penerbit (Issuer):</span>
            <span class="text-slate-300 text-[11px]">
              {{ getUmkuCredential(selectedPbUmku.umku_code)?.issuerName }}
            </span>
          </div>
          <div class="col-span-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-700">
            <span class="text-slate-400 block text-[9px]">SHA-256 Cryptographic Proof Hash:</span>
            <span class="text-emerald-400 text-[9px] break-all block">
              {{ getUmkuCredential(selectedPbUmku.umku_code)?.proofHash }}
            </span>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-between text-xs">
          <span class="text-slate-400 text-[10px]">
            Diterbitkan: {{ getUmkuCredential(selectedPbUmku.umku_code)?.issuedAt }}
          </span>
          <button
            @click="$emit('switch-tab', 'credentials')"
            class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition"
          >
            Buka di VFC Credentials →
          </button>
        </div>
      </div>

      <!-- Next Actions -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          @click="$emit('switch-to-main')"
          class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition"
        >
          ← Kembali ke Izin Utama
        </button>
        <button
          v-if="nextUnsubmittedUmku"
          type="button"
          @click="$emit('switch-to-umku', nextUnsubmittedUmku.umku_code)"
          class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          Lanjut Ajukan PB-UMKU Berikutnya: {{ nextUnsubmittedUmku.title }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { usePermitStore } from '../../stores/permitStore';
import { useVfcStore, type VfcDocument } from '../../stores/vfcStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useCredentialStore } from '../../stores/credentialStore';

const props = defineProps<{
  selectedPbUmku: any;
  isMainPermitIssued: boolean;
  mainPermitRecord: any;
  isUmkuIssued: (code: string) => boolean;
  getUmkuCredential: (code: string) => any;
  nextUnsubmittedUmku: any;
}>();

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void;
  (e: 'switch-to-main'): void;
  (e: 'switch-to-umku', umkuCode: string): void;
  (e: 'toast', message: string): void;
}>();

const permitStore = usePermitStore();
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();
const credentialStore = useCredentialStore();

const isSubmittingUmku = ref(false);

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

const umkuFormData = reactive<Record<string, {
  varietyName: string;
  technicalDescription: string;
  testingLocation: string;
  selectedDocIds: string[];
  requirementDocs?: Record<string, string>;
  declarationAgreed: boolean;
}>>({});

if (permitStore.activeWizard.umkuFormData) {
  Object.assign(umkuFormData, JSON.parse(JSON.stringify(permitStore.activeWizard.umkuFormData)));
}

watch(
  () => permitStore.activeWizard.umkuFormData,
  (saved) => {
    if (saved && Object.keys(saved).length > 0) {
      Object.assign(umkuFormData, JSON.parse(JSON.stringify(saved)));
    }
  },
  { deep: true }
);

function getUmkuForm(umkuCode: string) {
  if (!umkuFormData[umkuCode]) {
    const saved = permitStore.activeWizard.umkuFormData?.[umkuCode];
    umkuFormData[umkuCode] = saved || {
      varietyName: 'Varietas Rimpang & Biofarmaka Sentul Unggul V1',
      technicalDescription: 'Pengujian kebaruan dan kemurnian genetik varietas lokal dengan stabilitas hasil panen 12.5 ton/ha dan resistensi hama teruji.',
      testingLocation: 'Stasiun Riset Agronomi Sentul & Balai Penelitian Tanaman Rempah dan Obat (Balittro)',
      selectedDocIds: [],
      requirementDocs: {},
      declarationAgreed: true
    };
  }
  if (!umkuFormData[umkuCode].requirementDocs) {
    umkuFormData[umkuCode].requirementDocs = {};
  }
  return umkuFormData[umkuCode];
}

function getUmkuRequirementDocId(umkuCode: string, req: string): string {
  const form = getUmkuForm(umkuCode);
  return form.requirementDocs?.[req] || '';
}

function getBoundDoc(umkuCode: string, req: string): VfcDocument | undefined {
  const docId = getUmkuRequirementDocId(umkuCode, req);
  if (!docId) return undefined;
  return currentCompanyDocs.value.find((d) => d.id === docId);
}

function onUmkuSelectDoc(e: Event, umkuCode: string, req: string) {
  const target = e.target as HTMLSelectElement;
  const docId = target.value;
  const form = getUmkuForm(umkuCode);
  if (!form.requirementDocs) form.requirementDocs = {};

  if (docId) {
    form.requirementDocs[req] = docId;
    if (!form.selectedDocIds.includes(docId)) {
      form.selectedDocIds.push(docId);
    }
    if (!permitStore.activeWizard.selectedVfcDocIds.includes(docId)) {
      permitStore.activeWizard.selectedVfcDocIds.push(docId);
    }
  } else {
    delete form.requirementDocs[req];
    form.selectedDocIds = Object.values(form.requirementDocs);
  }
  permitStore.activeWizard.umkuFormData = JSON.parse(JSON.stringify(umkuFormData));
  permitStore.persistDraft();
}

async function onUmkuUpload(e: Event, umku: any, req: string) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;

  // 1. Ensure folder in VFC exists under the specific UMKU's name
  const umkuCategory = await vfcStore.ensureUmkuCategory(umku.title, umku.umku_code);

  // 2. Store the file in VFC under the specific UMKU folder with descriptive title
  const newDoc = await vfcStore.addDocument({
    companyId: companyStore.activeCompanyId,
    category: umkuCategory.key,
    title: `${umku.title} - ${req}`,
    fileName: file.name,
    fileSize: fileSize === '0.0 MB' ? '850 KB' : fileSize,
    url: '#'
  });

  // 3. Update the field so that the user doesn't have to choose again from the dropdown list
  const form = getUmkuForm(umku.umku_code);
  if (!form.requirementDocs) form.requirementDocs = {};
  form.requirementDocs[req] = newDoc.id;

  if (!form.selectedDocIds.includes(newDoc.id)) {
    form.selectedDocIds.push(newDoc.id);
  }
  if (!permitStore.activeWizard.selectedVfcDocIds.includes(newDoc.id)) {
    permitStore.activeWizard.selectedVfcDocIds.push(newDoc.id);
  }

  permitStore.activeWizard.umkuFormData = JSON.parse(JSON.stringify(umkuFormData));
  await permitStore.persistDraft();
  target.value = '';

  emit('toast', `Berkas "${file.name}" berhasil diunggah ke folder "${umku.title}" dan otomatis ditautkan!`);
}

async function handleUmkuSubmit(umku: any) {
  isSubmittingUmku.value = true;
  const form = getUmkuForm(umku.umku_code);
  const mainPermit = props.mainPermitRecord;
  const nibNumber = mainPermit?.id || companyStore.activeCompany.nib || 'NIB-2026-992100';

  await credentialStore.issueCredential({
    category: 'PB_UMKU',
    title: `Verifiable PB-UMKU: ${umku.title}`,
    kbliCode: permitStore.activeWizard.kbli?.kbli_code || '01285',
    kbliTitle: permitStore.activeWizard.kbli?.title || 'Kegiatan Usaha',
    credentialType: 'VerifiableUMKU',
    issuerDid: umku.authority.includes('PVTPP')
      ? 'did:oss:kementan:pvtpp:gov:id'
      : 'did:oss:kementan:perkebunan:gov:id',
    issuerName: umku.authority,
    claims: {
      umku_code: umku.umku_code,
      nomor_izin_umku: `UMKU-${Date.now().toString().slice(-6)}/KEMTAN/2026`,
      nama_varietas: form.varietyName,
      deskripsi_teknis: form.technicalDescription,
      lokasi_pengujian: form.testingLocation,
      nomor_nib_induk: nibNumber,
      instansi_pembina: umku.authority,
      pnbp_status: umku.pnbp_fee?.includes('Rp 0') ? 'Bebas Tarif (Fasilitasi)' : 'Lunas Terverifikasi SIMPONI',
      status_izin: 'AKTIF & BERLAKU NASIONAL',
      dokumen_pendukung_vfc: form.selectedDocIds.length
    }
  });

  permitStore.activeWizard.umkuFormData = JSON.parse(JSON.stringify(umkuFormData));
  await permitStore.persistDraft();

  isSubmittingUmku.value = false;
  emit('toast', `Permohonan PB-UMKU "${umku.title}" berhasil diterbitkan!`);
}
</script>
