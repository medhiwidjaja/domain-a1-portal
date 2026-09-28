<template>
  <div class="min-h-screen bg-slate-100 text-gray-900 flex flex-col font-sans">
    <!-- Floating Dismissable Flash Cards for Real-Time Alerts -->
    <NotificationFlashCards
      @switch-tab="activeTab = $event"
      @open-vfc-folder="handleOpenVfcFolder"
    />

    <!-- Top Header -->
    <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md">
            OSS
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="font-extrabold text-base tracking-tight text-white">OSS</h1>
              <span class="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                Domain A1 — Pelaku Usaha PoC
              </span>
            </div>
            <p class="text-[11px] text-slate-400">National Business Licensing System Modernization</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">

          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              BS
            </div>
            <div class="hidden md:block text-left text-xs">
              <span class="font-bold block text-slate-200">Budi Santoso</span>
              <span class="text-slate-400 text-[10px]">Pelaku Usaha (Dukcapil Verified)</span>
            </div>
          </div>

          <!-- Mobile Toggle for VFC Island -->
          <button
            @click="showMobileVfc = !showMobileVfc"
            class="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs flex items-center space-x-1"
          >
            <span>📁 VFC</span>
            <span class="bg-blue-600 text-white px-1.5 py-0.2 rounded-full text-[9px]">
              {{ totalVfcItems }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Company Switcher Context Bar -->
    <CompanySwitcher />

    <!-- Main Navigation Bar -->
    <div class="bg-white border-b border-gray-200 shadow-xs sticky top-[57px] z-30">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <nav class="flex space-x-6 overflow-x-auto scrollbar-none">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-3.5 px-1 text-xs md:text-sm font-bold border-b-2 transition flex items-center space-x-2 whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            ]"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.badge !== undefined && tab.badge > 0"
              class="ml-1 bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-mono"
            >
              {{ tab.badge }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content Area: Split 2-Column Island Layout -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
      <div class="grid grid-cols-12 gap-6 items-start">
        <!-- LEFT COLUMN: Main Workspace (Dashboard / KBLI Search / Permit Wizard) -->
        <div class="col-span-12 lg:col-span-7 xl:col-span-8 space-y-6">
          <!-- WORKSPACE VIEW 1: DASHBOARD -->
          <div v-if="activeTab === 'dashboard'" class="space-y-6">
            <!-- Hero Overview Card -->
            <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div class="relative z-10 max-w-2xl">
                <span class="bg-blue-500/20 text-blue-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-blue-400/30">
                  Virtual Filing Cabinet (VFC) Architecture
                </span>
                <h2 class="text-2xl font-bold mt-3">Portal Layanan Mandiri Pelaku Usaha</h2>
                <p class="text-slate-300 text-xs mt-2 leading-relaxed">
                  Model <strong>Prepare → Submit → Review → Respond</strong>. Seluruh data profil dan dokumen Anda tersimpan aman pada Virtual Filing Cabinet di sebelah kanan. Anda dapat meninjau seluruh prasyarat dan SLA secara transparan sebelum mengirim permohonan.
                </p>

                <div class="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    @click="activeTab = 'kbli'"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
                  >
                    <span>🔍 Cari Kode KBLI & Preview Aturan</span>
                  </button>
                  <button
                    @click="activeTab = 'wizard'"
                    class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
                  >
                    <span>📝 Buka Form Pengajuan Izin</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Active Permits SLA Tracker List -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <span>📊 Progress Permohonan Izin & SLA Real-Time</span>
                  <span class="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-mono">
                    {{ activeApplications.length }} Permohonan
                  </span>
                </h3>
              </div>

              <div v-if="activeApplications.length === 0" class="bg-white rounded-xl p-10 text-center border text-gray-500">
                <p class="font-semibold text-gray-700 text-sm">Belum ada permohonan izin aktif untuk entitas ini.</p>
                <p class="text-xs text-gray-400 mt-1">Pilih tab "Temukan" untuk memulai pengajuan permohonan baru.</p>
              </div>

              <div v-else class="space-y-4">
                <SlaTracker
                  v-for="app in activeApplications"
                  :key="app.id"
                  :application="app"
                  @apply-umku="handleApplyUmkuFromDashboard"
                />
              </div>
            </div>
          </div>

          <!-- WORKSPACE VIEW 2: KBLI SEARCH & DMN PREVIEW -->
          <div v-else-if="activeTab === 'kbli'">
            <KbliSearch @select-kbli="onSelectKbliForWizard" />
          </div>

          <!-- WORKSPACE VIEW 3: PERMIT FILING WIZARD -->
          <div v-else-if="activeTab === 'wizard'">
            <PermitWizard @switch-tab="activeTab = $event" />
          </div>

          <!-- WORKSPACE VIEW 4: INBOX & NOTIFICATIONS -->
          <div v-else-if="activeTab === 'inbox'">
            <InboxTab
              @switch-tab="activeTab = $event"
              @open-vfc-folder="handleOpenVfcFolder"
            />
          </div>
        </div>

        <!-- RIGHT COLUMN: Virtual Filing Cabinet Island (Desktop) -->
        <div class="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-[130px]">
          <VirtualFilingCabinet ref="vfcRef" />
        </div>
      </div>
    </main>

    <!-- Mobile Drawer for Virtual Filing Cabinet Island -->
    <Teleport to="body">
      <div
        v-if="showMobileVfc"
        class="fixed inset-0 z-[80] lg:hidden flex justify-end bg-slate-900/60 backdrop-blur-xs"
        @click.self="showMobileVfc = false"
      >
        <div class="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
          <div class="p-3 bg-slate-900 text-white flex justify-between items-center">
            <span class="text-xs font-bold">Virtual Filing Cabinet</span>
            <button @click="showMobileVfc = false" class="text-slate-400 hover:text-white p-1">
              ✕
            </button>
          </div>
          <div class="flex-1 overflow-hidden">
            <VirtualFilingCabinet ref="vfcMobileRef" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCompanyStore } from './stores/companyStore';
import { useVfcStore } from './stores/vfcStore';
import { usePermitStore, type KbliItem } from './stores/permitStore';
import { useNotificationStore } from './stores/notificationStore';
import { useCredentialStore } from './stores/credentialStore';
import { getAppState, setAppState } from './utils/idbStorage';

import CompanySwitcher from './components/CompanySwitcher.vue';
import VirtualFilingCabinet from './components/VirtualFilingCabinet.vue';
import KbliSearch from './components/KbliSearch.vue';
import PermitWizard from './components/PermitWizard.vue';
import SlaTracker from './components/SlaTracker.vue';
import NotificationFlashCards from './components/NotificationFlashCards.vue';
import InboxTab from './components/InboxTab.vue';

const companyStore = useCompanyStore();
const vfcStore = useVfcStore();
const permitStore = usePermitStore();
const notificationStore = useNotificationStore();
const credentialStore = useCredentialStore();

const activeTab = ref<'dashboard' | 'kbli' | 'wizard' | 'inbox'>('dashboard');
const showMobileVfc = ref(false);
const vfcRef = ref<any>(null);
const vfcMobileRef = ref<any>(null);

onMounted(async () => {
  await companyStore.init();
  await vfcStore.init();
  await permitStore.init();
  await credentialStore.init();
  await notificationStore.init();

  const savedTab = await getAppState<'dashboard' | 'kbli' | 'wizard' | 'inbox'>('current_active_tab');
  if (savedTab && ['dashboard', 'kbli', 'wizard', 'inbox'].includes(savedTab)) {
    activeTab.value = savedTab;
  }
});

watch(activeTab, async (newTab) => {
  await setAppState('current_active_tab', newTab);
});

function handleOpenVfcFolder(folderKey: string) {
  vfcRef.value?.openFolder?.(folderKey);
  vfcMobileRef.value?.openFolder?.(folderKey);
}

const tabs = computed(() => [
  { id: 'dashboard' as const, label: 'Home', icon: '🏠', badge: activeApplications.value.length },
  { id: 'kbli' as const, label: 'Temukan', icon: '🔍' },
  { id: 'wizard' as const, label: 'Siapkan', icon: '📝' },
  { id: 'inbox' as const, label: 'Kotak Masuk', icon: '📬', badge: notificationStore.unreadCount }
]);

const activeApplications = computed(() => permitStore.activeApplications);

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

const approvedCredentials = computed(() => permitStore.approvedCredentials);

const totalVfcItems = computed(() => {
  return currentCompanyDocs.value.length + approvedCredentials.value.length;
});

function onSelectKbliForWizard(payload: { kbli: KbliItem; scope?: any } | KbliItem, maybeScope?: any) {
  let kbli: KbliItem;
  let scope: any;
  if (payload && 'kbli' in payload) {
    kbli = payload.kbli;
    scope = payload.scope;
  } else {
    kbli = payload as KbliItem;
    scope = maybeScope;
  }
  permitStore.startWizardForKbli(kbli, scope);
  activeTab.value = 'wizard';
}

function handleApplyUmkuFromDashboard(payload: { application: any; umku: any }) {
  const kbli = permitStore.catalog.find((k) => k.kbli_code === payload.application.kbliCode);
  if (kbli) {
    const scope =
      kbli.scopes?.find((s: any) => s.sequence === payload.application.scopeSequence) ||
      kbli.scopes?.find((s: any) => Array.isArray(s.pb_umku) && s.pb_umku.some((u: any) => u.umku_code === payload.umku.umku_code)) ||
      kbli.scopes?.[0];

    permitStore.startWizardForKbli(kbli, scope);

    // If main permit was approved, retain step 6
    if (payload.application.status === 'APPROVED' || payload.application.stepIndex >= 4) {
      permitStore.activeWizard.step = 6;
    }

    // Set activeTrack to the specific UMKU code
    permitStore.activeWizard.activeTrack = payload.umku.umku_code;
    permitStore.persistDraft();
  }
  activeTab.value = 'wizard';
}
</script>
