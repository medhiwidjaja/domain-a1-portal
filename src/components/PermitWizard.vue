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
      <!-- Stepper Header -->
      <div class="border-b border-gray-200 pb-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                Tahap {{ currentStepNumber }} dari {{ totalStepCount }}
              </span>
              <span class="text-xs font-semibold text-gray-500">
                Alur Persyaratan Dasar (PP 28/2025)
              </span>
            </div>
            <h2 class="text-lg font-bold text-gray-900 mt-1">
              KBLI {{ permitStore.activeWizard.kbli.kbli_code }}: {{ permitStore.activeWizard.kbli.title }}
            </h2>
          </div>

          <div class="flex items-center space-x-3">
            <button
              @click="$emit('switch-tab', 'kbli')"
              class="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              ← Ganti KBLI / Scope
            </button>
          </div>
        </div>

        <!-- Multi-Track Permitting Selector (Main KBLI + PB-UMKU) -->
        <div v-if="activeKbliUmkuList.length > 0" class="mt-4 pt-3 border-t border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-bold text-gray-700 flex items-center space-x-1.5">
              <span>🧭</span>
              <span>Jalur Permohonan Perizinan (Multi-Track Engine):</span>
            </span>
            <span class="text-[10px] text-gray-500 font-medium">
              1 Izin Utama + {{ activeKbliUmkuList.length }} Izin Pendukung (PB-UMKU)
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Track 0: Main KBLI (Default) -->
            <button
              type="button"
              @click="activeTrack = 'MAIN'"
              class="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs border"
              :class="[
                activeTrack === 'MAIN'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/40'
                  : 'bg-white text-gray-700 hover:bg-slate-50 border-gray-200'
              ]"
            >
              <span>🏛️</span>
              <span>Izin Utama (KBLI {{ permitStore.activeWizard.kbli.kbli_code }})</span>
              <span
                class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                :class="[
                  isMainPermitIssued
                    ? (activeTrack === 'MAIN' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800')
                    : (activeTrack === 'MAIN' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800')
                ]"
              >
                {{ isMainPermitIssued ? '✓ NIB Terbit' : 'Draf Tahap ' + permitStore.activeWizard.step }}
              </span>
            </button>

            <!-- Track 1..N: PB-UMKU -->
            <button
              v-for="umku in activeKbliUmkuList"
              :key="umku.umku_code"
              type="button"
              @click="activeTrack = umku.umku_code"
              class="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs border"
              :class="[
                activeTrack === umku.umku_code
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40'
                  : 'bg-white text-gray-700 hover:bg-slate-50 border-gray-200'
              ]"
            >
              <span>📦</span>
              <span class="truncate max-w-[210px]">{{ umku.title }}</span>
              <span
                class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                :class="[
                  isUmkuIssued(umku.umku_code)
                    ? (activeTrack === umku.umku_code ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800')
                    : isMainPermitIssued
                      ? (activeTrack === umku.umku_code ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800')
                      : (activeTrack === umku.umku_code ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-500')
                ]"
              >
                {{ isUmkuIssued(umku.umku_code) ? '✓ Terbit' : isMainPermitIssued ? 'Siap Diajukan' : '🔒 Menunggu NIB' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Accordion Toolbar (Only for Main Track) -->
        <div v-if="activeTrack === 'MAIN'" class="mt-4 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold text-gray-600">Alur Pengisian Form:</span>
            <span class="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
              Accordion Wizard (5 Tahapan)
            </span>
          </div>
          <button
            type="button"
            @click="toggleAllAccordions"
            class="text-xs text-blue-600 hover:text-blue-800 font-bold underline underline-offset-2 flex items-center space-x-1"
          >
            <span>{{ allAccordionsOpen ? '📁 Tutup Semua Tahap' : '📂 Buka Semua Tahap' }}</span>
          </button>
        </div>
      </div>

      <!-- Accordion Form Container (Steps 1 to 5, Main Track Only) -->
      <div v-if="activeTrack === 'MAIN' && permitStore.activeWizard.step !== 6" class="space-y-4">
        <!-- ======================================================== -->
        <!-- ACCORDION ITEM 1: Profil Usaha, Parameter KBLI & Aturan DMN -->
        <!-- ======================================================== -->
        <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs transition bg-white">
          <button
            type="button"
            @click="toggleAccordion(1)"
            class="w-full px-5 py-4 flex items-center justify-between text-left transition select-none bg-slate-50 hover:bg-slate-100/80"
          >
            <div class="flex items-center space-x-3.5">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition"
                :class="[
                  permitStore.activeWizard.step > 1 ? 'bg-emerald-600 text-white' :
                  openAccordions[1] ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                ]"
              >
                {{ permitStore.activeWizard.step > 1 ? '✓' : '1' }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-sm text-gray-900">Tahap 1: Profil Usaha, Parameter KBLI & Aturan DMN</h3>
                  <span
                    v-if="permitStore.activeWizard.step > 1"
                    class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Selesai
                  </span>
                  <span
                    v-else-if="openAccordions[1]"
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
              <span class="text-xs font-semibold hidden sm:inline">{{ openAccordions[1] ? 'Tutup' : 'Buka' }}</span>
              <svg
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-180': openAccordions[1] }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </button>
          <div v-show="openAccordions[1]" class="p-5 border-t border-gray-200 space-y-6 bg-white">
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
                Tinjauan Persyaratan Dasar KBLI {{ permitStore.activeWizard.kbli.kbli_code }}
              </h3>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-500 block">Kewenangan Verifikasi</span>
              <span class="text-xs font-bold text-blue-800">
                {{ activeScopeReq?.authority || permitStore.activeWizard.kbli.authority }}
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
                {{ activeScopeReq?.risk_level || permitStore.activeWizard.kbli.risk_level }}
              </span>
            </div>

            <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
              <span class="text-gray-500 block">Output Dokumen Izin</span>
              <span class="font-bold text-sm text-blue-700">
                {{ activeScopeReq?.perizinan_usaha?.join(', ') || permitStore.activeWizard.kbli.perizinan_usaha }}
              </span>
            </div>

            <div class="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
              <span class="text-gray-500 block">Target Waktu SLA</span>
              <span class="font-bold text-sm text-emerald-700">
                {{ activeScopeReq?.processing_time || permitStore.activeWizard.kbli.processing_time }}
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
            @click="handleSavePhase(1)"
            class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
          >
            <span>💾</span>
            <span>Simpan</span>
          </button>
          <button
            type="button"
            @click="handleLanjut(1, 2)"
            :disabled="!investmentValidation.isValid"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>Lanjut</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>

        <!-- ======================================================== -->
        <!-- ACCORDION ITEM 2: Persyaratan Dasar 1 — KKPR (Tata Ruang & Lokasi) -->
        <!-- ======================================================== -->
        <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs transition bg-white">
          <button
            type="button"
            @click="toggleAccordion(2)"
            class="w-full px-5 py-4 flex items-center justify-between text-left transition select-none bg-slate-50 hover:bg-slate-100/80"
          >
            <div class="flex items-center space-x-3.5">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition"
                :class="[
                  permitStore.activeWizard.step > 2 ? 'bg-emerald-600 text-white' :
                  openAccordions[2] ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                ]"
              >
                {{ permitStore.activeWizard.step > 2 ? '✓' : '2' }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-sm text-gray-900">Tahap 2: Persyaratan Dasar 1 — Kesesuaian Tata Ruang (KKPR) & Studio Spasial</h3>
                  <span
                    v-if="permitStore.activeWizard.step > 2"
                    class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Selesai
                  </span>
                  <span
                    v-else-if="openAccordions[2]"
                    class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Aktif
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  Validasi lokasi tapak terhadap RDTR/RTRW, studio poligon GIS, dan integrasi aset perpustakaan lahan VFC.
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-gray-400">
              <span class="text-xs font-semibold hidden sm:inline">{{ openAccordions[2] ? 'Tutup' : 'Buka' }}</span>
              <svg
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-180': openAccordions[2] }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </button>
          <div v-show="openAccordions[2]" class="p-5 border-t border-gray-200 space-y-6 bg-white">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-bold bg-blue-600 text-white px-2 py-0.5 rounded">PD-1</span>
            <h3 class="text-sm font-bold text-gray-900">Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR)</h3>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Validasi lokasi tapak usaha terhadap Rencana Tata Ruang (RTRW/RDTR). Berdasarkan skala usaha dan kawasan, sistem menentukan jalur otomatis atau verifikasi PKKPR.
          </p>
        </div>

        <!-- Site Asset Binder & Vector GIS Studio Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-gray-200 rounded-xl shadow-2xs">
          <div class="flex items-center space-x-2.5">
            <span class="p-2 bg-blue-100 text-blue-800 rounded-lg text-base">🗺️</span>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-gray-900">
                  {{ permitStore.activeWizard.formData.spatial_parcel_binding_id ? 'Aset Lokasi Terikat dari VFC:' : 'Tapak Lokasi Proyek:' }}
                </span>
                <span class="text-blue-700 font-bold text-xs">{{ permitStore.activeWizard.formData.alamat_usaha }}</span>
              </div>
              <p class="text-[10px] text-gray-500 mt-0.5">
                Luas Lahan: {{ permitStore.activeWizard.formData.luas_tanah.toLocaleString('id-ID') }} m² • Status Tata Ruang: <strong>{{ permitStore.activeWizard.formData.rdtr_status }}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="showVfcParcelSelectorModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>📂</span>
            <span>Pilih Aset dari VFC Lokasi</span>
          </button>
        </div>

        <!-- Embedded Interactive Vector GIS Map Canvas Studio -->
        <InteractiveGisStudio
          :initialCoordinates="permitStore.activeWizard.formData.polygon_coordinates"
          :siteName="permitStore.activeWizard.formData.alamat_usaha"
          :address="permitStore.activeWizard.formData.alamat_usaha"
          :isCrossKab="permitStore.activeWizard.formData.is_cross_kab"
          :isCrossProv="permitStore.activeWizard.formData.is_cross_prov"
          :zoneCode="permitStore.activeWizard.formData.zone_code"
          :zoneName="permitStore.activeWizard.formData.zone_name"
          @save-parcel="onStudioSaveParcel"
        />

        <!-- Matra & Tipe Lokasi -->
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Matra Posisi Lokasi</label>
              <select
                v-model="permitStore.activeWizard.formData.posisi_lokasi"
                class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold"
              >
                <option value="01">01 - Ruang Darat (ATR / BPN)</option>
                <option value="02">02 - Ruang Hutan (KLHK)</option>
                <option value="03">03 - Ruang Laut (KKP / KKPRL)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-700 mb-1">Tipe Lokasi Usaha</label>
              <select
                v-model="permitStore.activeWizard.formData.flag_kolektif"
                class="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-900 font-semibold"
              >
                <option value="N">Individual (Tapak Mandiri)</option>
                <option value="Y">Kolektif (Sewa Gedung / Mall / Ruko)</option>
              </select>
            </div>

            <div v-if="permitStore.activeWizard.formData.flag_kolektif === 'Y'">
              <label class="block font-bold text-gray-700 mb-1">Jenis Bangunan Kolektif</label>
              <select
                v-model="permitStore.activeWizard.formData.jenis_bangunan_kolektif"
                class="w-full p-2.5 border rounded-lg bg-white text-gray-900 font-semibold"
              >
                <option value="01">Gedung Perkantoran</option>
                <option value="02">Pusat Perbelanjaan / Mall</option>
                <option value="03">Ruko / Rukan</option>
                <option value="04">Pasar Rakyat</option>
              </select>
            </div>
          </div>

          <!-- Geospasial Coordinates & Address -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Garis Lintang (Latitude)</label>
              <input
                v-model.number="permitStore.activeWizard.formData.latitude"
                type="number"
                step="0.00001"
                class="w-full p-2.5 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Garis Bujur (Longitude)</label>
              <input
                v-model.number="permitStore.activeWizard.formData.longitude"
                type="number"
                step="0.00001"
                class="w-full p-2.5 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Luas Lahan</label>
              <input
                v-model.number="permitStore.activeWizard.formData.luas_tanah"
                type="number"
                class="w-full p-2.5 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Satuan Luas</label>
              <select
                v-model="permitStore.activeWizard.formData.satuan_luas_tanah"
                class="w-full p-2.5 border rounded-lg bg-gray-50 font-semibold"
              >
                <option value="m2">M² (Meter Persegi)</option>
                <option value="ha">Ha (Hektar)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="md:col-span-2">
              <label class="block font-bold text-gray-700 mb-1">Alamat Lengkap Usaha</label>
              <input
                v-model="permitStore.activeWizard.formData.alamat_usaha"
                type="text"
                class="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Kode Pos</label>
              <input
                v-model="permitStore.activeWizard.formData.kode_pos"
                type="text"
                class="w-full p-2.5 border rounded-lg font-mono"
              />
            </div>
          </div>

          <!-- Kawasan Status Controls -->
          <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-3">
            <span class="font-bold text-gray-900 block">Karakteristik & Status Peruntukan Wilayah:</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-gray-600 mb-1">Apakah Berada Dalam Kawasan?</label>
                <select v-model="permitStore.activeWizard.formData.flag_kawasan" class="w-full p-2 border rounded-lg bg-white font-semibold">
                  <option value="Y">Ya (Kawasan Industri / KEK)</option>
                  <option value="N">Tidak (Luar Kawasan)</option>
                </select>
              </div>

              <div v-if="permitStore.activeWizard.formData.flag_kawasan === 'Y'">
                <label class="block text-gray-600 mb-1">Jenis Kawasan</label>
                <select v-model="permitStore.activeWizard.formData.tipe_kawasan" class="w-full p-2 border rounded-lg bg-white font-semibold">
                  <option value="01">Kawasan Industri</option>
                  <option value="02">Kawasan Ekonomi Khusus (KEK)</option>
                  <option value="03">Kawasan Pariwisata</option>
                </select>
              </div>

              <div>
                <label class="block text-gray-600 mb-1">Ketersediaan RDTR Digital</label>
                <select v-model="permitStore.activeWizard.formData.flag_rdtr" class="w-full p-2 border rounded-lg bg-white font-semibold">
                  <option value="Y">Ya (RDTR Terintegrasi Tersedia)</option>
                  <option value="N">Tidak Ada RDTR</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Evaluation Result Banner -->
          <div
            :class="[
              'p-3.5 rounded-xl border text-xs',
              isKkprAutomatic
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            ]"
          >
            <div class="flex items-center space-x-2 font-bold">
              <span>{{ isKkprAutomatic ? '⚡ Jalur Otomatis: Pernyataan Mandiri KKPR' : '⏳ Jalur Verifikasi Manual: PKKPR ATR/BPN' }}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white border">
                Status: {{ isKkprAutomatic ? 'Terbit Otomatis' : 'Perlu Penilaian 20 Hari' }}
              </span>
            </div>
            <p class="text-[11px] mt-1 leading-relaxed">
              {{ isKkprAutomatic
                ? 'Karena proyek Anda berada dalam kawasan industri, memiliki RDTR, atau berskala UMK, KKPR diterbitkan langsung tanpa perlu pembayaran PNBP verifikasi.'
                : 'Karena lokasi berada di luar kawasan terintegrasi dan berskala non-UMK, pengajuan memerlukan konfirmasi intensitas ruang dan verifikasi teknis oleh Kementerian ATR/BPN.'
              }}
            </p>
          </div>

          <!-- Conditional PKKPR Intensity Form (Only if Manual Verification) -->
          <div v-if="!isKkprAutomatic" class="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-xs space-y-3">
            <h5 class="font-bold text-gray-900">Formulir Konfirmasi Intensitas Ruang & Penguasaan Lahan (PKKPR)</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label class="block text-gray-600 mb-1">GSB (Meter)</label>
                <input v-model.number="permitStore.activeWizard.formData.garis_sempadan_bangunan" type="number" class="w-full p-2 border rounded-lg bg-white font-mono" />
              </div>
              <div>
                <label class="block text-gray-600 mb-1">KDB Maksimum (%)</label>
                <input v-model.number="permitStore.activeWizard.formData.koefisien_dasar_bangunan" type="number" class="w-full p-2 border rounded-lg bg-white font-mono" />
              </div>
              <div>
                <label class="block text-gray-600 mb-1">KLB Maksimum (Rasio)</label>
                <input v-model.number="permitStore.activeWizard.formData.koefisien_lantai_bangunan" type="number" step="0.1" class="w-full p-2 border rounded-lg bg-white font-mono" />
              </div>
              <div>
                <label class="block text-gray-600 mb-1">KDH Minimum (%)</label>
                <input v-model.number="permitStore.activeWizard.formData.koefisien_dasar_hijau" type="number" class="w-full p-2 border rounded-lg bg-white font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-gray-600 mb-1">Status Penguasaan Lahan</label>
                <select v-model="permitStore.activeWizard.formData.status_penguasaan_lahan" class="w-full p-2 border rounded-lg bg-white">
                  <option value="02">Milik Sendiri</option>
                  <option value="01">Sewa</option>
                  <option value="03">Pinjam Pakai</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-600 mb-1">Jenis Dokumen Hak Tanah</label>
                <select v-model="permitStore.activeWizard.formData.jenis_dokumen_tanah" class="w-full p-2 border rounded-lg bg-white font-semibold">
                  <option value="02">HGB (Hak Guna Bangunan)</option>
                  <option value="01">SHM (Sertifikat Hak Milik)</option>
                  <option value="03">HGU (Hak Guna Usaha)</option>
                  <option value="04">Perjanjian Sewa</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-600 mb-1">Nomor Dokumen Tanah</label>
                <input v-model="permitStore.activeWizard.formData.nomor_dokumen_tanah" type="text" class="w-full p-2 border rounded-lg bg-white font-mono" />
              </div>
            </div>
          </div>

          <!-- DOCUMENT SLOT: Bukti Hak Tanah / Peta Geospasial -->
          <div class="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-xs text-gray-900 block">Lampiran Bukti Penguasaan Lahan / Peta GIS</span>
                <span class="text-[11px] text-gray-500">Wajib dilampirkan dari Virtual Filing Cabinet atau diunggah baru</span>
              </div>
              <span class="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                Target Folder: LOKASI
              </span>
            </div>

            <!-- Existing VFC Document Detected or Upload New -->
            <div v-if="attachedLandDoc" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div class="flex items-center space-x-2 text-xs">
                <span class="text-base">📄</span>
                <div>
                  <span class="font-bold text-emerald-950 block">{{ attachedLandDoc.title }}</span>
                  <span class="text-[10px] font-mono text-emerald-700">{{ attachedLandDoc.fileName }} • {{ attachedLandDoc.fileSize }} • Hash: {{ attachedLandDoc.sha256.slice(0, 14) }}...</span>
                </div>
              </div>
              <span class="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-300">
                ✓ Terlampir dari VFC
              </span>
            </div>

            <!-- Inline Uploader if not attached yet -->
            <div v-else class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p class="text-xs text-gray-600 font-semibold">Belum ada dokumen tanah terlampir untuk proyek ini.</p>
              <p class="text-[10px] text-gray-400 mt-0.5">Pilih dokumen yang ada di Filing Cabinet atau unggah file baru langsung ke VFC Vault:</p>
              <div class="mt-3 flex justify-center items-center space-x-3">
                <select
                  v-if="availableLandDocs.length > 0"
                  @change="onSelectExistingDoc($event, 'LOKASI')"
                  class="text-xs p-2 border rounded-lg bg-gray-50"
                >
                  <option value="">-- Pilih dari Filing Cabinet --</option>
                  <option v-for="d in availableLandDocs" :key="d.id" :value="d.id">
                    {{ d.title }} ({{ d.fileName }})
                  </option>
                </select>

                <label class="cursor-pointer px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition">
                  <span>+ Unggah Dokumen Tanah Baru</span>
                  <input type="file" class="hidden" @change="onInlineUpload($event, 'LOKASI', 'Sertifikat Tanah & Peta Lahan')" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            @click="handleSavePhase(2)"
            class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
          >
            <span>💾</span>
            <span>Simpan</span>
          </button>
          <button
            type="button"
            @click="handleLanjut(2, 3)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>Lanjut</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>

        <!-- ======================================================== -->
        <!-- ACCORDION ITEM 3: Persyaratan Dasar 2 — Persetujuan Lingkungan (PL) -->
        <!-- ======================================================== -->
        <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs transition bg-white">
          <button
            type="button"
            @click="toggleAccordion(3)"
            class="w-full px-5 py-4 flex items-center justify-between text-left transition select-none bg-slate-50 hover:bg-slate-100/80"
          >
            <div class="flex items-center space-x-3.5">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition"
                :class="[
                  permitStore.activeWizard.step > 3 ? 'bg-emerald-600 text-white' :
                  openAccordions[3] ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                ]"
              >
                {{ permitStore.activeWizard.step > 3 ? '✓' : '3' }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-sm text-gray-900">Tahap 3: Persyaratan Dasar 2 — Persetujuan Lingkungan (PL)</h3>
                  <span
                    v-if="permitStore.activeWizard.step > 3"
                    class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Selesai
                  </span>
                  <span
                    v-else-if="openAccordions[3]"
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
              <span class="text-xs font-semibold hidden sm:inline">{{ openAccordions[3] ? 'Tutup' : 'Buka' }}</span>
              <svg
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-180': openAccordions[3] }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </button>
          <div v-show="openAccordions[3]" class="p-5 border-t border-gray-200 space-y-6 bg-white">
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
                Risiko: {{ activeScopeReq?.risk_level || permitStore.activeWizard.kbli.risk_level }}
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
            @click="handleSavePhase(3)"
            class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
          >
            <span>💾</span>
            <span>Simpan</span>
          </button>
          <button
            type="button"
            @click="handleLanjut(3, 4)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>Lanjut</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>

        <!-- ======================================================== -->
        <!-- ACCORDION ITEM 4: Persyaratan Dasar 3 — Bangunan Gedung (PBG & SLF) -->
        <!-- ======================================================== -->
        <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs transition bg-white">
          <button
            type="button"
            @click="toggleAccordion(4)"
            class="w-full px-5 py-4 flex items-center justify-between text-left transition select-none bg-slate-50 hover:bg-slate-100/80"
          >
            <div class="flex items-center space-x-3.5">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition"
                :class="[
                  permitStore.activeWizard.step > 4 ? 'bg-emerald-600 text-white' :
                  openAccordions[4] ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                ]"
              >
                {{ permitStore.activeWizard.step > 4 ? '✓' : '4' }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-sm text-gray-900">Tahap 4: Persyaratan Dasar 3 — Bangunan Gedung (PBG & SLF)</h3>
                  <span
                    v-if="permitStore.activeWizard.step > 4"
                    class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Selesai
                  </span>
                  <span
                    v-else-if="openAccordions[4]"
                    class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    Aktif
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  Penilaian teknis arsitektur dan keselamatan bangunan gedung. Diintegrasikan dengan sistem SIMBG Kementerian PUPR.
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-gray-400">
              <span class="text-xs font-semibold hidden sm:inline">{{ openAccordions[4] ? 'Tutup' : 'Buka' }}</span>
              <svg
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-180': openAccordions[4] }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </button>
          <div v-show="openAccordions[4]" class="p-5 border-t border-gray-200 space-y-6 bg-white">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">PD-3</span>
            <h3 class="text-sm font-bold text-gray-900">Persetujuan Bangunan Gedung (PBG) & Sertifikat Laik Fungsi (SLF)</h3>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Penilaian teknis arsitektur dan keselamatan bangunan gedung. Diintegrasikan dengan sistem SIMBG Kementerian PUPR.
          </p>
        </div>

        <div class="space-y-4">
          <!-- Screening Question: Need Building? -->
          <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <label class="block font-bold text-gray-900 mb-1 text-sm">
              Apakah kegiatan operasional ini memerlukan konstruksi bangunan fisik baru atau renovasi struktur gedung?
            </label>
            <div class="flex items-center space-x-4 mt-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" value="Y" v-model="permitStore.activeWizard.formData.memerlukan_bangunan" class="text-blue-600" />
                <span class="font-bold text-gray-800">Ya, Memerlukan Bangunan Gedung Baru / Modifikasi</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" value="N" v-model="permitStore.activeWizard.formData.memerlukan_bangunan" class="text-blue-600" />
                <span class="font-bold text-gray-800">Tidak (Bypass: Menggunakan Lahan Terbuka, Sewa Ruang, atau Penangkapan Laut)</span>
              </label>
            </div>
          </div>

          <!-- Branch A: BYPASS PBG & SLF -->
          <div v-if="permitStore.activeWizard.formData.memerlukan_bangunan === 'N'" class="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
            <div class="flex items-center space-x-2 font-bold text-emerald-950">
              <span class="text-lg">✨</span>
              <span>Bypass PBG & SLF: Persyaratan Dasar Terpenuhi Otomatis</span>
            </div>
            <p class="text-[11px] text-emerald-900 leading-relaxed">
              Karena operasional kegiatan usaha Anda tidak mendirikan atau mengubah konstruksi fisik bangunan baru, Anda dibebaskan dari persyaratan persetujuan PBG dan penerbitan SLF di SIMBG PUPR.
            </p>
          </div>

          <!-- Branch B: FILL PBG FORM (If Need Building) -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label class="block font-bold text-gray-700 mb-1">Jenis Izin Bangunan</label>
                <select v-model="permitStore.activeWizard.formData.jenisIzinBangunan" class="w-full p-2.5 border rounded-lg bg-gray-50 font-semibold">
                  <option value="pbg">PBG dan SLF Baru (Konstruksi Baru)</option>
                  <option value="slf">SLF untuk Bangunan Terbangun (Gedung Eksisting)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">Sub Fungsi Pemanfaatan</label>
                <select v-model="permitStore.activeWizard.formData.subFungsiUntukBangunan" class="w-full p-2.5 border rounded-lg bg-white font-semibold">
                  <option value="03">03 - Perindustrian / Pabrik / Fasilitas Olah</option>
                  <option value="01">01 - Perkantoran</option>
                  <option value="02">02 - Perdagangan</option>
                  <option value="07">07 - Gudang / Tempat Penyimpanan</option>
                  <option value="08">08 - Peternakan</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-700 mb-1">Nama Gedung / Bangunan</label>
                <input v-model="permitStore.activeWizard.formData.namaBangunan" type="text" class="w-full p-2.5 border rounded-lg" />
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label class="block font-bold text-gray-700 mb-1">Luas Total Lantai (M²)</label>
                <input v-model.number="permitStore.activeWizard.formData.luasTotalBangunan" type="number" class="w-full p-2.5 border rounded-lg font-mono" />
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">Tinggi Bangunan (M)</label>
                <input v-model.number="permitStore.activeWizard.formData.tinggiBangunan" type="number" step="0.5" class="w-full p-2.5 border rounded-lg font-mono" />
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">Jumlah Lantai</label>
                <input v-model.number="permitStore.activeWizard.formData.jumlahLantai" type="number" class="w-full p-2.5 border rounded-lg font-mono" />
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">Kapasitas Penghuni (Orang)</label>
                <input v-model.number="permitStore.activeWizard.formData.jumlahEstimasiPenghuni" type="number" class="w-full p-2.5 border rounded-lg font-mono" />
              </div>
            </div>

            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs flex items-center space-x-2">
              <input type="checkbox" id="checkSimbg" v-model="permitStore.activeWizard.formData.disclaimerSimbg" class="w-4 h-4 text-blue-600 rounded" />
              <label for="checkSimbg" class="text-blue-900 font-medium">
                Saya bersedia melanjutkan proses verifikasi gambar teknis struktur dan arsitektur pada sistem SIMBG Kementerian PUPR.
              </label>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            @click="handleSavePhase(4)"
            class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
          >
            <span>💾</span>
            <span>Simpan</span>
          </button>
          <button
            type="button"
            @click="handleLanjut(4, 5)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>Lanjut</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>

        <!-- ======================================================== -->
        <!-- ACCORDION ITEM 5: Syarat Khusus KBLI & Verifikasi Dokumen VFC -->
        <!-- ======================================================== -->
        <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs transition bg-white">
          <button
            type="button"
            @click="toggleAccordion(5)"
            class="w-full px-5 py-4 flex items-center justify-between text-left transition select-none bg-slate-50 hover:bg-slate-100/80"
          >
            <div class="flex items-center space-x-3.5">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition"
                :class="[
                  openAccordions[5] ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                ]"
              >
                5
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-sm text-gray-900">Tahap 5: Persyaratan Khusus KBLI & Lampiran Dokumen Filing Cabinet</h3>
                  <span
                    v-if="openAccordions[5]"
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
              <span class="text-xs font-semibold hidden sm:inline">{{ openAccordions[5] ? 'Tutup' : 'Buka' }}</span>
              <svg
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-180': openAccordions[5] }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </button>
          <div v-show="openAccordions[5]" class="p-5 border-t border-gray-200 space-y-6 bg-white">
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
            Checklist Ketentuan Teknis Sektor KBLI {{ permitStore.activeWizard.kbli.kbli_code }}:
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
            @click="handleSavePhase(5)"
            class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
          >
            <span>💾</span>
            <span>Simpan</span>
          </button>
          <button
            type="button"
            @click="showPreCommitModal = true"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
          >
            <span>🔒</span>
            <span>Tinjau Komitmen & Segel SHA-256 →</span>
          </button>
        </div>
      </div>
    </div>
  </div>

      <!-- ======================================================== -->
      <!-- STEP 6: Success & Transmitted (Main Track Only) -->
      <!-- ======================================================== -->
      <div v-if="activeTrack === 'MAIN' && permitStore.activeWizard.step === 6" class="text-center py-12 space-y-4">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="text-2xl font-extrabold text-gray-900">Permohonan Persyaratan Dasar Berhasil Disubmit!</h2>
        <p class="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
          Seluruh persyaratan dasar (KKPR, Persetujuan Lingkungan, PBG/SLF) dan lampiran dokumen VFC telah disegel dengan SHA-256 Payload Digest dan diteruskan ke Universal Workflow Orchestrator (Domain B2).
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

        <!-- PB-UMKU Next Step Card in Step 6 -->
        <div v-if="activeKbliUmkuList.length > 0" class="mt-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-left max-w-xl mx-auto space-y-3 shadow-xs">
          <div class="flex items-center space-x-2.5">
            <span class="text-2xl">📦</span>
            <div>
              <h4 class="font-bold text-sm text-amber-950">Langkah Berikutnya: Izin Pendukung Usaha (PB-UMKU)</h4>
              <p class="text-[11px] text-amber-800">
                Izin utama (NIB) Anda telah terbit. Terdapat <strong>{{ activeKbliUmkuList.length }} PB-UMKU</strong> yang kini telah terbuka dan dapat diajukan secara paralel:
              </p>
            </div>
          </div>
          <div class="space-y-2 pt-1">
            <div
              v-for="u in activeKbliUmkuList"
              :key="u.umku_code"
              class="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-xl"
            >
              <div>
                <span class="font-bold text-xs text-gray-900 block">{{ u.title }}</span>
                <span class="text-[10px] text-gray-500 font-mono">{{ u.authority }} • SLA: {{ u.processing_time }}</span>
              </div>
              <button
                @click="activeTrack = u.umku_code"
                class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                {{ isUmkuIssued(u.umku_code) ? 'Lihat Izin Terbit →' : 'Ajukan PB-UMKU →' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- PB-UMKU TRACK INTERFACE (When activeTrack !== 'MAIN') -->
      <!-- ======================================================== -->
      <div v-if="activeTrack !== 'MAIN' && selectedPbUmku" class="space-y-6">
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
                @click="activeTrack = 'MAIN'"
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
              Induk: <strong>KBLI {{ permitStore.activeWizard.kbli.kbli_code }}</strong>
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
                  @click="activeTrack = 'MAIN'"
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
                class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div class="flex items-center space-x-2">
                  <span class="text-amber-600 font-bold">•</span>
                  <span class="text-gray-800">{{ req }}</span>
                </div>
                <label class="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold cursor-pointer transition">
                  <span>+ Unggah ke VFC</span>
                  <input
                    type="file"
                    class="hidden"
                    @change="onInlineUpload($event, 'TEKNIS', req)"
                  />
                </label>
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

              <div class="space-y-2">
                <div
                  v-for="(req, rIdx) in selectedPbUmku.requirements"
                  :key="rIdx"
                  class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-gray-800">• {{ req }}</span>
                    <label class="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold cursor-pointer transition">
                      <span>+ Upload File</span>
                      <input
                        type="file"
                        class="hidden"
                        @change="onInlineUpload($event, 'TEKNIS', req)"
                      />
                    </label>
                  </div>

                  <!-- Select from existing VFC docs -->
                  <div class="flex items-center space-x-2 text-xs">
                    <select
                      @change="onSelectExistingDoc($event, 'TEKNIS')"
                      class="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs"
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
                @click="activeTrack = 'MAIN'"
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
              @click="activeTrack = 'MAIN'"
              class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition"
            >
              ← Kembali ke Izin Utama
            </button>
            <button
              v-if="nextUnsubmittedUmku"
              type="button"
              @click="activeTrack = nextUnsubmittedUmku.umku_code"
              class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Lanjut Ajukan PB-UMKU Berikutnya: {{ nextUnsubmittedUmku.title }} →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pre-Commit Modal -->
    <Teleport to="body">
      <div v-if="showPreCommitModal" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center space-x-3 text-amber-600 pb-4 border-b border-gray-100">
            <div class="p-3 bg-amber-100 rounded-xl">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">Penyegelan Snapshot Persyaratan Dasar (Pre-Commit)</h3>
              <p class="text-xs text-gray-500">Pernyataan Hukum & Transmisi Data ke Domain B2</p>
            </div>
          </div>

          <div class="mt-4 space-y-4 text-xs text-gray-700">
            <p class="font-medium leading-relaxed">
              Anda akan melakukan komitmen akhir pengajuan permohonan perizinan berusaha. Sistem Domain A1 akan melakukan tindakan:
            </p>
            <!-- Compliance Recap -->
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-[11px]">
              <div class="flex justify-between">
                <span class="text-gray-500">KBLI & Ruang Lingkup:</span>
                <span class="font-bold text-gray-900">{{ permitStore.activeWizard.kbli?.kbli_code }} (Lingkup {{ activeScope?.sequence }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Status KKPR:</span>
                <span class="font-bold text-emerald-700">{{ isKkprAutomatic ? 'Pernyataan Mandiri (Otomatis)' : 'Verifikasi PKKPR' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Persetujuan Lingkungan:</span>
                <span class="font-bold text-emerald-700">{{ requiredEnvironmentalDocType.toUpperCase() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">PBG & SLF:</span>
                <span class="font-bold text-blue-700">
                  {{ permitStore.activeWizard.formData.memerlukan_bangunan === 'Y' ? 'Pengajuan SIMBG PUPR' : 'Bypass (Terpenuhi Otomatis)' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Dokumen VFC Terlampir:</span>
                <span class="font-mono font-bold text-purple-700">{{ permitStore.activeWizard.selectedVfcDocIds.length }} File</span>
              </div>
            </div>

            <ul class="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li class="flex items-start space-x-2">
                <span class="text-blue-600 font-bold">1.</span>
                <span>Membuat <strong>Submission Snapshot</strong> permanen yang menyegel formulir dan salinan dokumen VFC.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-blue-600 font-bold">2.</span>
                <span>Menghasilkan hash deterministik SHA-256 (<code>payload_digest</code>) sebagai bukti integritas data.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="text-blue-600 font-bold">3.</span>
                <span>Meneruskan paket permohonan ke <strong>Domain B2 (Workflow Orchestrator)</strong> untuk verifikasi teknis K/L/D.</span>
              </li>
            </ul>

            <!-- Deterministic SHA-256 Digest Preview -->
            <div class="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-[11px]">
              <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Simulasi SHA-256 Payload Digest:</span>
              <span class="text-emerald-400 break-all">{{ mockDigest }}</span>
            </div>

            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
              ⚠️ <strong>Pernyataan Kepatuhan:</strong> Seluruh data formulir persyaratan dasar yang disampaikan adalah sah dan dapat dipertanggungjawabkan secara hukum. Draf tidak dapat diubah setelah transmisi.
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              @click="showPreCommitModal = false"
              class="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              @click="handleConfirmSubmit"
              class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Segel & Kirim Permohonan</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- VFC Spatial Parcel Selector Modal -->
    <Teleport to="body">
      <div v-if="showVfcParcelSelectorModal" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
          <div class="flex justify-between items-center pb-3 border-b">
            <div>
              <h3 class="text-base font-bold text-gray-900">Pilih Aset Spasial dari VFC Lokasi</h3>
              <p class="text-xs text-gray-500">Pilih plot lahan yang sudah tersimpan di vault Anda untuk 1-click binding.</p>
            </div>
            <button @click="showVfcParcelSelectorModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div class="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
            <div
              v-if="spatialStore.parcelsByCompany(companyStore.activeCompanyId).length === 0"
              class="p-6 text-center text-gray-400 italic"
            >
              Belum ada aset spasial di VFC Lokasi. Silakan gambar di studio atau unggah Shapefile.
            </div>

            <div
              v-for="parcel in spatialStore.parcelsByCompany(companyStore.activeCompanyId)"
              :key="parcel.parcel_id"
              @click="selectParcelFromVfc(parcel)"
              class="p-3 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl cursor-pointer transition space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-gray-900 text-sm">{{ parcel.site_name }}</span>
                <span class="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  {{ parcel.rdtr_status }}
                </span>
              </div>
              <p class="text-gray-600 text-xs line-clamp-1">{{ parcel.address }}</p>
              <div class="flex items-center space-x-3 text-[10px] text-gray-500 font-mono">
                <span>Luas: {{ parcel.area_sqm.toLocaleString('id-ID') }} m²</span>
                <span>•</span>
                <span>Kawasan: {{ parcel.zone_name }}</span>
                <span>•</span>
                <span>{{ parcel.is_cross_kab ? '⚠️ Lintas Kab/Kota' : 'Tunggal' }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-3 border-t">
            <button
              type="button"
              @click="showVfcParcelSelectorModal = false"
              class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { usePermitStore } from '../stores/permitStore';
import { useVfcStore, type VfcDocument } from '../stores/vfcStore';
import { useCompanyStore } from '../stores/companyStore';
import { useSpatialStore, type SpatialParcelAsset } from '../stores/spatialStore';
import { useCredentialStore } from '../stores/credentialStore';
import { useNotificationStore } from '../stores/notificationStore';
import { evaluateStage1KbliRequirements } from '../utils/dmnEngine';
import InteractiveGisStudio from './InteractiveGisStudio.vue';

defineEmits(['switch-tab']);

const permitStore = usePermitStore();
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();
const spatialStore = useSpatialStore();
const credentialStore = useCredentialStore();
const notificationStore = useNotificationStore();

const showPreCommitModal = ref(false);
const showVfcParcelSelectorModal = ref(false);

// Accordion expansion state for Steps 1 through 5
const openAccordions = reactive<Record<number, boolean>>({
  1: true,
  2: permitStore.activeWizard.step === 2,
  3: permitStore.activeWizard.step === 3,
  4: permitStore.activeWizard.step === 4,
  5: permitStore.activeWizard.step === 5
});

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

const saveToastMessage = ref<string | null>(null);

async function handleSavePhase(phaseNumber: number) {
  await permitStore.persistDraft();
  saveToastMessage.value = `Draf Tahap ${phaseNumber} berhasil disimpan ke IndexedDB.`;
  setTimeout(() => {
    saveToastMessage.value = null;
  }, 3000);
}

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

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

const activeScope = computed(() => {
  return permitStore.activeWizard.selectedScope || permitStore.activeWizard.kbli?.scopes?.[0] || null;
});

const activeScopeReq = computed(() => {
  return activeScope.value?.licensing_requirements?.[0] || null;
});

// Multi-Track Permitting State (Section 4 TO-BE Spec)
const activeTrack = ref<'MAIN' | string>('MAIN');

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
  return permitStore.applications.some(
    (app) => app.companyId === companyStore.activeCompanyId &&
             app.kbliCode === currentKbliCode &&
             app.status === 'APPROVED'
  );
});

const mainPermitRecord = computed(() => {
  const currentKbliCode = permitStore.activeWizard.kbli?.kbli_code;
  if (!currentKbliCode) return null;
  return (
    permitStore.applications.find(
      (app) => app.companyId === companyStore.activeCompanyId &&
               app.kbliCode === currentKbliCode &&
               app.status === 'APPROVED'
    ) || (permitStore.activeWizard.step === 6 ? permitStore.applications[0] : null)
  );
});

function getUmkuCredential(umkuCode: string) {
  return credentialStore.activeCompanyCredentials.find(
    (c) => c.category === 'PB_UMKU' && (c.claims?.umku_code === umkuCode || c.title.includes(umkuCode))
  );
}

function isUmkuIssued(umkuCode: string) {
  return !!getUmkuCredential(umkuCode);
}

const umkuFormData = reactive<Record<string, {
  varietyName: string;
  technicalDescription: string;
  testingLocation: string;
  selectedDocIds: string[];
  declarationAgreed: boolean;
}>>({});

function getUmkuForm(umkuCode: string) {
  if (!umkuFormData[umkuCode]) {
    umkuFormData[umkuCode] = {
      varietyName: 'Varietas Rimpang & Biofarmaka Sentul Unggul V1',
      technicalDescription: 'Pengujian kebaruan dan kemurnian genetik varietas lokal dengan stabilitas hasil panen 12.5 ton/ha dan resistensi hama teruji.',
      testingLocation: 'Stasiun Riset Agronomi Sentul & Balai Penelitian Tanaman Rempah dan Obat (Balittro)',
      selectedDocIds: ['VFC-DOC-001'],
      declarationAgreed: true
    };
  }
  return umkuFormData[umkuCode];
}

const isSubmittingUmku = ref(false);

async function handleUmkuSubmit(umku: any) {
  isSubmittingUmku.value = true;
  const form = getUmkuForm(umku.umku_code);
  const mainPermit = mainPermitRecord.value;
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

  isSubmittingUmku.value = false;
  saveToastMessage.value = `Permohonan PB-UMKU "${umku.title}" berhasil diterbitkan!`;
  setTimeout(() => {
    saveToastMessage.value = null;
  }, 3500);
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

const reqList = computed(() => {
  const scope = activeScope.value;
  if (!scope || !scope.licensing_requirements || !scope.licensing_requirements[0]) {
    return [];
  }
  return scope.licensing_requirements[0].requirements || [];
});

// Stage 1 DMN Requirements & Typed Dynamic Parameter Schema
const stage1Requirements = computed(() => {
  if (!permitStore.activeWizard.kbli) return null;
  return evaluateStage1KbliRequirements(
    permitStore.activeWizard.kbli.kbli_code,
    Number(activeScope.value?.sequence || 1),
    companyStore.activeCompany.scale || 'Besar'
  );
});

// Smart Engine Capital & Scale Classification (Section 4.3 TO-BE Spec)
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

// Smart Engine Investment Validation (Rule 1-5 from analisis_persyaratan_dasar.md)
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

function selectParcelFromVfc(parcel: SpatialParcelAsset) {
  permitStore.bindSpatialParcel(parcel);
  showVfcParcelSelectorModal.value = false;
  alert(`✅ Berhasil mengaitkan aset spasial "${parcel.site_name}" dari VFC Lokasi ke formulir KKPR!`);
}

function onStudioSaveParcel(parcelData: Partial<SpatialParcelAsset>) {
  spatialStore.addParcel({
    company_id: companyStore.activeCompanyId,
    site_name: parcelData.site_name || 'Plot Proyek KBLI ' + permitStore.activeWizard.kbli?.kbli_code,
    address: parcelData.address || permitStore.activeWizard.formData.alamat_usaha,
    region_code: '32.01.01.2001',
    province: permitStore.activeWizard.formData.provinsi,
    regency: permitStore.activeWizard.formData.kab_kota,
    district: permitStore.activeWizard.formData.kecamatan,
    village: permitStore.activeWizard.formData.kelurahan,
    postal_code: permitStore.activeWizard.formData.kode_pos,
    position: permitStore.activeWizard.formData.posisi_lokasi,
    latitude: parcelData.latitude || permitStore.activeWizard.formData.latitude,
    longitude: parcelData.longitude || permitStore.activeWizard.formData.longitude,
    polygon_coordinates: parcelData.polygon_coordinates || permitStore.activeWizard.formData.polygon_coordinates,
    area_sqm: parcelData.area_sqm || permitStore.activeWizard.formData.luas_tanah,
    area_ha: parcelData.area_ha || (permitStore.activeWizard.formData.luas_tanah / 10000),
    is_cross_kab: parcelData.is_cross_kab || false,
    is_cross_prov: parcelData.is_cross_prov || false,
    zone_code: parcelData.zone_code || 'STANDARD',
    zone_name: parcelData.zone_name || 'Kawasan Industri',
    rdtr_status: parcelData.rdtr_status || 'SESUAI',
    rdtr_zoning_code: 'KPI',
    rdtr_sub_zone: parcelData.rdtr_sub_zone || 'Kawasan Peruntukan Industri (KPI)',
    ownership_doc_type: permitStore.activeWizard.formData.jenis_dokumen_tanah,
    ownership_doc_number: permitStore.activeWizard.formData.nomor_dokumen_tanah
  }).then((p) => {
    permitStore.bindSpatialParcel(p);
    alert(`✅ Aset Lokasi "${p.site_name}" berhasil disimpan ke VFC dan dikaitkan ke formulir KKPR!`);
  });
}

// KKPR Automatic vs Manual check (Section 2 from analisis_persyaratan_dasar.md)
const isKkprAutomatic = computed(() => {
  const form = permitStore.activeWizard.formData;
  return form.flag_kawasan === 'Y' || form.flag_rdtr === 'Y' || form.flag_umkm === 'Y';
});

// Environmental Instrument Type (Section 3 from analisis_persyaratan_dasar.md)
const requiredEnvironmentalDocType = computed(() => {
  const riskCode = activeScopeReq.value?.risk_code || permitStore.activeWizard.kbli?.risk_code || 'MR';
  if (riskCode === 'R' || riskCode === 'RE' || riskCode === 'MR') return 'sppl';
  if (riskCode === 'MT') return 'ukl/upl';
  return 'amdal';
});

// Document Matching for Land / Spatial
const availableLandDocs = computed(() => {
  return currentCompanyDocs.value.filter(
    (d) => d.category === 'LOKASI' || d.category === 'PERUSAHAAN'
  );
});

const attachedLandDoc = computed(() => {
  return currentCompanyDocs.value.find(
    (d) =>
      permitStore.activeWizard.selectedVfcDocIds.includes(d.id) &&
      (d.category === 'LOKASI' || d.category === 'PERUSAHAAN')
  );
});

// Document Matching for Environment
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

function goToNextStep(step: number) {
  permitStore.setWizardStep(step);
  openAccordions[step] = true;
}

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

  target.value = '';
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
