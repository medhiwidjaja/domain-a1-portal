<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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

        <!-- Visual Step Breadcrumbs -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 text-[11px] font-semibold text-center">
          <div
            v-for="(st, idx) in wizardSteps"
            :key="st.step"
            :class="[
              'p-2 rounded-lg border transition',
              permitStore.activeWizard.step === st.step
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : permitStore.activeWizard.step > st.step
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-gray-50 text-gray-400 border-gray-200'
            ]"
          >
            <div class="truncate">{{ idx + 1 }}. {{ st.shortLabel }}</div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- STEP 1: Upfront DMN Rule Transparency & Smart Engine Profile -->
      <!-- ======================================================== -->
      <div v-if="permitStore.activeWizard.step === 1" class="space-y-6">
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
        </div>

        <div class="flex justify-end pt-4 border-t">
          <button
            @click="goToNextStep(2)"
            :disabled="!investmentValidation.isValid"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Lanjut ke Persyaratan Dasar 1: KKPR (Tata Ruang) →
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- STEP 2: Persyaratan Dasar 1 — KKPR (Tata Ruang & Lokasi) -->
      <!-- ======================================================== -->
      <div v-else-if="permitStore.activeWizard.step === 2" class="space-y-6">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-bold bg-blue-600 text-white px-2 py-0.5 rounded">PD-1</span>
            <h3 class="text-sm font-bold text-gray-900">Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR)</h3>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Validasi lokasi tapak usaha terhadap Rencana Tata Ruang (RTRW/RDTR). Berdasarkan skala usaha dan kawasan, sistem menentukan jalur otomatis atau verifikasi PKKPR.
          </p>
        </div>

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

        <div class="flex justify-between pt-4 border-t">
          <button
            @click="permitStore.setWizardStep(1)"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Kembali ke Profil
          </button>
          <button
            @click="goToNextStep(3)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Lanjut ke Persyaratan Dasar 2: Persetujuan Lingkungan →
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- STEP 3: Persyaratan Dasar 2 — Persetujuan Lingkungan (PL)-->
      <!-- ======================================================== -->
      <div v-else-if="permitStore.activeWizard.step === 3" class="space-y-6">
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

        <div class="flex justify-between pt-4 border-t">
          <button
            @click="permitStore.setWizardStep(2)"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Kembali ke KKPR
          </button>
          <button
            @click="goToNextStep(4)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Lanjut ke Persyaratan Dasar 3: Bangunan Gedung (PBG & SLF) →
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- STEP 4: Persyaratan Dasar 3 — Bangunan Gedung (PBG & SLF)-->
      <!-- ======================================================== -->
      <div v-else-if="permitStore.activeWizard.step === 4" class="space-y-6">
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

        <div class="flex justify-between pt-4 border-t">
          <button
            @click="permitStore.setWizardStep(3)"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Kembali ke Lingkungan
          </button>
          <button
            @click="goToNextStep(5)"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Lanjut ke Syarat Khusus KBLI & Dokumen VFC →
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- STEP 5: Syarat Khusus KBLI & Verifikasi Dokumen VFC -->
      <!-- ======================================================== -->
      <div v-else-if="permitStore.activeWizard.step === 5" class="space-y-6">
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

        <div class="flex justify-between pt-4 border-t">
          <button
            @click="permitStore.setWizardStep(4)"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Kembali ke PBG/SLF
          </button>
          <button
            @click="showPreCommitModal = true"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Tinjau Komitmen & Segel SHA-256 →
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- STEP 6: Success & Transmitted -->
      <!-- ======================================================== -->
      <div v-else-if="permitStore.activeWizard.step === 6" class="text-center py-12 space-y-4">
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
      </div>
    </div>

    <!-- Pre-Commit Modal -->
    <div v-if="showPreCommitModal" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePermitStore } from '../stores/permitStore';
import { useVfcStore, type VfcDocument } from '../stores/vfcStore';
import { useCompanyStore } from '../stores/companyStore';

defineEmits(['switch-tab']);

const permitStore = usePermitStore();
const vfcStore = useVfcStore();
const companyStore = useCompanyStore();

const showPreCommitModal = ref(false);

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

const reqList = computed(() => {
  const scope = activeScope.value;
  if (!scope || !scope.licensing_requirements || !scope.licensing_requirements[0]) {
    return [];
  }
  return scope.licensing_requirements[0].requirements || [];
});

// Smart Engine Investment Validation (Rule 1-5 from analisis_persyaratan_dasar.md)
const investmentValidation = computed(() => {
  const form = permitStore.activeWizard.formData;
  const isPma = form.status_penanaman_modal === '01';
  const isUmk = form.flag_umkm === 'Y';
  const amount = form.investmentAmount || 0;

  if (isPma && amount < 10000000000) {
    return {
      isValid: false,
      title: 'Peringatan Batas Investasi PMA (Rule 1)',
      message: 'Status penanaman modal Anda PMA. Sesuai regulasi, nilai investasi Anda harus di atas Rp 10 Miliar di luar tanah dan bangunan.'
    };
  }

  if (!isPma && isUmk && amount > 5000000000) {
    return {
      isValid: false,
      title: 'Peringatan Skala Investasi UMK (Rule 4)',
      message: 'Jumlah investasi Anda di atas Rp 5 Miliar di luar tanah dan bangunan. Silakan upgrade skala menjadi Non-UMK.'
    };
  }

  if (!isPma && !isUmk && amount <= 5000000000) {
    return {
      isValid: false,
      title: 'Peringatan Skala Investasi Non-UMK (Rule 5)',
      message: 'Jumlah investasi untuk Non-UMK harus di atas Rp 5 Miliar di luar tanah dan bangunan.'
    };
  }

  return {
    isValid: true,
    title: 'Validasi Profil Smart Engine Lolos',
    message: 'Skala usaha dan rencana investasi Anda telah sesuai dengan ketentuan PP 28/2025.'
  };
});

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
}

function onSelectExistingDoc(e: Event, category: string) {
  const target = e.target as HTMLSelectElement;
  const docId = target.value;
  if (docId && !permitStore.activeWizard.selectedVfcDocIds.includes(docId)) {
    permitStore.activeWizard.selectedVfcDocIds.push(docId);
  }
}

function onInlineUpload(e: Event, category: string, defaultTitle: string) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  const fileSize = `${(file.size / 1024 / 1024).toFixed(1)} MB`;

  const newDoc = vfcStore.addDocument({
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

function handleConfirmSubmit() {
  showPreCommitModal.value = false;
  permitStore.submitApplication();
  permitStore.setWizardStep(6);
}
</script>
