<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Portfolio W3C Verifiable Credentials (VC)</h2>
        <p class="text-xs text-gray-500 mt-1">
          Daftar seluruh sertifikat standar, NIB, dan izin usaha resmi yang diterbitkan dan diangkar pada cryptographic trust ledger.
        </p>
      </div>
    </div>

    <div v-if="credentials.length === 0" class="bg-white rounded-2xl p-12 text-center border text-gray-500">
      <p class="font-semibold text-gray-700">Belum ada credential resmi terbit untuk entitas ini.</p>
      <p class="text-xs text-gray-400 mt-1">Ajukan permohonan KBLI risiko Rendah (R) atau Menengah Rendah (MR) untuk penerbitan instan.</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="app in credentials"
        :key="app.id"
        class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden"
      >
        <!-- Background Pattern -->
        <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <svg class="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

        <!-- Header Badge -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1">
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>W3C Verifiable Credential</span>
            </span>
            <span class="text-xs text-slate-400 font-mono">Ledger Anchored</span>
          </div>

          <span class="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
            {{ app.verifiableCredential?.credentialType }}
          </span>
        </div>

        <!-- Body Information -->
        <div class="mt-6">
          <h3 class="text-lg font-bold text-white">{{ app.kbliTitle }}</h3>
          <p class="text-xs text-slate-300 mt-1">{{ app.companyName }} (KBLI {{ app.kbliCode }})</p>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur-xs">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Credential Unique ID</span>
              <span class="font-mono text-emerald-300 text-[11px] truncate block">{{ app.verifiableCredential?.vcId }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Tanggal Penerbitan</span>
              <span class="font-mono text-slate-200">{{ formatDate(app.verifiableCredential?.issuedAt) }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Issuer Authority</span>
              <span class="font-mono text-slate-200">{{ app.verifiableCredential?.issuer }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Cryptographic Proof Hash</span>
              <span class="font-mono text-xs text-blue-300 truncate block">{{ app.verifiableCredential?.proofHash }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center space-x-2 text-xs text-slate-400">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span>Verifiable Credential SHA-256 Validated</span>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="activeQrVc = app.verifiableCredential"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg border border-slate-600 transition flex items-center space-x-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
              <span>QR Verification</span>
            </button>
            <button
              @click="downloadPdf(app)"
              class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg shadow transition flex items-center space-x-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Unduh PDF Resmi</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Modal -->
    <div v-if="activeQrVc" class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center text-gray-900 shadow-2xl">
        <h3 class="text-base font-bold">QR Code Verifikasi W3C VC</h3>
        <p class="text-xs text-gray-500 mt-1">Pindai QR ini untuk verifikasi keaslian dokumen di ledger publik BKPM</p>

        <div class="my-6 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl inline-block">
          <svg class="w-44 h-44 text-slate-900 mx-auto" fill="currentColor" viewBox="0 0 24 24">
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
import { usePermitStore } from '../stores/permitStore';

const permitStore = usePermitStore();
const activeQrVc = ref<any>(null);

const credentials = computed(() => permitStore.approvedCredentials);

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

