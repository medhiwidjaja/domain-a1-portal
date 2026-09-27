<template>
  <div class="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
    <!-- Island Header -->
    <div class="bg-slate-900 text-white p-4 shrink-0 border-b border-slate-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
            VFC Zone 1
          </span>
          <h2 class="text-sm font-bold tracking-tight">Virtual Filing Cabinet</h2>
        </div>

        <div class="flex items-center space-x-1.5">
          <button
            @click="openAddCategoryModal"
            title="Tambah Kategori / Folder Kustom"
            class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-700 transition flex items-center space-x-1"
          >
            <span>📁+</span>
            <span class="hidden sm:inline">Folder Baru</span>
          </button>

          <button
            @click="openUploadModal()"
            class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow transition flex items-center space-x-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Upload</span>
          </button>
        </div>
      </div>

      <!-- Vault Path & Search Toolbar -->
      <div class="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div class="flex items-center space-x-1 truncate max-w-[200px] font-mono text-[10px]">
          <span class="text-slate-500">vault://</span>
          <span class="text-blue-400 font-bold truncate">{{ companyStore.activeCompanyId }}</span>
          <span class="text-slate-600">/</span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="toggleAllFolders"
            class="text-[10px] text-slate-400 hover:text-slate-200 transition underline underline-offset-2"
          >
            {{ allExpanded ? 'Tutup Semua' : 'Buka Semua' }}
          </button>
          <span class="text-slate-600">•</span>
          <span class="text-[10px] font-mono text-slate-300">
            {{ totalFilesCount }} item
          </span>
        </div>
      </div>

      <!-- Quick Filter Search Input -->
      <div class="mt-2.5 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari file dalam tree direktori..."
          class="w-full bg-slate-800/90 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs rounded-lg pl-7 pr-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        />
        <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Island Body: Directory Tree Explorer -->
    <div class="p-3 overflow-y-auto flex-1 max-h-[calc(100vh-250px)] space-y-2 bg-slate-50/70">
      <!-- DIRECTORY TREE ROOT NODE -->
      <div class="space-y-2">
        <!-- FOLDERS LIST -->
        <div
          v-for="folder in allFolders"
          :key="folder.key"
          class="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-2xs transition"
        >
          <!-- FOLDER HEADER ROW (Directory Tree Node) -->
          <div
            @click="toggleFolder(folder.key)"
            :class="[
              'w-full px-3 py-2.5 flex items-center justify-between cursor-pointer select-none text-left transition',
              expandedFolders[folder.key]
                ? 'bg-slate-100/80 border-b border-gray-100 font-semibold text-slate-900'
                : 'hover:bg-gray-50 text-slate-700'
            ]"
          >
            <div class="flex items-center space-x-2 truncate">
              <!-- Tree Chevron Indicator -->
              <span class="text-gray-400 text-[10px] w-3 flex justify-center transition-transform" :class="{ 'rotate-90': expandedFolders[folder.key] }">
                ▶
              </span>

              <!-- Folder Icon (Open vs Closed) -->
              <span class="text-sm">
                {{ expandedFolders[folder.key] ? '📂' : folder.icon }}
              </span>

              <!-- Folder Title -->
              <span class="text-xs font-bold text-gray-800 truncate">
                {{ folder.label }}
              </span>

              <!-- Custom Category Badge -->
              <span
                v-if="folder.isCustom"
                class="text-[9px] bg-purple-100 text-purple-700 font-medium px-1.5 py-0.2 rounded"
              >
                Kustom
              </span>
            </div>

            <!-- Folder Right Metadata & Actions -->
            <div class="flex items-center space-x-1.5 shrink-0" @click.stop>
              <!-- Item Count Badge -->
              <span
                :class="[
                  'text-[10px] font-mono px-2 py-0.5 rounded-full font-bold',
                  getFolderCount(folder.key) > 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ getFolderCount(folder.key) }}
              </span>

              <!-- Quick Upload into this folder -->
              <button
                v-if="folder.key !== 'CREDENTIALS'"
                @click="openUploadModal(folder.key)"
                title="Upload file langsung ke folder ini"
                class="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>

              <!-- Delete custom folder button -->
              <button
                v-if="folder.isCustom"
                @click="deleteCustomFolder(folder.key, folder.label)"
                title="Hapus folder kustom"
                class="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- FOLDER CONTENT: NESTED FILES IN DIRECTORY TREE -->
          <div v-show="expandedFolders[folder.key]" class="p-2.5 bg-slate-50/40">
            <!-- BRANCH 1: CREDENTIALS FOLDER (Persyaratan Dasar & NIB) -->
            <div v-if="folder.key === 'CREDENTIALS'" class="space-y-2 border-l-2 border-emerald-300 ml-3 pl-3">
              <div v-if="filteredCredentials.length === 0" class="py-4 px-2 text-center text-gray-400 text-xs italic">
                Belum ada Verifiable Credential resmi terbit untuk entitas ini.
              </div>

              <div
                v-for="vc in filteredCredentials"
                :key="vc.id"
                class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-xl p-3 shadow-xs border border-slate-700 relative overflow-hidden"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1"
                    :class="[
                      vc.category === 'KKPR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      vc.category === 'LINGKUNGAN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      vc.category === 'PBG_SLF' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    ]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{{ vc.category === 'PBG_SLF' ? 'PBG / SLF' : vc.category }}</span>
                  </span>
                  <span class="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    {{ vc.credentialType }}
                  </span>
                </div>

                <div class="mt-2">
                  <h4 class="font-bold text-xs text-white line-clamp-1">{{ vc.title }}</h4>
                  <div class="flex items-center space-x-2 text-[10px] text-slate-300 mt-0.5">
                    <span>KBLI {{ vc.kbliCode }}</span>
                    <span>•</span>
                    <span class="text-slate-400 truncate max-w-[150px]">{{ vc.issuerName }}</span>
                  </div>

                  <!-- Key Claims Highlights -->
                  <div v-if="vc.claims" class="mt-2 bg-slate-800/80 p-2 rounded-lg text-[9px] font-mono space-y-0.5 border border-slate-700">
                    <div v-if="vc.claims.nomor_kkpr" class="truncate text-cyan-300">
                      No: {{ vc.claims.nomor_kkpr }}
                    </div>
                    <div v-if="vc.claims.nomor_surat" class="truncate text-emerald-300">
                      No: {{ vc.claims.nomor_surat }}
                    </div>
                    <div v-if="vc.claims.nomor_pbg" class="truncate text-blue-300">
                      No: {{ vc.claims.nomor_pbg }}
                    </div>
                    <div v-if="vc.claims.zona_ruang" class="truncate text-slate-300">
                      Kawasan: {{ vc.claims.zona_ruang }}
                    </div>
                    <div v-if="vc.claims.luas_tanah_m2" class="text-slate-300">
                      Luas: {{ Number(vc.claims.luas_tanah_m2).toLocaleString('id-ID') }} m²
                    </div>
                    <div class="truncate text-emerald-400">ID: {{ vc.id }}</div>
                    <div class="text-slate-400">Terbit: {{ formatDate(vc.issuedAt) }}</div>
                  </div>
                </div>

                <div class="mt-2.5 pt-2 border-t border-slate-700 flex items-center justify-between">
                  <button
                    @click="activeQrVc = { qrCodeData: vc.qrCodeData, title: vc.title, vcId: vc.id }"
                    class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-white rounded border border-slate-600 transition"
                  >
                    QR Check
                  </button>
                  <button
                    @click="viewCredentialDetail(vc)"
                    class="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white rounded shadow transition flex items-center space-x-1"
                  >
                    <span>👁️</span>
                    <span>Detail VC</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- BRANCH 2: REGULAR & CUSTOM CATEGORY DOCUMENT FOLDERS -->
            <div v-else class="space-y-2 border-l-2 border-blue-200 ml-3 pl-3">
              <!-- SPECIAL ACTION CARD FOR PERUSAHAAN FOLDER -->
              <div
                v-if="folder.key === 'PERUSAHAAN'"
                class="bg-gradient-to-r from-blue-50/90 to-indigo-50/80 border border-blue-200 rounded-xl p-2.5 shadow-2xs mb-2"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-xs font-bold text-slate-900">Profil Legalitas Entitas</span>
                    <span class="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded font-mono">
                      {{ companyStore.activeCompany.type }}
                    </span>
                  </div>
                  <span class="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                    AHU & KSWP
                  </span>
                </div>
                <p class="text-[10px] text-slate-600 mt-1 truncate">
                  {{ companyStore.activeCompany.name }}
                </p>
                <button
                  @click="openCompanyProfileModal"
                  type="button"
                  class="mt-2 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <span>🏢</span>
                  <span>Input / Sinkronisasi Profil Perusahaan</span>
                </button>
              </div>

              <!-- SPECIAL ACTION CARD FOR LOKASI FOLDER -->
              <div
                v-if="folder.key === 'LOKASI'"
                class="bg-gradient-to-r from-emerald-50/90 to-teal-50/80 border border-emerald-200 rounded-xl p-2.5 shadow-2xs mb-2"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-xs font-bold text-slate-900">Studio Spasial & Perpustakaan Lahan</span>
                    <span class="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                      GIS Vektor
                    </span>
                  </div>
                  <span class="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">
                    {{ spatialStore.parcelsByCompany(companyStore.activeCompanyId).length }} Aset Lahan
                  </span>
                </div>
                <p class="text-[10px] text-slate-600 mt-1 truncate">
                  {{ permitStore.activeWizard.formData.alamat_usaha || 'Plot Kawasan Industri Sentul' }}
                </p>
                <button
                  @click="openLocationStudioModal"
                  type="button"
                  class="mt-2 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <span>📍</span>
                  <span>Tambah Lokasi / Gambar Poligon</span>
                </button>
              </div>

              <!-- List of Spatial Parcel Assets in LOKASI folder -->
              <div v-if="folder.key === 'LOKASI' && spatialStore.parcelsByCompany(companyStore.activeCompanyId).length > 0" class="space-y-1 mb-2">
                <div
                  v-for="parcel in spatialStore.parcelsByCompany(companyStore.activeCompanyId)"
                  :key="parcel.parcel_id"
                  class="p-2 bg-emerald-50/40 border border-emerald-200/80 rounded-lg text-xs flex items-center justify-between"
                >
                  <div class="flex items-center space-x-2 truncate">
                    <span class="text-sm">🗺️</span>
                    <div class="truncate">
                      <span class="font-bold text-gray-900 text-[11px] block truncate">{{ parcel.site_name }}</span>
                      <span class="text-[9px] font-mono text-gray-500">{{ parcel.area_sqm.toLocaleString('id-ID') }} m² • {{ parcel.rdtr_status }}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="openLocationStudioModal"
                    class="text-[10px] text-emerald-700 font-bold hover:underline shrink-0"
                  >
                    Buka Peta
                  </button>
                </div>
              </div>

              <div
                v-if="getDocsInFolder(folder.key).length === 0 && (folder.key !== 'LOKASI' || spatialStore.parcelsByCompany(companyStore.activeCompanyId).length === 0)"
                class="py-3 px-2 text-center text-gray-400 text-xs italic"
              >
                Folder kosong.
                <button
                  @click="openUploadModal(folder.key)"
                  class="text-blue-600 font-semibold hover:underline block mx-auto mt-1"
                >
                  + Upload file ke folder ini
                </button>
              </div>

              <!-- FILE NODE IN TREE -->
              <div
                v-for="doc in getDocsInFolder(folder.key)"
                :key="doc.id"
                class="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-2.5 shadow-2xs hover:shadow-xs transition group"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-start space-x-2 truncate">
                    <!-- File Extension Icon -->
                    <span class="text-base shrink-0 mt-0.5">
                      {{ getFileIcon(doc.fileName) }}
                    </span>

                    <div class="truncate">
                      <h4 class="font-bold text-gray-900 text-xs line-clamp-1">{{ doc.title }}</h4>
                      <p class="text-[10px] font-mono text-gray-500 truncate max-w-[190px]">{{ doc.fileName }}</p>
                      <p class="text-[9px] text-gray-400">{{ doc.fileSize }} • {{ doc.uploadedAt }}</p>
                    </div>
                  </div>

                  <span class="text-[8px] font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded shrink-0">
                    SHA-256
                  </span>
                </div>

                <div class="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px]">
                  <span class="text-gray-400 font-mono truncate max-w-[130px]" :title="doc.sha256">
                    {{ doc.sha256.slice(0, 12) }}...
                  </span>

                  <div class="flex items-center space-x-2">
                    <button
                      @click="previewDoc(doc)"
                      class="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Preview
                    </button>
                    <button
                      @click="copyHash(doc.sha256)"
                      class="text-gray-400 hover:text-gray-700"
                      title="Salin SHA-256 Digest"
                    >
                      Salin Hash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
          <div class="flex justify-between items-center pb-4 border-b">
            <div>
              <h3 class="text-base font-bold text-gray-900">Upload Dokumen ke Folder VFC</h3>
              <p class="text-xs text-gray-500">Dokumen akan dienkripsi dan dihitung hash SHA-256 secara otomatis.</p>
            </div>
            <button @click="showUploadModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleUpload" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Target Folder Direktori</label>
              <select
                v-model="newDoc.category"
                class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg text-xs bg-gray-50 font-semibold text-gray-800"
              >
                <optgroup label="Folder Standar">
                  <option value="PERUSAHAAN">Perusahaan (Akta, NPWP, NIK)</option>
                  <option value="LOKASI">Lokasi (Sertifikat HGB, GIS, Tata Ruang)</option>
                  <option value="LINGKUNGAN">Lingkungan (SPPL, UKL-UPL, AMDAL)</option>
                  <option value="PENGAJUAN">Pengajuan (Pakta Integritas, Form Permohonan)</option>
                </optgroup>
                <optgroup v-if="vfcStore.customCategories.length > 0" label="Folder Kustom">
                  <option
                    v-for="custom in vfcStore.customCategories"
                    :key="custom.key"
                    :value="custom.key"
                  >
                    {{ custom.icon }} {{ custom.label }}
                  </option>
                </optgroup>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Judul / Nama Dokumen</label>
              <input
                v-model="newDoc.title"
                type="text"
                required
                placeholder="Contoh: Neraca Keuangan Audit 2025"
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

            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start space-x-2">
              <span class="text-base">🔒</span>
              <div>
                <p class="font-bold">Keamanan Terisolasi VFC Zone 1</p>
                <p class="text-[11px] mt-0.5">Dokumen disimpan pada object storage terisolasi dan dapat dilampirkan ulang tanpa upload berulang ke kementerian teknis.</p>
              </div>
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
                Simpan ke Folder
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Add Custom Category Modal -->
    <Teleport to="body">
      <div v-if="showAddCategoryModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-base font-bold text-gray-900">Tambah Folder Kustom</h3>
            <button @click="showAddCategoryModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form @submit.prevent="handleCreateCategory" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Nama Folder / Kategori</label>
              <input
                v-model="newCategoryName"
                type="text"
                required
                placeholder="Contoh: Pajak & Bea Cukai"
                class="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Pilih Ikon Folder</label>
              <div class="grid grid-cols-6 gap-2 mt-1.5">
                <button
                  type="button"
                  v-for="icon in availableIcons"
                  :key="icon"
                  @click="selectedCategoryIcon = icon"
                  :class="[
                    'p-2 text-base rounded-lg border text-center transition',
                    selectedCategoryIcon === icon
                      ? 'border-blue-600 bg-blue-50 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  ]"
                >
                  {{ icon }}
                </button>
              </div>
            </div>

            <div class="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                @click="showAddCategoryModal = false"
                class="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
              >
                Buat Folder
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Document Preview & Integrity Modal -->
    <Teleport to="body">
      <div v-if="previewingDoc" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
          <div class="flex justify-between items-center pb-3 border-b">
            <div class="flex items-center space-x-2">
              <span class="text-xl">{{ getFileIcon(previewingDoc.fileName) }}</span>
              <div>
                <h3 class="text-sm font-bold text-gray-900">{{ previewingDoc.title }}</h3>
                <p class="text-[10px] text-gray-500">{{ previewingDoc.fileName }}</p>
              </div>
            </div>
            <button @click="previewingDoc = null" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div class="mt-4 space-y-3 text-xs">
            <div class="bg-slate-50 p-3 rounded-xl border border-gray-200 space-y-2 font-mono text-[11px]">
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">ID Dokumen:</span>
                <span class="font-bold text-gray-800">{{ previewingDoc.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">Folder:</span>
                <span class="text-blue-700 font-bold font-sans">{{ previewingDoc.category }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">Ukuran File:</span>
                <span class="text-gray-700">{{ previewingDoc.fileSize }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">Waktu Upload:</span>
                <span class="text-gray-700">{{ previewingDoc.uploadedAt }}</span>
              </div>
              <div class="pt-2 border-t border-gray-200">
                <span class="text-gray-500 font-sans block mb-1">SHA-256 Digest Cryptographic Proof:</span>
                <span class="text-[10px] text-emerald-700 break-all bg-emerald-50 p-2 rounded block border border-emerald-200">
                  {{ previewingDoc.sha256 }}
                </span>
              </div>
            </div>

            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center space-x-2">
              <span class="text-base">✅</span>
              <span class="text-[11px]">Integritas file tervalidasi. Siap dilampirkan pada Wizard Pengajuan Izin tanpa re-upload.</span>
            </div>
          </div>

          <div class="mt-5 flex justify-end space-x-2">
            <button
              @click="previewingDoc = null"
              class="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- QR Verification Modal -->
    <Teleport to="body">
      <div v-if="activeQrVc" class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
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
    </Teleport>

    <!-- Company Profile Modal (Input/Sync from VFC Perusahaan) -->
    <Teleport to="body">
      <div
        v-if="showCompanyProfileModal"
        class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto"
      >
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 text-gray-900 shadow-2xl my-8 border border-gray-100">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div class="flex items-center space-x-2.5">
            <span class="p-2 bg-blue-50 text-blue-600 rounded-xl text-lg">🏢</span>
            <div>
              <h3 class="font-bold text-base text-gray-900">Profil Legalitas & Entitas Usaha (VFC)</h3>
              <p class="text-xs text-gray-500">
                Pembaruan data badan hukum, NIB, struktur modal, dan sinkronisasi AHU / KSWP
              </p>
            </div>
          </div>
          <button
            @click="showCompanyProfileModal = false"
            class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSaveCompanyProfile" class="mt-4 space-y-4 text-xs">
          <!-- Section 1: Identitas Pokok -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Nama Entitas / Perusahaan</label>
              <input
                v-model="editingCompany.name"
                required
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Bentuk Badan Usaha</label>
              <select
                v-model="editingCompany.type"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="PT">PT (Perseroan Terbatas)</option>
                <option value="CV">CV (Persekutuan Komanditer)</option>
                <option value="PERORANGAN">Perorangan / UMK</option>
                <option value="KOPERASI">Koperasi</option>
                <option value="BULN">Badan Usaha Luar Negeri (BULN)</option>
              </select>
            </div>
          </div>

          <!-- Section 2: Penanaman Modal & Modal Disetor -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Status Penanaman Modal</label>
              <select
                v-model="editingCompany.status_penanaman_modal"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="02">PMDN (Dalam Negeri)</option>
                <option value="01">PMA (Asing - Min. 10 Milyar)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Modal Ditempatkan / Disetor (IDR)</label>
              <input
                v-model.number="editingCompany.capital"
                type="number"
                min="0"
                step="1000000"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Skala Usaha</label>
              <select
                v-model="editingCompany.scale"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Mikro">Mikro (&lt; 1M)</option>
                <option value="Kecil">Kecil (1M - 5M)</option>
                <option value="Menengah">Menengah (5M - 10M)</option>
                <option value="Besar">Besar (&gt; 10M)</option>
              </select>
            </div>
          </div>

          <!-- Section 3: NIB, NPWP & Alamat -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Nomor Induk Berusaha (NIB)</label>
              <input
                v-model="editingCompany.nib"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">NPWP Entitas</label>
              <input
                v-model="editingCompany.npwp"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Alamat Domisili Kantor Pusat</label>
            <textarea
              v-model="editingCompany.address"
              rows="2"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            ></textarea>
          </div>

          <!-- Section 4: Simulasi Integrasi Zone C0 (AHU & KSWP) -->
          <div class="border border-blue-100 bg-blue-50/50 rounded-xl p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-900 text-xs flex items-center space-x-1.5">
                <span>🛡️</span>
                <span>Integrasi Lembaga Eksternal (Zone C0 In-Browser Simulation)</span>
              </span>
              <span class="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-mono">
                No External Network Calls
              </span>
            </div>

            <!-- AHU Online -->
            <div class="bg-white p-3 rounded-lg border border-blue-200/60 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div class="space-y-0.5">
                <div class="font-semibold text-gray-800 text-xs">Kemenkumham AHU Online</div>
                <div class="text-[11px] text-gray-500 font-mono">
                  SK: {{ editingCompany.ahu_sk_number || 'Belum tersinkronisasi' }}
                </div>
                <div v-if="editingCompany.notary_name" class="text-[10px] text-gray-400">
                  Notaris: {{ editingCompany.notary_name }} ({{ editingCompany.ahu_date }})
                </div>
              </div>
              <button
                type="button"
                @click="simulateAhuSync"
                :disabled="isSyncingAhu"
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shrink-0 flex items-center space-x-1"
              >
                <span>{{ isSyncingAhu ? '⏳ Sinkronisasi...' : '🔄 Tarik AHU Online' }}</span>
              </button>
            </div>

            <!-- KSWP DJP -->
            <div class="bg-white p-3 rounded-lg border border-blue-200/60 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div class="space-y-0.5">
                <div class="font-semibold text-gray-800 text-xs">Konfirmasi Status Wajib Pajak (KSWP DJP)</div>
                <div class="text-[11px] font-mono flex items-center space-x-1.5">
                  <span
                    :class="editingCompany.kswp_status === 'VALID' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'"
                  >
                    ● {{ editingCompany.kswp_status === 'VALID' ? 'STATUS VALID' : 'BELUM VALIDASI' }}
                  </span>
                  <span class="text-gray-400 text-[10px] truncate max-w-xs">
                    {{ editingCompany.tax_compliance || 'Wajib Pajak Patuh' }}
                  </span>
                </div>
              </div>
              <button
                type="button"
                @click="simulateKswpCheck"
                :disabled="isCheckingKswp"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shrink-0 flex items-center space-x-1"
              >
                <span>{{ isCheckingKswp ? '⏳ Memeriksa...' : '🛡️ Verifikasi KSWP' }}</span>
              </button>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              @click="showCompanyProfileModal = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Simpan Profil Entitas
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>

    <!-- Location Studio Modal (Polygon & GIS Drawing from VFC Lokasi) -->
    <Teleport to="body">
      <div
        v-if="showLocationStudioModal"
        class="fixed inset-0 bg-slate-900/85 backdrop-blur-xs z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        <div class="bg-slate-950 rounded-2xl max-w-5xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
          <!-- Header -->
          <div class="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-base">🗺️</span>
              <div>
                <h3 class="font-bold text-sm text-white">Studio Spasial VFC — Tambah / Gambar Poligon Lahan</h3>
                <p class="text-[11px] text-slate-400">
                  Gambar poligon koordinat atau pilih preset kawasan industri untuk disimpan ke VFC & Database Lahan
                </p>
              </div>
            </div>
            <button
              @click="showLocationStudioModal = false"
              class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-base transition"
            >
              ✕
            </button>
          </div>

          <!-- Studio Map Canvas Body -->
          <div class="p-4 overflow-y-auto flex-1">
            <InteractiveGisStudio @save-parcel="onVfcSaveParcel" />
          </div>

          <!-- Modal Footer -->
          <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-400 text-[11px]">
              💡 Poligon yang disimpan otomatis dihitung luasnya, dicek persilangan batas kab/prov, dan didaftarkan ke VFC Lokasi.
            </span>
            <button
              @click="showLocationStudioModal = false"
              class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
            >
              Tutup Studio
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Verifiable Credential Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedVcDetail" class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
          <div class="flex items-center justify-between pb-3 border-b">
            <div class="flex items-center space-x-2">
              <span class="text-xl">📜</span>
              <div>
                <h3 class="text-sm font-bold text-gray-900">{{ selectedVcDetail.title }}</h3>
                <p class="text-[10px] text-gray-500 font-mono">{{ selectedVcDetail.credentialType }} • W3C Standard</p>
              </div>
            </div>
            <button @click="selectedVcDetail = null" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-[11px] font-mono">
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">ID Kredensial:</span>
                <span class="text-emerald-700 font-bold truncate max-w-xs">{{ selectedVcDetail.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">Issuer DID:</span>
                <span class="text-blue-700 font-bold truncate max-w-xs">{{ selectedVcDetail.issuerDid }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">Instansi Penerbit:</span>
                <span class="text-gray-900 font-sans font-bold">{{ selectedVcDetail.issuerName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">Tanggal Terbit:</span>
                <span class="text-gray-700">{{ selectedVcDetail.issuedAt }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-sans">Status Kredensial:</span>
                <span class="text-emerald-700 font-bold font-sans">● VALID & AKTIF</span>
              </div>
            </div>

            <!-- Subject Claims List -->
            <div class="space-y-1">
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Klaim Resmi (Credential Subject):</span>
              <div class="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-[11px] font-mono space-y-1.5 overflow-x-auto">
                <div v-for="(val, key) in selectedVcDetail.claims" :key="key" class="flex justify-between gap-2 border-b border-slate-800 pb-1">
                  <span class="text-slate-400">{{ key }}:</span>
                  <span class="text-emerald-400 font-bold text-right">{{ val }}</span>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Bukti Kriptografi (Proof SHA-256 Digest):</span>
              <span class="text-[10px] text-emerald-800 font-mono break-all bg-emerald-50 p-2 rounded-lg block border border-emerald-200">
                {{ selectedVcDetail.proofHash }}
              </span>
            </div>
          </div>

          <div class="pt-3 border-t flex justify-end space-x-2">
            <button
              @click="selectedVcDetail = null"
              class="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition"
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
import { ref, computed, reactive } from 'vue';
import { useVfcStore, type VfcDocument } from '../stores/vfcStore';
import { useCompanyStore, type BusinessEntity } from '../stores/companyStore';
import { usePermitStore } from '../stores/permitStore';
import { useSpatialStore } from '../stores/spatialStore';
import { useCredentialStore } from '../stores/credentialStore';
import InteractiveGisStudio from './InteractiveGisStudio.vue';

const vfcStore = useVfcStore();
const companyStore = useCompanyStore();
const permitStore = usePermitStore();
const spatialStore = useSpatialStore();
const credentialStore = useCredentialStore();

const searchQuery = ref('');
const showUploadModal = ref(false);
const showAddCategoryModal = ref(false);
const previewingDoc = ref<VfcDocument | null>(null);
const activeQrVc = ref<any>(null);
const selectedVcDetail = ref<any>(null);

const newCategoryName = ref('');
const selectedCategoryIcon = ref('📁');
const availableIcons = ['📁', '💰', '⚙️', '🧪', '⚖️', '📦', '🛡️', '📊', '🤝', '🚢', '🏗️', '📑'];

// Directory Tree expansion state
const expandedFolders = reactive<Record<string, boolean>>({
  PERUSAHAAN: true,
  LOKASI: true,
  LINGKUNGAN: false,
  PENGAJUAN: true,
  CREDENTIALS: true
});

interface FolderNode {
  key: string;
  label: string;
  icon: string;
  isCustom?: boolean;
}

const standardFolders: FolderNode[] = [
  { key: 'PERUSAHAAN', label: 'Perusahaan', icon: '🏢', isCustom: false },
  { key: 'LOKASI', label: 'Lokasi', icon: '🗺️', isCustom: false },
  { key: 'LINGKUNGAN', label: 'Lingkungan', icon: '🌱', isCustom: false },
  { key: 'PENGAJUAN', label: 'Pengajuan', icon: '📄', isCustom: false },
  { key: 'CREDENTIALS', label: 'Credentials', icon: '📜', isCustom: false }
];

const allFolders = computed<FolderNode[]>(() => {
  const custom: FolderNode[] = vfcStore.customCategories.map((c) => ({
    key: c.key,
    label: c.label,
    icon: c.icon,
    isCustom: true
  }));
  return [...standardFolders, ...custom];
});

const allExpanded = computed(() => {
  return allFolders.value.every((f) => expandedFolders[f.key]);
});

function toggleFolder(folderKey: string) {
  expandedFolders[folderKey] = !expandedFolders[folderKey];
}

function toggleAllFolders() {
  const target = !allExpanded.value;
  for (const f of allFolders.value) {
    expandedFolders[f.key] = target;
  }
}

const currentCompanyDocs = computed(() => {
  return vfcStore.documentsByCompany(companyStore.activeCompanyId);
});

const approvedCredentials = computed(() => {
  return permitStore.approvedCredentials;
});

const modularCredentials = computed(() => {
  return credentialStore.activeCompanyCredentials;
});

const allVerifiableCredentials = computed(() => {
  const list: any[] = [];
  // 1. Modular Persyaratan Dasar Credentials (KKPR, Lingkungan, PBG & SLF)
  for (const c of modularCredentials.value) {
    list.push({
      id: c.id,
      isModular: true,
      category: c.category,
      title: c.title,
      kbliCode: c.kbliCode,
      kbliTitle: c.kbliTitle,
      credentialType: c.credentialType,
      issuerDid: c.issuerDid,
      issuerName: c.issuerName,
      issuedAt: c.issuedAt,
      proofHash: c.proofHash,
      qrCodeData: c.qrCodeData,
      claims: c.claims
    });
  }
  // 2. Application-level Credentials (NIB / Sertifikat Standar)
  for (const app of approvedCredentials.value) {
    if (app.verifiableCredential) {
      list.push({
        id: app.verifiableCredential.vcId,
        isModular: false,
        category: 'NIB',
        title: `Verifiable ${app.verifiableCredential.credentialType} (${app.kbliTitle})`,
        kbliCode: app.kbliCode,
        kbliTitle: app.kbliTitle,
        credentialType: app.verifiableCredential.credentialType,
        issuerDid: app.verifiableCredential.issuer,
        issuerName: 'Kementerian Investasi / BKPM',
        issuedAt: app.verifiableCredential.issuedAt,
        proofHash: app.verifiableCredential.proofHash,
        qrCodeData: app.verifiableCredential.qrCodeData,
        claims: {
          nomor_permohonan: app.id,
          tingkat_risiko: app.riskLevel,
          status: 'Disetujui Otomatis'
        }
      });
    }
  }
  return list;
});

const totalFilesCount = computed(() => {
  return currentCompanyDocs.value.length + allVerifiableCredentials.value.length;
});

const filteredCredentials = computed(() => {
  if (!searchQuery.value.trim()) return allVerifiableCredentials.value;
  const q = searchQuery.value.toLowerCase();
  return allVerifiableCredentials.value.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.kbliTitle.toLowerCase().includes(q) ||
      c.kbliCode.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.credentialType.toLowerCase().includes(q)
  );
});

function viewCredentialDetail(vc: any) {
  selectedVcDetail.value = vc;
}

function openFolder(folderKey: string) {
  expandedFolders[folderKey] = true;
}

defineExpose({ openFolder });

function getDocsInFolder(categoryKey: string): VfcDocument[] {
  let docs = vfcStore.documentsByCategory(companyStore.activeCompanyId, categoryKey);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.sha256.toLowerCase().includes(q)
    );
  }
  return docs;
}

function getFolderCount(categoryKey: string): number {
  if (categoryKey === 'CREDENTIALS') {
    return allVerifiableCredentials.value.length;
  }
  return vfcStore.documentsByCategory(companyStore.activeCompanyId, categoryKey).length;
}

function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (ext === 'json' || ext === 'geojson') return '🗺️';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return '🖼️';
  return '📁';
}

const selectedFile = ref<File | null>(null);
const newDoc = ref({
  category: 'PERUSAHAAN',
  title: ''
});

function openUploadModal(categoryKey = 'PERUSAHAAN') {
  newDoc.value.category = categoryKey === 'CREDENTIALS' ? 'PERUSAHAAN' : categoryKey;
  newDoc.value.title = '';
  selectedFile.value = null;
  showUploadModal.value = true;
}

function openAddCategoryModal() {
  newCategoryName.value = '';
  selectedCategoryIcon.value = '📁';
  showAddCategoryModal.value = true;
}

async function handleCreateCategory() {
  if (!newCategoryName.value.trim()) return;
  const created = await vfcStore.addCustomCategory(newCategoryName.value.trim(), selectedCategoryIcon.value);
  expandedFolders[created.key] = true;
  showAddCategoryModal.value = false;
  newCategoryName.value = '';
}

function deleteCustomFolder(key: string, label: string) {
  if (confirm(`Apakah Anda yakin ingin menghapus folder kustom "${label}"?`)) {
    vfcStore.removeCustomCategory(key);
  }
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
}

async function handleUpload() {
  if (!newDoc.value.title) return;
  const fileName = selectedFile.value ? selectedFile.value.name : 'dokumen_vfc.pdf';
  const fileSize = selectedFile.value ? `${(selectedFile.value.size / 1024 / 1024).toFixed(1)} MB` : '1.8 MB';

  await vfcStore.addDocument({
    companyId: companyStore.activeCompanyId,
    category: newDoc.value.category,
    title: newDoc.value.title,
    fileName: fileName,
    fileSize: fileSize,
    url: '#'
  });

  // Ensure target folder is expanded so user sees the newly uploaded file
  expandedFolders[newDoc.value.category] = true;

  showUploadModal.value = false;
  newDoc.value.title = '';
  selectedFile.value = null;
}

// Company Profile Modal state & actions
const showCompanyProfileModal = ref(false);
const editingCompany = reactive<Partial<BusinessEntity>>({
  name: '',
  type: 'PT',
  nib: '',
  npwp: '',
  address: '',
  sector: '',
  capital: 0,
  status_penanaman_modal: '02',
  ahu_sk_number: '',
  ahu_date: '',
  notary_name: '',
  kswp_status: 'VALID',
  tax_compliance: '',
  scale: 'Besar'
});
const isSyncingAhu = ref(false);
const ahuSyncSuccess = ref(false);
const isCheckingKswp = ref(false);
const kswpCheckSuccess = ref(false);

function openCompanyProfileModal() {
  const current = companyStore.activeCompany;
  Object.assign(editingCompany, {
    name: current.name,
    type: current.type,
    nib: current.nib || '',
    npwp: current.npwp,
    address: current.address,
    sector: current.sector,
    capital: current.capital,
    status_penanaman_modal: current.status_penanaman_modal || '02',
    ahu_sk_number: current.ahu_sk_number || '',
    ahu_date: current.ahu_date || '',
    notary_name: current.notary_name || '',
    kswp_status: current.kswp_status || 'VALID',
    tax_compliance: current.tax_compliance || '',
    scale: current.scale || 'Besar'
  });
  ahuSyncSuccess.value = false;
  kswpCheckSuccess.value = false;
  showCompanyProfileModal.value = true;
}

async function simulateAhuSync() {
  isSyncingAhu.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));
  editingCompany.ahu_sk_number = `AHU-${Math.floor(1000000 + Math.random() * 9000000)}.AH.01.01.TAHUN 2024`;
  editingCompany.ahu_date = new Date().toISOString().slice(0, 10);
  editingCompany.notary_name = 'Suryadharma, S.H., M.Kn.';
  isSyncingAhu.value = false;
  ahuSyncSuccess.value = true;
}

async function simulateKswpCheck() {
  isCheckingKswp.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));
  editingCompany.kswp_status = 'VALID';
  editingCompany.tax_compliance = 'Status KSWP Memenuhi Syarat (Konfirmasi Status Wajib Pajak DJP Valid)';
  isCheckingKswp.value = false;
  kswpCheckSuccess.value = true;
}

async function handleSaveCompanyProfile() {
  await companyStore.updateCompanyProfile(companyStore.activeCompanyId, {
    ...editingCompany
  });
  showCompanyProfileModal.value = false;
  alert('Profil perusahaan dan status legalitas berhasil diperbarui!');
}

// Location Studio Modal state & actions
const showLocationStudioModal = ref(false);

function openLocationStudioModal() {
  showLocationStudioModal.value = true;
}

async function onVfcSaveParcel(parcelData: any) {
  const newParcel = await spatialStore.addParcel({
    company_id: companyStore.activeCompanyId,
    site_name: parcelData.site_name || 'Aset Plot Baru',
    address: parcelData.address || 'Kawasan Industri Terpadu',
    region_code: '32.01.01.2001',
    province: 'Jawa Barat (32)',
    regency: parcelData.is_cross_kab ? 'Lintas Kab/Kota' : 'Kab. Bogor (3201)',
    district: 'Babakan Madang',
    village: 'Sentul',
    postal_code: '16810',
    position: '01',
    latitude: parcelData.latitude || -6.5412,
    longitude: parcelData.longitude || 106.8643,
    polygon_coordinates: parcelData.polygon_coordinates || [],
    area_sqm: parcelData.area_sqm || 1000,
    area_ha: parcelData.area_ha || 0.1,
    is_cross_kab: parcelData.is_cross_kab || false,
    is_cross_prov: parcelData.is_cross_prov || false,
    zone_code: parcelData.zone_code || 'STANDARD',
    zone_name: parcelData.zone_name || 'Kawasan Industri',
    rdtr_status: parcelData.rdtr_status || 'SESUAI',
    rdtr_zoning_code: 'IND-01',
    rdtr_sub_zone: parcelData.rdtr_sub_zone || 'Zona Industri & Pergudangan',
    ownership_doc_type: '02',
    ownership_doc_number: `HGB-${Math.floor(10000 + Math.random() * 90000)}/2024`
  });

  // Also record a VFC document in LOKASI folder
  await vfcStore.addDocument({
    companyId: companyStore.activeCompanyId,
    category: 'LOKASI',
    title: `Peta Poligon Spasial: ${newParcel.site_name}`,
    fileName: `geometri_${newParcel.parcel_id.toLowerCase()}.geojson`,
    fileSize: '420 KB',
    url: '#'
  });

  showLocationStudioModal.value = false;
  expandedFolders['LOKASI'] = true;
  alert(`Aset spasial "${newParcel.site_name}" (${newParcel.area_sqm.toLocaleString('id-ID')} m²) berhasil disimpan ke VFC & Database Lahan.`);
}

function previewDoc(doc: VfcDocument) {
  previewingDoc.value = doc;
}

function copyHash(hash: string) {
  navigator.clipboard?.writeText(hash);
  alert(`SHA-256 hash telah disalin ke clipboard:\n${hash}`);
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
