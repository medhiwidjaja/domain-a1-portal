<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Inbox Subsystem
            </span>
            <span class="text-xs text-slate-300 font-mono">
              PP 28/2025 Centralized Notifier
            </span>
          </div>
          <h2 class="text-xl font-extrabold mt-1.5 flex items-center space-x-2">
            <span>📬 Kotak Masuk & Notifikasi K/L/D</span>
            <span v-if="unreadCount > 0" class="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
              {{ unreadCount }} Baru
            </span>
          </h2>
          <p class="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Pusat instruksi resmi dan pemberitahuan interaktif perizinan: kode tagihan PNBP Simponi, catatan revisi berkas persyaratan dasar dari instansi teknis, dan verifikasi penerbitan W3C Verifiable Credentials.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            ✓ Tandai Semua Dibaca
          </button>
          <button
            @click="showSimulator = !showSimulator"
            class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>⚡</span>
            <span>{{ showSimulator ? 'Tutup Simulator' : 'Simulator Notifikasi' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Simulator Control Box (Target Architecture Simulation) -->
    <div
      v-if="showSimulator"
      class="bg-blue-50 border border-blue-200 rounded-2xl p-4 transition space-y-3"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-base">🛠️</span>
          <div>
            <h4 class="text-xs font-bold text-blue-900">Simulator Alur Integrasi Eksternal (Zone C In-Browser)</h4>
            <p class="text-[11px] text-blue-700">Simulasikan event callback dari kementerian eksternal untuk menguji respon sistem:</p>
          </div>
        </div>
        <span class="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-mono font-bold">
          Testing Tools
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          @click="notificationStore.simulatePnbpTrigger()"
          class="p-2.5 bg-white hover:bg-amber-50/50 border border-amber-300 rounded-xl text-left transition space-y-1 shadow-2xs"
        >
          <div class="flex items-center space-x-1.5 text-amber-700 font-bold text-xs">
            <span>💳</span>
            <span>Tagihan PNBP Simponi</span>
          </div>
          <p class="text-[10px] text-gray-500 line-clamp-2">
            Simulasikan pengiriman Surat Perintah Setor PNBP oleh Kementerian ATR/BPN atau SIMBG.
          </p>
        </button>

        <button
          type="button"
          @click="notificationStore.simulateRevisionTrigger()"
          class="p-2.5 bg-white hover:bg-orange-50/50 border border-orange-300 rounded-xl text-left transition space-y-1 shadow-2xs"
        >
          <div class="flex items-center space-x-1.5 text-orange-700 font-bold text-xs">
            <span>⚠️</span>
            <span>Permintaan Revisi Berkas</span>
          </div>
          <p class="text-[10px] text-gray-500 line-clamp-2">
            Simulasikan status perbaikan berkas (Status 46) dari Tim Uji Teknis Lingkungan/PUPR.
          </p>
        </button>

        <button
          type="button"
          @click="notificationStore.simulateCredentialTrigger()"
          class="p-2.5 bg-white hover:bg-emerald-50/50 border border-emerald-300 rounded-xl text-left transition space-y-1 shadow-2xs"
        >
          <div class="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs">
            <span>📜</span>
            <span>Penerbitan Credential Baru</span>
          </div>
          <p class="text-[10px] text-gray-500 line-clamp-2">
            Simulasikan pencetakan W3C Verifiable Credential baru ke Virtual Filing Cabinet.
          </p>
        </button>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
      <!-- Filter Chips -->
      <div class="flex items-center space-x-1.5 overflow-x-auto scrollbar-none text-xs">
        <button
          v-for="filter in filterOptions"
          :key="filter.key"
          @click="activeFilter = filter.key"
          :class="[
            'px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center space-x-1',
            activeFilter === filter.key
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          ]"
        >
          <span>{{ filter.label }}</span>
          <span
            v-if="filter.count > 0"
            :class="[
              'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
              activeFilter === filter.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            ]"
          >
            {{ filter.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Notifications Stream (Sorted Latest First) -->
    <div v-if="filteredNotifications.length === 0" class="bg-white border border-gray-200 rounded-2xl p-12 text-center">
      <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
      </div>
      <h3 class="text-sm font-bold text-gray-900">Tidak Ada Notifikasi dalam Kategori Ini</h3>
      <p class="text-xs text-gray-500 max-w-sm mx-auto mt-1">
        Semua instruksi perizinan, tagihan, dan pembaruan dokumen telah selesai diproses.
      </p>
    </div>

    <div v-else class="space-y-3.5">
      <div
        v-for="item in filteredNotifications"
        :key="item.id"
        :class="[
          'bg-white border rounded-2xl p-5 shadow-xs transition relative overflow-hidden',
          !item.read ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'
        ]"
      >
        <!-- Unread Indicator Dot -->
        <div
          v-if="!item.read"
          class="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"
          title="Belum Dibaca"
        ></div>

        <div class="flex items-start space-x-3.5">
          <!-- Icon Circle -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-inner"
            :class="[
              item.type === 'CREDENTIAL_ISSUED' ? 'bg-emerald-100 text-emerald-800' :
              item.type === 'PNBP_BILLING' ? 'bg-amber-100 text-amber-800' :
              item.type === 'DOCUMENT_REVISION' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
            ]"
          >
            {{
              item.type === 'CREDENTIAL_ISSUED' ? '📜' :
              item.type === 'PNBP_BILLING' ? '💳' :
              item.type === 'DOCUMENT_REVISION' ? '⚠️' : '🔔'
            }}
          </div>

          <!-- Main Info -->
          <div class="flex-1 space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider"
                :class="[
                  item.type === 'CREDENTIAL_ISSUED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  item.type === 'PNBP_BILLING' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  item.type === 'DOCUMENT_REVISION' ? 'bg-orange-100 text-orange-900 border border-orange-200' :
                  'bg-blue-100 text-blue-900 border border-blue-200'
                ]"
              >
                {{
                  item.type === 'CREDENTIAL_ISSUED' ? 'W3C Credential Terbit' :
                  item.type === 'PNBP_BILLING' ? 'Tagihan PNBP Simponi' :
                  item.type === 'DOCUMENT_REVISION' ? 'Perbaikan Berkas' : 'Pemberitahuan'
                }}
              </span>

              <span class="text-[11px] text-gray-400 font-mono">
                {{ item.timestamp }}
              </span>

              <span v-if="!item.read" class="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                Baru
              </span>
            </div>

            <h3 class="text-sm font-bold text-gray-900 leading-snug">{{ item.title }}</h3>
            <p class="text-xs text-gray-600 leading-relaxed">{{ item.message }}</p>

            <!-- Specific Interactive Box: PNBP Billing -->
            <div
              v-if="item.type === 'PNBP_BILLING' && item.metadata"
              class="bg-amber-50/80 border border-amber-200 rounded-xl p-3 mt-2 space-y-2 text-xs"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <div>
                  <span class="text-gray-500">Kode Billing Simponi:</span>
                  <span class="font-mono font-bold text-gray-900 ml-1.5">{{ item.metadata.billingCode }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Nominal:</span>
                  <span class="font-bold text-amber-900 ml-1.5 text-sm">
                    Rp {{ Number(item.metadata.amount || 0).toLocaleString('id-ID') }}
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-amber-200/60">
                <span
                  class="font-mono text-[10px] px-2 py-0.5 rounded font-bold"
                  :class="item.metadata.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'"
                >
                  {{ item.metadata.paymentStatus === 'PAID' ? '✅ LUNAS (TERVERIFIKASI KAS NEGARA)' : '⏳ MENUNGGU PEMBAYARAN' }}
                </span>

                <button
                  v-if="item.metadata.paymentStatus !== 'PAID'"
                  type="button"
                  @click="notificationStore.payPnbp(item.id)"
                  class="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center space-x-1"
                >
                  <span>💳</span>
                  <span>Bayar Sekarang (Simulasi)</span>
                </button>
              </div>
            </div>

            <!-- Specific Interactive Box: Document Revision -->
            <div
              v-if="item.type === 'DOCUMENT_REVISION' && item.metadata"
              class="bg-orange-50/80 border border-orange-200 rounded-xl p-3 mt-2 space-y-2 text-xs"
            >
              <div class="text-[11px] text-gray-700">
                <span class="text-gray-500">Target Dokumen:</span>
                <span class="font-bold text-orange-950 ml-1.5">{{ item.metadata.revisionTargetDoc }}</span>
              </div>
              <div v-if="item.metadata.revisionNote" class="text-[11px] bg-white p-2 rounded border border-orange-200 font-mono text-emerald-800">
                Catatan Pengajuan Revisi: {{ item.metadata.revisionNote }}
              </div>

              <div class="flex justify-end pt-1">
                <button
                  type="button"
                  @click="openRevisionModal(item)"
                  class="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center space-x-1"
                >
                  <span>📤</span>
                  <span>Unggah Berkas Revisi</span>
                </button>
              </div>
            </div>

            <!-- Specific Interactive Box: Credential Issued -->
            <div
              v-if="item.type === 'CREDENTIAL_ISSUED' && item.metadata"
              class="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div class="space-y-0.5">
                <div class="flex items-center space-x-1.5">
                  <span class="font-bold text-emerald-900">{{ item.metadata.credentialType }}</span>
                  <span class="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono">W3C VC</span>
                </div>
                <div class="font-mono text-[10px] text-gray-500 truncate max-w-sm">
                  ID: {{ item.metadata.credentialId }}
                </div>
              </div>

              <button
                type="button"
                @click="openCredentialInVfc(item)"
                class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition shrink-0 flex items-center space-x-1"
              >
                <span>📜</span>
                <span>Lihat di Folder VFC →</span>
              </button>
            </div>

            <!-- Card Actions Footer -->
            <div class="flex items-center justify-between pt-2 text-[11px] text-gray-400">
              <button
                v-if="!item.read"
                type="button"
                @click="notificationStore.markAsRead(item.id)"
                class="hover:text-blue-600 font-medium transition"
              >
                Tandai Sudah Dibaca
              </button>
              <span v-else class="text-gray-400">Telah dibaca</span>

              <button
                type="button"
                @click="notificationStore.removeNotification(item.id)"
                class="hover:text-red-600 transition"
              >
                Hapus Notifikasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Unggah Berkas Revisi -->
    <Teleport to="body">
      <div v-if="activeRevisionNotif" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b">
            <div class="flex items-center space-x-2 text-orange-600">
              <span class="text-xl">📤</span>
              <h3 class="text-sm font-bold text-gray-900">Unggah Perbaikan Berkas Dokumen</h3>
            </div>
            <button @click="activeRevisionNotif = null" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="bg-orange-50 p-3 rounded-xl border border-orange-200 text-orange-900 text-[11px]">
              Dokumen: <strong>{{ activeRevisionNotif.metadata?.revisionTargetDoc }}</strong><br/>
              Instansi Pemeriksa: <strong>{{ activeRevisionNotif.metadata?.authorityName }}</strong>
            </div>

            <div>
              <label class="block font-semibold text-gray-700 mb-1">Catatan Tambahan / Uraian Perbaikan</label>
              <textarea
                v-model="revisionText"
                rows="3"
                placeholder="Jelaskan penyesuaian yang telah dilakukan pada dokumen baru ini..."
                class="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              ></textarea>
            </div>

            <div>
              <label class="block font-semibold text-gray-700 mb-1">Pilih File Baru (PDF / GeoJSON)</label>
              <input
                type="file"
                @change="onRevisionFileSelected"
                class="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-800 hover:file:bg-orange-200 cursor-pointer"
              />
              <p v-if="revisionFileName" class="text-[11px] text-gray-600 mt-1 font-mono">
                📁 File terpilih: <span class="font-bold text-gray-800">{{ revisionFileName }}</span>
              </p>
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              @click="activeRevisionNotif = null"
              class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="button"
              @click="submitRevisionFile"
              class="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow transition"
            >
              Kirim Perbaikan ke Tim Uji
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotificationStore, type NotificationItem } from '../stores/notificationStore';
import { useVfcStore } from '../stores/vfcStore';
import { useCompanyStore } from '../stores/companyStore';

const emit = defineEmits(['switch-tab', 'open-vfc-folder']);
const notificationStore = useNotificationStore();
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();

const showSimulator = ref(false);
const activeFilter = ref<'ALL' | 'CREDENTIAL' | 'PNBP' | 'REVISION' | 'UNREAD'>('ALL');
const activeRevisionNotif = ref<NotificationItem | null>(null);
const revisionText = ref('');
const revisionSelectedFile = ref<File | null>(null);
const revisionFileName = ref('');

function onRevisionFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    revisionSelectedFile.value = target.files[0];
    revisionFileName.value = target.files[0].name;
  }
}

const allNotifications = computed(() => notificationStore.activeCompanyNotifications);
const unreadCount = computed(() => notificationStore.unreadCount);

const filterOptions = computed(() => [
  { key: 'ALL' as const, label: 'Semua Notifikasi', count: allNotifications.value.length },
  { key: 'CREDENTIAL' as const, label: '📜 Verifiable Credential', count: allNotifications.value.filter((n) => n.type === 'CREDENTIAL_ISSUED').length },
  { key: 'PNBP' as const, label: '💳 Tagihan PNBP', count: allNotifications.value.filter((n) => n.type === 'PNBP_BILLING').length },
  { key: 'REVISION' as const, label: '⚠️ Perbaikan Berkas', count: allNotifications.value.filter((n) => n.type === 'DOCUMENT_REVISION').length },
  { key: 'UNREAD' as const, label: '● Belum Dibaca', count: unreadCount.value }
]);

const filteredNotifications = computed(() => {
  let list = allNotifications.value;
  if (activeFilter.value === 'CREDENTIAL') {
    list = list.filter((n) => n.type === 'CREDENTIAL_ISSUED');
  } else if (activeFilter.value === 'PNBP') {
    list = list.filter((n) => n.type === 'PNBP_BILLING');
  } else if (activeFilter.value === 'REVISION') {
    list = list.filter((n) => n.type === 'DOCUMENT_REVISION');
  } else if (activeFilter.value === 'UNREAD') {
    list = list.filter((n) => !n.read);
  }
  return list;
});

function markAllAsRead() {
  notificationStore.markAllAsRead();
}

function openRevisionModal(notif: NotificationItem) {
  activeRevisionNotif.value = notif;
  revisionText.value = 'Dokumen teknis telah disesuaikan dengan rekomendasi hasil telaah.';
  revisionSelectedFile.value = null;
  revisionFileName.value = '';
}

async function submitRevisionFile() {
  if (!activeRevisionNotif.value) return;
  const notif = activeRevisionNotif.value;

  if (revisionSelectedFile.value) {
    const file = revisionSelectedFile.value;
    const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;
    await vfcStore.addDocument({
      companyId: notif.companyId || companyStore.activeCompanyId,
      category: notif.metadata?.folderKey || 'LINGKUNGAN',
      title: `Berkas Revisi: ${notif.metadata?.revisionTargetDoc || 'Dokumen Teknis'}`,
      fileName: file.name,
      fileSize: fileSize === '0.0 MB' ? '1.2 MB' : fileSize,
      url: '#'
    });
  }

  await notificationStore.submitRevision(notif.id, revisionText.value);
  activeRevisionNotif.value = null;
  revisionText.value = '';
  revisionSelectedFile.value = null;
  revisionFileName.value = '';
}

function openCredentialInVfc(notif: NotificationItem) {
  notificationStore.markAsRead(notif.id);
  emit('switch-tab', 'dashboard');
  emit('open-vfc-folder', 'CREDENTIALS');
}
</script>
