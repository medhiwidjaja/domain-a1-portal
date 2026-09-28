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
          {{ isCompleted ? '✓' : '1' }}
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-sm text-gray-900">Tahap 1: Profil Usaha, Parameter KBLI & Aturan DMN</h3>
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
            Tinjauan regulasi PP 5/2021 & PP 28/2025, formulir parameter dinamis, dan penentuan kewenangan.
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
      <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-5 shadow-xs space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <span class="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                Smart Engine Validasi
              </span>
              <span class="text-xs font-semibold text-blue-900">
                Regulasi PP 5/2021 & PP 28/2025
              </span>
            </div>
            <h3 class="text-base font-bold text-gray-900 mt-1">
              Tinjauan Persyaratan Dasar KBLI {{ permitStore.activeWizard.kbli?.kbli_code }}
            </h3>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-gray-500 block">Kewenangan Verifikasi</span>
            <span class="text-xs font-bold text-blue-800">
              {{ activeScopeReq?.authority || permitStore.activeWizard.kbli?.authority }}
            </span>
          </div>
        </div>

        <!-- Selected Scope Banner -->
        <div v-if="activeScope" class="bg-blue-100/70 p-3 rounded-lg border border-blue-200">
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
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
            <span class="text-gray-500 block">Tingkat Risiko</span>
            <span class="font-bold text-sm text-gray-900">
              {{ activeScopeReq?.risk_level || permitStore.activeWizard.kbli?.risk_level }}
            </span>
          </div>

          <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
            <span class="text-gray-500 block">Output Dokumen Izin</span>
            <span class="font-bold text-sm text-blue-700">
              {{ activeScopeReq?.perizinan_usaha?.join(', ') || permitStore.activeWizard.kbli?.perizinan_usaha }}
            </span>
          </div>

          <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
            <span class="text-gray-500 block">Target Waktu SLA</span>
            <span class="font-bold text-sm text-emerald-700">
              {{ activeScopeReq?.processing_time || permitStore.activeWizard.kbli?.processing_time }}
            </span>
          </div>

          <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
            <span class="text-gray-500 block">Jalur Persyaratan Dasar</span>
            <span class="font-bold text-sm text-purple-700">KKPR, PL, PBG/SLF</span>
          </div>
        </div>

        <!-- Requirements checklist preview -->
        <div class="bg-white p-4 rounded-lg border border-blue-100 text-xs">
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

      <!-- Smart Engine Investment & Profile Form -->
      <div class="space-y-4">
        <h4 class="font-bold text-sm text-gray-900 border-b pb-2 flex items-center justify-between">
          <span>Profil Investasi & Skala Usaha (Smart Engine Validation)</span>
          <span class="text-xs font-normal text-gray-500">Evaluasi PP 28/2025</span>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Status Penanaman Modal</label>
            <select
              v-model="permitStore.activeWizard.formData.status_penanaman_modal"
              class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold"
            >
              <option value="02">PMDN (Penanaman Modal Dalam Negeri)</option>
              <option value="01">PMA (Penanaman Modal Asing - Min. 10 Miliar)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Skala Usaha</label>
            <select
              v-model="permitStore.activeWizard.formData.flag_umkm"
              class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold"
            >
              <option value="Y">Usaha Mikro & Kecil (UMK - Investasi &le; 5 Miliar)</option>
              <option value="N">Non-UMK / Menengah / Besar (Investasi &gt; 5 Miliar)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Rencana Nilai Investasi (IDR)</label>
            <input
              v-model.number="permitStore.activeWizard.formData.investmentAmount"
              type="number"
              class="w-full p-2.5 border rounded-lg bg-white text-gray-900 font-mono font-bold"
            />
          </div>
        </div>

        <!-- Smart Engine Compliance Banner -->
        <div
          :class="[
            'p-3.5 rounded-xl border text-xs flex items-start space-x-2',
            investmentValidation.isValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          ]"
        >
          <span class="text-base">{{ investmentValidation.isValid ? '✅' : '⚠️' }}</span>
          <div>
            <p class="font-bold">{{ investmentValidation.title }}</p>
            <p class="text-[11px] mt-0.5 leading-relaxed">{{ investmentValidation.message }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Nama Kegiatan / Proyek</label>
            <input
              v-model="permitStore.activeWizard.formData.projectName"
              type="text"
              class="w-full p-2.5 border rounded-lg text-gray-900"
            />
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Estimasi Tenaga Kerja (Orang)</label>
            <input
              v-model.number="permitStore.activeWizard.formData.laborCount"
              type="number"
              class="w-full p-2.5 border rounded-lg text-gray-900 font-mono"
            />
          </div>
        </div>

        <!-- STAGE 1 DMN: DYNAMIC SCHEMA-DRIVEN PARAMETERS -->
        <div v-if="stage1Requirements && stage1Requirements.parameters_schema.fields.length > 0" class="border border-blue-200 rounded-xl p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="p-1.5 bg-blue-600 text-white rounded-lg text-xs">⚙️</span>
              <div>
                <h4 class="font-bold text-xs text-gray-900">{{ stage1Requirements.parameters_schema.title }}</h4>
                <p class="text-[11px] text-gray-500">{{ stage1Requirements.parameters_schema.description }}</p>
              </div>
            </div>
            <span class="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
              DMN 1.3 Stage 1
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div
              v-for="field in stage1Requirements.parameters_schema.fields"
              :key="field.key"
              class="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1.5 text-xs"
            >
              <label class="block font-bold text-gray-800 text-[11px]">
                {{ field.label }}
                <span v-if="field.unit" class="text-blue-600 font-mono text-[10px]">({{ field.unit }})</span>
              </label>

              <!-- Number field -->
              <div v-if="field.type === 'number'" class="relative">
                <input
                  type="number"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step || 1"
                  :value="permitStore.activeWizard.formData.dynamic_params[field.key]"
                  @input="onDynamicParamChange(field.key, Number(($event.target as HTMLInputElement).value))"
                  class="w-full p-2 border border-gray-300 rounded-lg font-mono font-bold text-gray-800"
                />
              </div>

              <!-- Enum field -->
              <div v-else-if="field.type === 'enum'">
                <select
                  :value="permitStore.activeWizard.formData.dynamic_params[field.key]"
                  @change="onDynamicParamChange(field.key, ($event.target as HTMLSelectElement).value)"
                  class="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-gray-800"
                >
                  <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Boolean field -->
              <div v-else-if="field.type === 'boolean'" class="flex items-center space-x-3 pt-1">
                <label class="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="Boolean(permitStore.activeWizard.formData.dynamic_params[field.key])"
                    @change="onDynamicParamChange(field.key, ($event.target as HTMLInputElement).checked)"
                    class="w-4 h-4 text-blue-600 rounded"
                  />
                  <span class="text-xs font-semibold text-gray-700">Ya, Sesuai Kriteria</span>
                </label>
              </div>

              <p v-if="field.help_text" class="text-[10px] text-gray-400 leading-tight">
                {{ field.help_text }}
              </p>
            </div>
          </div>
        </div>

        <!-- STAGE 2 DMN: DETERMINISTIC AUTHORITY ROUTING TRANSPARENCY BANNER -->
        <div class="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-xl shadow-md space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div class="flex items-center space-x-2">
              <span class="p-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono font-bold">DMN B1</span>
              <span class="text-xs font-bold text-slate-200">Hasil Evaluasi Deterministik Kewenangan (Stage 2 DMN)</span>
            </div>
            <div class="flex items-center space-x-2 font-mono text-[10px]">
              <span class="bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                Kode: {{ permitStore.activeWizard.formData.assigned_authority_code }} ({{ permitStore.activeWizard.formData.authority_tier }})
              </span>
              <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                SLA: {{ permitStore.activeWizard.formData.statutory_sla_days }} Hari
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div class="space-y-1">
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Badan / Instansi Verifikator Terpilih:</span>
              <div class="font-bold text-sm text-blue-300 flex items-center space-x-1.5">
                <span>🏛️</span>
                <span>{{ permitStore.activeWizard.formData.designated_verifier_agency || 'DPMPTSP Terkait' }}</span>
              </div>
            </div>

            <div class="space-y-1">
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Rule Matched & Dasar Regulasi:</span>
              <p class="text-[11px] text-slate-300 leading-relaxed font-mono">
                <span class="text-amber-400 font-bold">[{{ permitStore.activeWizard.formData.matched_rule_id }}]</span>
                {{ permitStore.activeWizard.formData.matched_rule_desc }}
              </p>
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
          :disabled="!investmentValidation.isValid"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
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
import { useCompanyStore } from '../../stores/companyStore';
import { evaluateStage1KbliRequirements } from '../../utils/dmnEngine';

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
const companyStore = useCompanyStore();

const activeScope = computed(() => {
  return permitStore.activeWizard.selectedScope || permitStore.activeWizard.kbli?.scopes?.[0] || null;
});

const activeScopeReq = computed(() => {
  return activeScope.value?.licensing_requirements?.[0] || null;
});

const reqList = computed(() => {
  const scope = activeScope.value;
  if (!scope || !scope.licensing_requirements || !scope.licensing_requirements[0]) {
    return [];
  }
  return scope.licensing_requirements[0].requirements || [];
});

const stage1Requirements = computed(() => {
  if (!permitStore.activeWizard.kbli) return null;
  return evaluateStage1KbliRequirements(
    permitStore.activeWizard.kbli.kbli_code,
    Number(activeScope.value?.sequence || 1),
    companyStore.activeCompany.scale || 'Besar'
  );
});

const capitalEvaluation = computed(() => {
  const issuedCapital = companyStore.activeCompany.capital || 0;
  const projectNetInvest = permitStore.activeWizard.formData.investmentAmount || 0;
  const evalBase = Math.max(issuedCapital, projectNetInvest);
  const isPma = permitStore.activeWizard.formData.status_penanaman_modal === '01';

  if (isPma) {
    const isPmaFloorMet = projectNetInvest > 10000000000;
    return {
      scale: 'Besar',
      scaleCode: '04',
      isPma: true,
      isFloorMet: isPmaFloorMet,
      evalBase,
      desc: isPmaFloorMet
        ? 'PMA Terkunci Usaha Besar (Investasi memenuhi floor > IDR 10 Miliar sesuai BKPM 4/2021)'
        : 'PELANGGARAN PMA FLOOR: Nilai investasi proyek di luar tanah & bangunan harus > Rp 10 Miliar!'
    };
  }

  let scale = 'Besar';
  let scaleCode = '04';
  let desc = 'Modal Usaha / Investasi > Rp 10 Miliar (PP 7/2021 & PP 28/2025)';

  if (evalBase <= 1000000000) {
    scale = 'Mikro';
    scaleCode = '01';
    desc = 'Modal Usaha s.d Rp 1 Miliar (PP 7/2021)';
  } else if (evalBase <= 5000000000) {
    scale = 'Kecil';
    scaleCode = '02';
    desc = 'Modal Usaha > Rp 1 Miliar s.d Rp 5 Miliar (PP 7/2021)';
  } else if (evalBase <= 10000000000) {
    scale = 'Menengah';
    scaleCode = '03';
    desc = 'Modal Usaha > Rp 5 Miliar s.d Rp 10 Miliar (PP 7/2021)';
  }

  return {
    scale,
    scaleCode,
    isPma: false,
    isFloorMet: true,
    evalBase,
    desc
  };
});

const investmentValidation = computed(() => {
  const form = permitStore.activeWizard.formData;
  const isPma = form.status_penanaman_modal === '01';
  const isUmk = form.flag_umkm === 'Y';
  const amount = form.investmentAmount || 0;

  if (isPma && amount <= 10000000000) {
    return {
      isValid: false,
      title: 'Peringatan Batas Investasi PMA (BKPM 4/2021)',
      message: 'Status penanaman modal Anda PMA. Sesuai regulasi BKPM 4/2021, nilai investasi Anda harus lebih dari Rp 10 Miliar di luar tanah dan bangunan.'
    };
  }

  if (!isPma && isUmk && amount > 5000000000) {
    return {
      isValid: false,
      title: 'Peringatan Skala Investasi UMK (PP 7/2021)',
      message: 'Jumlah investasi Anda di atas Rp 5 Miliar di luar tanah dan bangunan. Silakan upgrade skala menjadi Non-UMK.'
    };
  }

  if (!isPma && !isUmk && amount <= 5000000000) {
    return {
      isValid: false,
      title: 'Peringatan Skala Investasi Non-UMK (PP 7/2021)',
      message: 'Jumlah investasi untuk Non-UMK harus di atas Rp 5 Miliar di luar tanah dan bangunan.'
    };
  }

  return {
    isValid: true,
    title: 'Validasi Profil Smart Engine Lolos',
    message: `Skala usaha (${capitalEvaluation.value.scale}) dan rencana investasi telah diverifikasi sesuai PP 7/2021 & PP 28/2025.`
  };
});

function onDynamicParamChange(key: string, value: any) {
  permitStore.updateDynamicParam(key, value);
}
</script>
