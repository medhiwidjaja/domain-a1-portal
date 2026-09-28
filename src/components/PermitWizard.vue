<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative">
    <!-- Save Toast Notification -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div
        v-if="saveToastMessage"
        class="fixed top-20 right-6 z-[110] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 border border-slate-700 text-xs font-semibold"
      >
        <span class="text-emerald-400 text-base">💾</span>
        <span>{{ saveToastMessage }}</span>
      </div>
    </transition>

    <!-- State 0: No KBLI Selected -->
    <div v-if="!permitStore.activeWizard.kbli" class="text-center py-16">
      <div class="p-4 bg-blue-50 text-blue-600 rounded-2xl inline-block mb-3">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900">Belum Ada KBLI Yang Dipilih</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto mt-1">
        Silakan pilih kode KBLI dan ruang lingkup kegiatan (scope) terlebih dahulu dari menu Pencarian KBLI untuk memulai formulir Persyaratan Dasar.
      </p>
      <button
        @click="$emit('switch-tab', 'kbli')"
        class="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
      >
        Buka Pencarian KBLI →
      </button>
    </div>

    <!-- Active Wizard Flow -->
    <div v-else class="space-y-6">
      <!-- Stepper Header & Track Switcher -->
      <WizardHeader
        :kbli="permitStore.activeWizard.kbli"
        :currentStepNumber="currentStepNumber"
        :totalStepCount="totalStepCount"
        :currentStep="permitStore.activeWizard.step"
        :activeTrack="activeTrack"
        :activeKbliUmkuList="activeKbliUmkuList"
        :isMainPermitIssued="isMainPermitIssued"
        :isUmkuIssued="isUmkuIssued"
        :allAccordionsOpen="allAccordionsOpen"
        @switch-tab="$emit('switch-tab', $event)"
        @update:activeTrack="activeTrack = $event"
        @toggle-all-accordions="toggleAllAccordions"
      />

      <!-- Accordion Form Container (Steps 1 to 5, Main Track Only) -->
      <div v-if="activeTrack === 'MAIN' && permitStore.activeWizard.step !== 6" class="space-y-4">
        <!-- Stage 1: Profil Usaha, Parameter KBLI & Aturan DMN -->
        <WizardStage1Profile
          :isOpen="openAccordions[1]"
          :isCompleted="permitStore.activeWizard.step > 1"
          @toggle="toggleAccordion(1)"
          @save="handleSavePhase(1)"
          @next="handleLanjut(1, 2)"
        />

        <!-- Stage 2: Persyaratan Dasar 1 — KKPR & Studio Spasial -->
        <WizardStage2Kkpr
          :isOpen="openAccordions[2]"
          :isCompleted="permitStore.activeWizard.step > 2"
          @toggle="toggleAccordion(2)"
          @save="handleSavePhase(2)"
          @next="handleLanjut(2, 3)"
          @open-spatial-picker="showVfcParcelSelectorModal = true"
        />

        <!-- Stage 3: Persyaratan Dasar 2 — Persetujuan Lingkungan -->
        <WizardStage3Environmental
          :isOpen="openAccordions[3]"
          :isCompleted="permitStore.activeWizard.step > 3"
          @toggle="toggleAccordion(3)"
          @save="handleSavePhase(3)"
          @next="handleLanjut(3, 4)"
        />

        <!-- Stage 4: Persyaratan Dasar 3 — Bangunan Gedung (PBG & SLF) -->
        <WizardStage4Building
          :isOpen="openAccordions[4]"
          :isCompleted="permitStore.activeWizard.step > 4"
          @toggle="toggleAccordion(4)"
          @save="handleSavePhase(4)"
          @next="handleLanjut(4, 5)"
        />

        <!-- Stage 5: Syarat Khusus KBLI & Verifikasi Dokumen VFC -->
        <WizardStage5Documents
          :isOpen="openAccordions[5]"
          @toggle="toggleAccordion(5)"
          @save="handleSavePhase(5)"
          @open-precommit="showPreCommitModal = true"
        />
      </div>

      <!-- Step 6: Success & Transmitted (Main Track Only) -->
      <WizardStep6Success
        v-if="activeTrack === 'MAIN' && permitStore.activeWizard.step === 6"
        :activeKbliUmkuList="activeKbliUmkuList"
        :isUmkuIssued="isUmkuIssued"
        @switch-tab="$emit('switch-tab', $event)"
        @select-umku="activeTrack = $event"
      />

      <!-- PB-UMKU Track Interface (When activeTrack !== 'MAIN') -->
      <WizardUmkuTrack
        v-if="activeTrack !== 'MAIN' && selectedPbUmku"
        :selectedPbUmku="selectedPbUmku"
        :isMainPermitIssued="isMainPermitIssued"
        :mainPermitRecord="mainPermitRecord"
        :isUmkuIssued="isUmkuIssued"
        :getUmkuCredential="getUmkuCredential"
        :nextUnsubmittedUmku="nextUnsubmittedUmku"
        @switch-tab="$emit('switch-tab', $event)"
        @switch-to-main="activeTrack = 'MAIN'"
        @switch-to-umku="activeTrack = $event"
        @toast="showToast"
      />
    </div>

    <!-- Modals -->
    <WizardPreCommitModal
      :show="showPreCommitModal"
      :mockDigest="mockDigest"
      @close="showPreCommitModal = false"
      @confirm="handleConfirmSubmit"
    />

    <WizardSpatialPickerModal
      :show="showVfcParcelSelectorModal"
      @close="showVfcParcelSelectorModal = false"
      @select-parcel="selectParcelFromVfc"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { usePermitStore } from '../stores/permitStore';
import { useCompanyStore } from '../stores/companyStore';
import { useCredentialStore } from '../stores/credentialStore';
import { useNotificationStore } from '../stores/notificationStore';
import type { SpatialParcelAsset } from '../stores/spatialStore';

import WizardHeader from './wizard/WizardHeader.vue';
import WizardStage1Profile from './wizard/WizardStage1Profile.vue';
import WizardStage2Kkpr from './wizard/WizardStage2Kkpr.vue';
import WizardStage3Environmental from './wizard/WizardStage3Environmental.vue';
import WizardStage4Building from './wizard/WizardStage4Building.vue';
import WizardStage5Documents from './wizard/WizardStage5Documents.vue';
import WizardStep6Success from './wizard/WizardStep6Success.vue';
import WizardUmkuTrack from './wizard/WizardUmkuTrack.vue';
import WizardPreCommitModal from './wizard/WizardPreCommitModal.vue';
import WizardSpatialPickerModal from './wizard/WizardSpatialPickerModal.vue';

defineEmits(['switch-tab']);

const permitStore = usePermitStore();
const companyStore = useCompanyStore();
const credentialStore = useCredentialStore();
const notificationStore = useNotificationStore();

const showPreCommitModal = ref(false);
const showVfcParcelSelectorModal = ref(false);
const saveToastMessage = ref<string | null>(null);

function showToast(message: string, duration = 3500) {
  saveToastMessage.value = message;
  setTimeout(() => {
    saveToastMessage.value = null;
  }, duration);
}

// Accordion expansion state for Steps 1 through 5 (hydrated from store if present)
const openAccordions = reactive<Record<number, boolean>>({
  1: permitStore.activeWizard.openAccordions?.[1] ?? (permitStore.activeWizard.step === 1),
  2: permitStore.activeWizard.openAccordions?.[2] ?? (permitStore.activeWizard.step === 2),
  3: permitStore.activeWizard.openAccordions?.[3] ?? (permitStore.activeWizard.step === 3),
  4: permitStore.activeWizard.openAccordions?.[4] ?? (permitStore.activeWizard.step === 4),
  5: permitStore.activeWizard.openAccordions?.[5] ?? (permitStore.activeWizard.step === 5)
});

watch(
  () => permitStore.activeWizard.openAccordions,
  (stored) => {
    if (stored) {
      for (const k of [1, 2, 3, 4, 5]) {
        if (stored[k] !== undefined) {
          openAccordions[k] = stored[k];
        }
      }
    }
  },
  { deep: true }
);

watch(
  () => permitStore.activeWizard.step,
  (newStep) => {
    if (newStep >= 1 && newStep <= 5) {
      openAccordions[newStep] = true;
    }
  }
);

function toggleAccordion(stepNumber: number) {
  openAccordions[stepNumber] = !openAccordions[stepNumber];
  if (openAccordions[stepNumber]) {
    permitStore.setWizardStep(stepNumber);
  }
}

const allAccordionsOpen = computed(() => {
  return [1, 2, 3, 4, 5].every((s) => openAccordions[s]);
});

function toggleAllAccordions() {
  const target = !allAccordionsOpen.value;
  for (let s = 1; s <= 5; s++) {
    openAccordions[s] = target;
  }
}

async function handleSavePhase(phaseNumber: number) {
  await permitStore.persistDraft();
  showToast(`Draf Tahap ${phaseNumber} berhasil disimpan ke IndexedDB.`, 3000);
}

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

async function handleLanjut(fromStep: number, toStep: number) {
  // If moving past Tahap 2 (KKPR)
  if (fromStep === 2 && toStep === 3) {
    await credentialStore.issueCredential({
      category: 'KKPR',
      title: `Verifiable KKPR (Tata Ruang: ${permitStore.activeWizard.formData.alamat_usaha || 'Sentul'})`,
      kbliCode: permitStore.activeWizard.kbli?.kbli_code || '01285',
      kbliTitle: permitStore.activeWizard.kbli?.title || 'Kegiatan Usaha',
      credentialType: isKkprAutomatic.value ? 'VerifiableKonfirmasiKKPR' : 'VerifiablePersetujuanKKPR',
      issuerDid: 'did:oss:atr-bpn:gov:id',
      issuerName: 'Kementerian ATR/BPN',
      claims: {
        nomor_kkpr: permitStore.activeWizard.formData.nomor_pkkpr || `056000000002-${Date.now().toString().slice(-4)}`,
        status_kesesuaian: isKkprAutomatic.value ? 'Konfirmasi Otomatis (RDTR Sesuai)' : 'Persetujuan PKKPR Valid',
        luas_tanah_m2: permitStore.activeWizard.formData.luas_tanah,
        kdb_maksimum: `${permitStore.activeWizard.formData.koefisien_dasar_bangunan}%`,
        klb_maksimum: `${permitStore.activeWizard.formData.koefisien_lantai_bangunan}`,
        lokasi: permitStore.activeWizard.formData.alamat_usaha,
        kawasan: permitStore.activeWizard.formData.nama_kawasan
      }
    });
  }

  // If moving past Tahap 3 (Lingkungan)
  if (fromStep === 3 && toStep === 4) {
    await credentialStore.issueCredential({
      category: 'LINGKUNGAN',
      title: `Verifiable ${requiredEnvironmentalDocType.value.toUpperCase()} (Persetujuan Lingkungan)`,
      kbliCode: permitStore.activeWizard.kbli?.kbli_code || '01285',
      kbliTitle: permitStore.activeWizard.kbli?.title || 'Kegiatan Usaha',
      credentialType: requiredEnvironmentalDocType.value === 'sppl' ? 'VerifiableSPPL' : 'VerifiablePKPLH',
      issuerDid: 'did:oss:klhk:gov:id',
      issuerName: 'Kementerian Lingkungan Hidup dan Kehutanan',
      claims: {
        jenis_dokumen: requiredEnvironmentalDocType.value.toUpperCase(),
        nomor_persetujuan: `PL-2026-${Date.now().toString().slice(-6)}`,
        uraian_usaha: permitStore.activeWizard.formData.uraian_usaha_lingkungan,
        status_lingkungan: 'Persetujuan Lingkungan Sah & Terverifikasi DLH'
      }
    });
  }

  // If moving past Tahap 4 (PBG & SLF)
  if (fromStep === 4 && toStep === 5) {
    await credentialStore.issueCredential({
      category: 'PBG_SLF',
      title: permitStore.activeWizard.formData.memerlukan_bangunan === 'Y'
        ? `Verifiable PBG (${permitStore.activeWizard.formData.namaBangunan})`
        : 'Verifiable Pembebasan Bangunan (Bypass PBG)',
      kbliCode: permitStore.activeWizard.kbli?.kbli_code || '01285',
      kbliTitle: permitStore.activeWizard.kbli?.title || 'Kegiatan Usaha',
      credentialType: 'VerifiablePBG',
      issuerDid: 'did:oss:pupr:gov:id',
      issuerName: 'Kementerian PUPR (SIMBG)',
      claims: {
        nomor_pbg: `PBG-PUPR-2026-${Date.now().toString().slice(-6)}`,
        nama_bangunan: permitStore.activeWizard.formData.namaBangunan,
        luas_lantai_m2: permitStore.activeWizard.formData.luasTotalBangunan,
        jumlah_lantai: permitStore.activeWizard.formData.jumlahLantai,
        status_keselamatan: 'Standar Teknis Arsitektur & Struktur Disetujui'
      }
    });
  }

  openAccordions[fromStep] = false;
  openAccordions[toStep] = true;
  permitStore.setWizardStep(toStep);
}

const wizardSteps = [
  { step: 1, shortLabel: 'Profil & Rules' },
  { step: 2, shortLabel: 'KKPR Tata Ruang' },
  { step: 3, shortLabel: 'Persetujuan Lingkungan' },
  { step: 4, shortLabel: 'PBG & SLF' },
  { step: 5, shortLabel: 'Syarat & VFC' }
];

const totalStepCount = computed(() => wizardSteps.length);
const currentStepNumber = computed(() => Math.min(permitStore.activeWizard.step, wizardSteps.length));

const mockDigest = computed(() => {
  return Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
});

// Multi-Track Permitting State
const activeTrack = ref<'MAIN' | string>(permitStore.activeWizard.activeTrack || 'MAIN');

watch(
  () => permitStore.activeWizard.activeTrack,
  (val) => {
    if (val && val !== activeTrack.value) {
      activeTrack.value = val;
    }
  }
);

const activeKbliUmkuList = computed(() => {
  const scope = activeScope.value;
  if (!scope) return [];
  if (Array.isArray(scope.pb_umku) && scope.pb_umku.length > 0) {
    return scope.pb_umku;
  }
  if (scope.licensing_requirements) {
    for (const lr of scope.licensing_requirements) {
      if (Array.isArray(lr.pb_umku) && lr.pb_umku.length > 0) {
        return lr.pb_umku;
      }
    }
  }
  return [];
});

const selectedPbUmku = computed(() => {
  if (activeTrack.value === 'MAIN') return null;
  return activeKbliUmkuList.value.find((u) => u.umku_code === activeTrack.value) || null;
});

const isMainPermitIssued = computed(() => {
  if (permitStore.activeWizard.step === 6) return true;
  const currentKbliCode = permitStore.activeWizard.kbli?.kbli_code;
  if (!currentKbliCode) return false;
  return (
    permitStore.applications.some(
      (app) => app.companyId === companyStore.activeCompanyId &&
               app.kbliCode === currentKbliCode &&
               app.status === 'APPROVED'
    ) ||
    credentialStore.activeCompanyCredentials.some(
      (c) => c.category === 'NIB'
    )
  );
});

const mainPermitRecord = computed(() => {
  const currentKbliCode = permitStore.activeWizard.kbli?.kbli_code;
  if (!currentKbliCode) return null;
  const app = permitStore.applications.find(
    (a) => a.companyId === companyStore.activeCompanyId &&
           a.kbliCode === currentKbliCode &&
           a.status === 'APPROVED'
  );
  if (app) return app;
  if (permitStore.activeWizard.step === 6 && permitStore.applications[0]) {
    return permitStore.applications[0];
  }
  const nibCred = credentialStore.activeCompanyCredentials.find((c) => c.category === 'NIB');
  if (nibCred) {
    return {
      id: nibCred.claims?.nomor_nib || companyStore.activeCompany.nib || 'NIB-2026-992100',
      kbliCode: currentKbliCode,
      status: 'APPROVED'
    };
  }
  return null;
});

function getUmkuCredential(umkuCode: string) {
  return credentialStore.activeCompanyCredentials.find(
    (c) => c.category === 'PB_UMKU' && (c.claims?.umku_code === umkuCode || c.title.includes(umkuCode))
  );
}

function isUmkuIssued(umkuCode: string) {
  return !!getUmkuCredential(umkuCode);
}

const nextUnsubmittedUmku = computed(() => {
  return activeKbliUmkuList.value.find((u) => !isUmkuIssued(u.umku_code)) || null;
});

watch(
  () => permitStore.activeWizard.kbli?.kbli_code,
  () => {
    activeTrack.value = 'MAIN';
  }
);

// Automatic Debounced Persistence
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
function triggerAutoSave() {
  if (!permitStore.isHydrated) return;
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    permitStore.activeWizard.activeTrack = activeTrack.value;
    permitStore.activeWizard.openAccordions = { ...openAccordions };
    permitStore.persistDraft();
  }, 250);
}

watch(() => permitStore.activeWizard.formData, triggerAutoSave, { deep: true });
watch(openAccordions, triggerAutoSave, { deep: true });
watch(activeTrack, triggerAutoSave);

function selectParcelFromVfc(parcel: SpatialParcelAsset) {
  permitStore.bindSpatialParcel(parcel);
  showVfcParcelSelectorModal.value = false;
  alert(`✅ Berhasil mengaitkan aset spasial "${parcel.site_name}" dari VFC Lokasi ke formulir KKPR!`);
}

async function handleConfirmSubmit() {
  showPreCommitModal.value = false;
  const app = await permitStore.submitApplication();
  permitStore.setWizardStep(6);
  if (app && app.verifiableCredential) {
    await notificationStore.addNotification({
      type: 'CREDENTIAL_ISSUED',
      title: `Verifiable Credential Terbit: ${app.verifiableCredential.credentialType}`,
      message: `Permohonan Izin KBLI ${app.kbliCode} (${app.kbliTitle}) telah disetujui dan disegel dengan SHA-256. Dokumen resmi telah disimpan di VFC Credentials.`,
      actionLabel: 'Buka di Folder VFC',
      actionType: 'VIEW_CREDENTIAL',
      metadata: {
        credentialId: app.verifiableCredential.vcId,
        credentialType: app.verifiableCredential.credentialType,
        authorityName: 'Kementerian Investasi / BKPM',
        kbliCode: app.kbliCode,
        folderKey: 'CREDENTIALS'
      }
    });
  }
}
</script>
