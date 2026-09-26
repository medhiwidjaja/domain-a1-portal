<template>
  <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">
    <!-- Studio Header -->
    <div class="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center space-x-2.5">
        <span class="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-lg">🗺️</span>
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="font-bold text-sm text-white">Studio Vektor Spasial & Geometri KKPR</h3>
            <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded">
              WGS84 EPSG:4326
            </span>
          </div>
          <p class="text-[11px] text-slate-400">
            Simulasi visual peta vektor, validasi topologi geometri, & analisis persilangan batas wilayah (PostGIS/RDTR).
          </p>
        </div>
      </div>

      <!-- Map Layer Switcher -->
      <div class="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          @click="activeMapLayer = 'vector'"
          :class="[
            'px-2.5 py-1 rounded-lg font-semibold transition text-[11px]',
            activeMapLayer === 'vector' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          ]"
        >
          Peta Vektor
        </button>
        <button
          type="button"
          @click="activeMapLayer = 'satellite'"
          :class="[
            'px-2.5 py-1 rounded-lg font-semibold transition text-[11px]',
            activeMapLayer === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          ]"
        >
          Citra Satelit
        </button>
        <button
          type="button"
          @click="showRdtrOverlay = !showRdtrOverlay"
          :class="[
            'px-2.5 py-1 rounded-lg font-semibold transition text-[11px] border',
            showRdtrOverlay
              ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
              : 'border-transparent text-slate-400 hover:text-white'
          ]"
        >
          {{ showRdtrOverlay ? '✓ Overlay RDTR' : '+ Overlay RDTR' }}
        </button>
      </div>
    </div>

    <!-- Quick Mode / Preset Toolbar -->
    <div class="px-3 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div class="flex items-center space-x-2">
        <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Mode Input:</span>
        <div class="flex space-x-1">
          <button
            type="button"
            @click="inputMode = 'draw'"
            :class="[
              'px-2 py-1 rounded text-[11px] font-semibold transition',
              inputMode === 'draw' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            ]"
          >
            ✏️ Gambar Poligon
          </button>
          <button
            type="button"
            @click="inputMode = 'upload'"
            :class="[
              'px-2 py-1 rounded text-[11px] font-semibold transition',
              inputMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            ]"
          >
            📁 Unggah Shapefile / GeoJSON
          </button>
          <button
            type="button"
            @click="inputMode = 'preset'"
            :class="[
              'px-2 py-1 rounded text-[11px] font-semibold transition',
              inputMode === 'preset' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            ]"
          >
            🏢 Preset Kawasan
          </button>
        </div>
      </div>

      <!-- Presets quick select if mode === preset -->
      <div v-if="inputMode === 'preset'" class="flex items-center space-x-1.5">
        <button
          type="button"
          v-for="pre in presets"
          :key="pre.id"
          @click="applyPreset(pre)"
          :class="[
            'px-2 py-0.5 rounded text-[10px] font-medium border transition',
            selectedPresetId === pre.id
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          ]"
        >
          {{ pre.label }}
        </button>
      </div>

      <!-- Upload Trigger if mode === upload -->
      <div v-if="inputMode === 'upload'" class="flex items-center space-x-2">
        <label class="cursor-pointer px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow transition flex items-center space-x-1">
          <span>📤 Pilih File ZIP / GeoJSON</span>
          <input type="file" accept=".zip,.geojson,.json,.kml" class="hidden" @change="handleFileUpload" />
        </label>
        <span class="text-[10px] text-slate-400">{{ uploadedFileName || 'Belum ada file dipilih' }}</span>
      </div>
    </div>

    <!-- MAIN SIMULATED GIS MAP CANVAS -->
    <div
      class="relative w-full h-[360px] sm:h-[400px] select-none overflow-hidden cursor-crosshair"
      :class="activeMapLayer === 'satellite' ? 'bg-slate-950' : 'bg-slate-900'"
      @mousemove="handleMapMouseMove"
      @mousedown="startPan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @click="handleMapCanvasClick"
    >
      <!-- Simulated Vector & Satellite Canvas SVG -->
      <svg
        ref="svgCanvasRef"
        class="w-full h-full"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <!-- Grid Pattern -->
          <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="0.7"/>
          </pattern>

          <!-- Satellite Texture Simulation Pattern -->
          <radialGradient id="satGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#14532d" stop-opacity="0.3"/>
            <stop offset="60%" stop-color="#0f172a" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#020617" stop-opacity="0.95"/>
          </radialGradient>
        </defs>

        <!-- Background layer -->
        <rect width="600" height="400" fill="url(#gisGrid)" />
        <rect v-if="activeMapLayer === 'satellite'" width="600" height="400" fill="url(#satGlow)" />

        <!-- Simulated Geographical Features -->
        <g :transform="`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`">
          <!-- Coastline / River simulation -->
          <path
            d="M -50 180 Q 150 120 280 210 T 550 170 T 700 240"
            fill="none"
            :stroke="activeMapLayer === 'satellite' ? '#0369a1' : '#38bdf8'"
            stroke-width="14"
            opacity="0.4"
          />
          <text x="310" y="195" fill="#38bdf8" font-size="9" font-family="sans-serif" opacity="0.6">
            Aliran Sungai Cisadane / Kanal Primer
          </text>

          <!-- Arterial Road Highway Network -->
          <path d="M -50 90 L 650 130" fill="none" stroke="#475569" stroke-width="6" opacity="0.6"/>
          <path d="M -50 90 L 650 130" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.8"/>
          <text x="50" y="85" fill="#94a3b8" font-size="8" font-family="sans-serif">Tol Jagorawi / Akses Industri</text>

          <path d="M 220 -50 L 190 450" fill="none" stroke="#475569" stroke-width="5" opacity="0.5"/>
          <path d="M 440 -50 L 460 450" fill="none" stroke="#475569" stroke-width="4" opacity="0.4"/>

          <!-- RDTR Zoning Overlay Simulation (if active) -->
          <g v-if="showRdtrOverlay">
            <!-- Zona Industri KPI (Green) -->
            <rect x="60" y="130" width="280" height="180" fill="#10b981" fill-opacity="0.18" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4"/>
            <text x="70" y="150" fill="#34d399" font-size="10" font-weight="bold">RDTR: Zona Kawasan Industri (KPI)</text>

            <!-- Zona Komersial (Orange) -->
            <rect x="360" y="100" width="200" height="120" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4"/>
            <text x="370" y="120" fill="#fbbf24" font-size="9" font-weight="bold">RDTR: Zona Perdagangan & Jasa</text>

            <!-- Zona Lindung Sempadan (Red) -->
            <path d="M 200 230 Q 300 260 420 220 L 430 250 Q 300 290 190 260 Z" fill="#ef4444" fill-opacity="0.22" stroke="#ef4444" stroke-width="1"/>
            <text x="230" y="275" fill="#f87171" font-size="8">Zona Sempadan Sungai (Terbatas)</text>
          </g>

          <!-- Regional Administrative Boundary Line -->
          <line
            x1="340" y1="-50" x2="340" y2="450"
            stroke="#eab308"
            stroke-width="1.5"
            stroke-dasharray="6 3"
            opacity="0.7"
          />
          <text x="345" y="40" fill="#eab308" font-size="8" font-family="monospace">
            Batas Wilayah Administratif Kab. Bogor | Kota Depok
          </text>

          <!-- Active Polygon Geometry -->
          <polygon
            v-if="currentPolygonPoints.length >= 3"
            :points="svgPolygonString"
            :class="[
              'stroke-2 transition-all',
              isSelfIntersecting
                ? 'fill-red-500/30 stroke-red-500 animate-pulse'
                : isCrossKab
                ? 'fill-amber-500/30 stroke-amber-400'
                : 'fill-emerald-500/30 stroke-emerald-400'
            ]"
          />

          <!-- In-progress Polygon Lines -->
          <polyline
            v-else-if="currentPolygonPoints.length > 1"
            :points="svgPolygonString"
            fill="none"
            stroke="#38bdf8"
            stroke-width="2"
            stroke-dasharray="4"
          />

          <!-- Centroid Pinpoint Marker with Pulse -->
          <g v-if="currentPolygonPoints.length >= 3">
            <circle :cx="centroid.x" :cy="centroid.y" r="8" fill="#ef4444" opacity="0.3" class="animate-ping"/>
            <circle :cx="centroid.x" :cy="centroid.y" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
            <text :x="centroid.x + 8" :y="centroid.y + 3" fill="#ffffff" font-size="9" font-weight="bold" font-family="monospace">
              Centroid: {{ currentCentroidLat.toFixed(5) }}, {{ currentCentroidLng.toFixed(5) }}
            </text>
          </g>

          <!-- Polygon Vertices (Handles) -->
          <g v-for="(pt, idx) in currentPolygonPoints" :key="idx">
            <circle
              :cx="pt.x"
              :cy="pt.y"
              r="4.5"
              fill="#ffffff"
              stroke="#0f172a"
              stroke-width="2"
              class="cursor-pointer hover:scale-150 transition"
            />
            <text :x="pt.x + 6" :y="pt.y - 4" fill="#cbd5e1" font-size="8" font-family="monospace">
              V{{ idx + 1 }}
            </text>
          </g>
        </g>
      </svg>

      <!-- Map Overlay Controls (Zoom, Reset, GPS) -->
      <div class="absolute right-3 top-3 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-700 shadow-xl">
        <button
          type="button"
          @click="zoomIn"
          title="Zoom In"
          class="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded flex items-center justify-center text-sm transition"
        >
          +
        </button>
        <button
          type="button"
          @click="zoomOut"
          title="Zoom Out"
          class="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded flex items-center justify-center text-sm transition"
        >
          −
        </button>
        <button
          type="button"
          @click="resetView"
          title="Reset Sudut Pandang"
          class="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded flex items-center justify-center transition"
        >
          ⟲
        </button>
      </div>

      <!-- Real-time Status Overlay Bar (Bottom Left) -->
      <div class="absolute left-3 bottom-3 bg-slate-950/85 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center space-x-3">
        <div>
          <span class="text-slate-500">Kursor:</span> {{ mouseGeoPos.lat.toFixed(5) }}, {{ mouseGeoPos.lng.toFixed(5) }}
        </div>
        <span class="text-slate-700">•</span>
        <div>
          <span class="text-slate-500">Skala Zoom:</span> {{ (zoomLevel * 100).toFixed(0) }}%
        </div>
        <span class="text-slate-700">•</span>
        <div class="text-emerald-400 font-bold">
          {{ calculatedAreaSqm.toLocaleString('id-ID') }} m² ({{ calculatedAreaHa.toFixed(2) }} Ha)
        </div>
      </div>

      <!-- Kinks / Self-intersection warning banner -->
      <div
        v-if="isSelfIntersecting"
        class="absolute left-1/2 -translate-x-1/2 top-4 bg-red-600/95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center space-x-2 border border-red-400 animate-bounce"
      >
        <span>⚠️</span>
        <span>Peringatan Topologi: Garis poligon saling berpotongan (Self-Intersection). Harap perbaiki batas lahan!</span>
      </div>
    </div>

    <!-- Spatial Analysis & Attribute Summary Cards -->
    <div class="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
      <!-- 3-Pillar Spatial Engine Real-Time Results -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <!-- 1. Administrative Boundary (Automated Lintas Wilayah) -->
        <div
          :class="[
            'p-3 rounded-xl border space-y-1',
            isCrossProv
              ? 'bg-red-500/10 border-red-500/40 text-red-200'
              : isCrossKab
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
          ]"
        >
          <div class="flex items-center justify-between font-bold">
            <span class="text-[11px] uppercase tracking-wider text-slate-300">Batas Administrasi:</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-900/60">
              {{ isCrossProv ? 'Lintas Provinsi' : isCrossKab ? 'Lintas Kab/Kota' : 'Tunggal' }}
            </span>
          </div>
          <p class="text-[11px] leading-relaxed">
            {{ isCrossProv
              ? '⚠️ Poligon memotong batas 2 Provinsi -> Otomatis diarahkan ke Kementerian Pusat (PUPR/BKPM).'
              : isCrossKab
              ? '⚠️ Poligon berada di perbatasan Kab. Bogor & Kota Depok -> Kewenangan otomatis dialihkan ke Gubernur (Provinsi).'
              : '✅ Berada penuh dalam batas administratif satu Kabupaten/Kota tunggal (Kab. Bogor).'
            }}
          </p>
        </div>

        <!-- 2. Zone Code (KEK / KPBPB / Kawasan Industri) -->
        <div class="p-3 bg-blue-500/10 border border-blue-500/40 text-blue-200 rounded-xl space-y-1">
          <div class="flex items-center justify-between font-bold">
            <span class="text-[11px] uppercase tracking-wider text-slate-300">Penetapan Kawasan:</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-900/60 text-blue-300">
              {{ zoneCode === '03' ? 'KEK (03)' : zoneCode === '04' ? 'KPBPB (04)' : 'Industri Standar' }}
            </span>
          </div>
          <p class="text-[11px] leading-relaxed">
            {{ zoneName || 'Kawasan Industri Terintegrasi Sentra' }}
          </p>
        </div>

        <!-- 3. RDTR GISTARU Compatibility Check -->
        <div
          :class="[
            'p-3 rounded-xl border space-y-1',
            rdtrStatus === 'SESUAI'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
              : rdtrStatus === 'TERBATAS'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
              : 'bg-slate-800 border-slate-700 text-slate-300'
          ]"
        >
          <div class="flex items-center justify-between font-bold">
            <span class="text-[11px] uppercase tracking-wider text-slate-300">Kesesuaian RDTR:</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-900/60">
              {{ rdtrStatus === 'SESUAI' ? '✓ Sesuai (ITBX)' : rdtrStatus === 'TERBATAS' ? 'Bersyarat' : 'Tanpa RDTR' }}
            </span>
          </div>
          <p class="text-[11px] leading-relaxed">
            {{ rdtrSubZone }}
          </p>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="clearPolygon"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            Bersihkan Titik
          </button>
          <span class="text-[11px] text-slate-400">
            Total Titik: <strong class="text-white">{{ currentPolygonPoints.length }}</strong>
          </span>
        </div>

        <button
          type="button"
          @click="saveSpatialAsset"
          :disabled="isSelfIntersecting || currentPolygonPoints.length < 3"
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
        >
          <span>💾</span>
          <span>Simpan ke Aset Lokasi VFC & Bind ke Permohonan</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import type { SpatialParcelAsset } from '../stores/spatialStore';

const props = withDefaults(
  defineProps<{
    initialCoordinates?: Array<{ lat: number; lng: number }>;
    siteName?: string;
    address?: string;
    isCrossKab?: boolean;
    isCrossProv?: boolean;
    zoneCode?: 'STANDARD' | '03' | '04';
    zoneName?: string;
  }>(),
  {
    siteName: 'Plot Kawasan Industri Sentul Lot 12-14',
    address: 'Kawasan Industri Sentul Kavling 12-14, Desa Sentul, Kab. Bogor',
    isCrossKab: false,
    isCrossProv: false,
    zoneCode: 'STANDARD',
    zoneName: 'Kawasan Industri Sentul Sentra'
  }
);

const emit = defineEmits<{
  (e: 'save-parcel', parcelData: Partial<SpatialParcelAsset>): void;
}>();

// Map UI state
const activeMapLayer = ref<'vector' | 'satellite'>('vector');
const showRdtrOverlay = ref(true);
const inputMode = ref<'draw' | 'upload' | 'preset'>('draw');
const uploadedFileName = ref('');
const selectedPresetId = ref('sentul');

// Pan & Zoom
const panOffset = reactive({ x: 0, y: 0 });
const zoomLevel = ref(1.0);
const isPanning = ref(false);
const startPanPos = reactive({ x: 0, y: 0 });
const mouseGeoPos = reactive({ lat: -6.54125, lng: 106.86432 });

// Points on simulated 600x400 map
interface Point2D {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

const currentPolygonPoints = ref<Point2D[]>([
  { x: 120, y: 160, lat: -6.54125, lng: 106.86432 },
  { x: 280, y: 150, lat: -6.54080, lng: 106.86550 },
  { x: 270, y: 260, lat: -6.54210, lng: 106.86590 },
  { x: 110, y: 250, lat: -6.54250, lng: 106.86480 }
]);

// Presets
const presets = [
  {
    id: 'sentul',
    label: '🏭 Sentul (Kab. Bogor)',
    siteName: 'Sentul Industrial Estate Lot 12-14',
    address: 'Kawasan Industri Sentul Kavling 12-14, Babakan Madang, Kab. Bogor',
    isCrossKab: false,
    isCrossProv: false,
    zoneCode: 'STANDARD' as const,
    zoneName: 'Kawasan Industri Sentul Sentra',
    rdtrStatus: 'SESUAI' as const,
    rdtrSubZone: 'Kawasan Peruntukan Industri (KPI) - Sesuai Masterplan GISTARU',
    points: [
      { x: 120, y: 160, lat: -6.54125, lng: 106.86432 },
      { x: 280, y: 150, lat: -6.54080, lng: 106.86550 },
      { x: 270, y: 260, lat: -6.54210, lng: 106.86590 },
      { x: 110, y: 250, lat: -6.54250, lng: 106.86480 }
    ]
  },
  {
    id: 'kendal',
    label: '🌊 Kendal KEK (Jateng)',
    siteName: 'Kendal Industrial Park - SEZ Lot D-8',
    address: 'Kawasan Industri Kendal (KEK), Jl. Laut Jawa Kav 8, Kaliwungu, Kab. Kendal',
    isCrossKab: false,
    isCrossProv: false,
    zoneCode: '03' as const,
    zoneName: 'Kawasan Ekonomi Khusus Kendal (KIK)',
    rdtrStatus: 'SESUAI' as const,
    rdtrSubZone: 'Zona Industri Terpadu KEK Kendal (Masterplan Sesuai)',
    points: [
      { x: 80, y: 140, lat: -6.91500, lng: 110.27400 },
      { x: 300, y: 130, lat: -6.91420, lng: 110.27850 },
      { x: 320, y: 270, lat: -6.91780, lng: 110.27900 },
      { x: 90, y: 260, lat: -6.91840, lng: 110.27450 }
    ]
  },
  {
    id: 'lintas',
    label: '⚠️ Perbatasan Bogor - Depok',
    siteName: 'Plot Terpadu Perbatasan Bogor - Depok',
    address: 'Jl. Raya Jakarta-Bogor Km 38 (Perbatasan Cibinong, Kab. Bogor & Tapos, Kota Depok)',
    isCrossKab: true,
    isCrossProv: false,
    zoneCode: 'STANDARD' as const,
    zoneName: 'Luar Kawasan Industri (Zona Komersial)',
    rdtrStatus: 'SESUAI' as const,
    rdtrSubZone: 'Zona Campuran Perdagangan & Jasa Terpadu',
    points: [
      { x: 260, y: 140, lat: -6.44200, lng: 106.84500 },
      { x: 420, y: 150, lat: -6.44150, lng: 106.84950 },
      { x: 430, y: 260, lat: -6.44620, lng: 106.85000 },
      { x: 250, y: 250, lat: -6.44680, lng: 106.84550 }
    ]
  }
];

const currentSiteName = ref(props.siteName);
const currentAddress = ref(props.address);
const isCrossKab = ref(props.isCrossKab);
const isCrossProv = ref(props.isCrossProv);
const zoneCode = ref(props.zoneCode);
const zoneName = ref(props.zoneName);
const rdtrStatus = ref<'SESUAI' | 'TERBATAS' | 'TANPA_RDTR'>('SESUAI');
const rdtrSubZone = ref('Kawasan Peruntukan Industri (KPI) - Sesuai RDTR GISTARU');

// Automated Spatial Overlap Check based on polygon X coordinates
function recomputeSpatialFlags() {
  if (currentPolygonPoints.value.length < 3) return;
  // Border line is at x = 340
  const hasLeft = currentPolygonPoints.value.some((p) => p.x < 340);
  const hasRight = currentPolygonPoints.value.some((p) => p.x > 340);

  if (hasLeft && hasRight) {
    isCrossKab.value = true;
    rdtrSubZone.value = 'Zona Campuran Perdagangan & Jasa Terpadu (Lintas Kab. Bogor - Kota Depok)';
  } else {
    isCrossKab.value = false;
  }
}

// Convert points to SVG points string
const svgPolygonString = computed(() => {
  return currentPolygonPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
});

// Centroid point calculation
const centroid = computed(() => {
  if (currentPolygonPoints.value.length === 0) return { x: 200, y: 200 };
  const sumX = currentPolygonPoints.value.reduce((acc, p) => acc + p.x, 0);
  const sumY = currentPolygonPoints.value.reduce((acc, p) => acc + p.y, 0);
  return {
    x: Math.round(sumX / currentPolygonPoints.value.length),
    y: Math.round(sumY / currentPolygonPoints.value.length)
  };
});

const currentCentroidLat = computed(() => {
  if (currentPolygonPoints.value.length === 0) return -6.54125;
  const sum = currentPolygonPoints.value.reduce((acc, p) => acc + p.lat, 0);
  return sum / currentPolygonPoints.value.length;
});

const currentCentroidLng = computed(() => {
  if (currentPolygonPoints.value.length === 0) return 106.86432;
  const sum = currentPolygonPoints.value.reduce((acc, p) => acc + p.lng, 0);
  return sum / currentPolygonPoints.value.length;
});

// Area calculation
const calculatedAreaSqm = computed(() => {
  if (currentPolygonPoints.value.length < 3) return 0;
  // Shoelace formula on simulated points
  let area = 0;
  const pts = currentPolygonPoints.value;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  const raw = Math.abs(area) / 2;
  return Math.round(raw * 95); // Scale factor for square meters
});

const calculatedAreaHa = computed(() => {
  return calculatedAreaSqm.value / 10000;
});

// Self-intersection check (kinks)
const isSelfIntersecting = computed(() => {
  const pts = currentPolygonPoints.value;
  if (pts.length < 4) return false;

  function ccw(A: Point2D, B: Point2D, C: Point2D) {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  }

  function intersect(A: Point2D, B: Point2D, C: Point2D, D: Point2D) {
    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
  }

  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    for (let j = i + 2; j < pts.length; j++) {
      if ((i === 0 && j === pts.length - 1) || i === j) continue;
      const p3 = pts[j];
      const p4 = pts[(j + 1) % pts.length];
      if (intersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }
  return false;
});

// Mouse handlers
function handleMapMouseMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const relX = (e.clientX - rect.left - panOffset.x) / zoomLevel.value;
  const relY = (e.clientY - rect.top - panOffset.y) / zoomLevel.value;

  // Convert canvas position to simulated Lat / Lng
  mouseGeoPos.lat = -6.54125 - (relY - 200) * 0.00008;
  mouseGeoPos.lng = 106.86432 + (relX - 300) * 0.00008;

  if (isPanning.value) {
    panOffset.x = e.clientX - startPanPos.x;
    panOffset.y = e.clientY - startPanPos.y;
  }
}

function handleMapCanvasClick(e: MouseEvent) {
  if (inputMode.value !== 'draw' || isPanning.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const relX = (e.clientX - rect.left - panOffset.x) / zoomLevel.value;
  const relY = (e.clientY - rect.top - panOffset.y) / zoomLevel.value;

  const lat = -6.54125 - (relY - 200) * 0.00008;
  const lng = 106.86432 + (relX - 300) * 0.00008;

  currentPolygonPoints.value.push({
    x: Math.round(relX),
    y: Math.round(relY),
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6))
  });

  recomputeSpatialFlags();
}

function startPan(e: MouseEvent) {
  if (e.button === 1 || e.shiftKey) {
    isPanning.value = true;
    startPanPos.x = e.clientX - panOffset.x;
    startPanPos.y = e.clientY - panOffset.y;
  }
}

function endPan() {
  isPanning.value = false;
}

function zoomIn() {
  if (zoomLevel.value < 2.5) zoomLevel.value += 0.2;
}

function zoomOut() {
  if (zoomLevel.value > 0.6) zoomLevel.value -= 0.2;
}

function resetView() {
  zoomLevel.value = 1.0;
  panOffset.x = 0;
  panOffset.y = 0;
}

function clearPolygon() {
  currentPolygonPoints.value = [];
}

function applyPreset(pre: typeof presets[0]) {
  selectedPresetId.value = pre.id;
  currentSiteName.value = pre.siteName;
  currentAddress.value = pre.address;
  isCrossKab.value = pre.isCrossKab;
  isCrossProv.value = pre.isCrossProv;
  zoneCode.value = pre.zoneCode;
  zoneName.value = pre.zoneName;
  rdtrStatus.value = pre.rdtrStatus;
  rdtrSubZone.value = pre.rdtrSubZone;
  currentPolygonPoints.value = pre.points.map((p) => ({ ...p }));
}

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    uploadedFileName.value = file.name;

    // Instant in-browser parse simulation
    currentSiteName.value = `Plot Impor: ${file.name.replace(/\.[^/.]+$/, '')}`;
    currentPolygonPoints.value = [
      { x: 100, y: 120, lat: -6.54110, lng: 106.86410 },
      { x: 310, y: 110, lat: -6.54070, lng: 106.86590 },
      { x: 330, y: 250, lat: -6.54230, lng: 106.86610 },
      { x: 110, y: 240, lat: -6.54260, lng: 106.86430 }
    ];
    recomputeSpatialFlags();
  }
}

function saveSpatialAsset() {
  if (isSelfIntersecting.value || currentPolygonPoints.value.length < 3) return;

  const parcelData: Partial<SpatialParcelAsset> = {
    site_name: currentSiteName.value,
    address: currentAddress.value,
    latitude: currentCentroidLat.value,
    longitude: currentCentroidLng.value,
    polygon_coordinates: currentPolygonPoints.value.map((p) => ({ lat: p.lat, lng: p.lng })),
    area_sqm: calculatedAreaSqm.value,
    area_ha: calculatedAreaHa.value,
    is_cross_kab: isCrossKab.value,
    is_cross_prov: isCrossProv.value,
    zone_code: zoneCode.value,
    zone_name: zoneName.value,
    rdtr_status: rdtrStatus.value,
    rdtr_sub_zone: rdtrSubZone.value
  };

  emit('save-parcel', parcelData);
}
</script>
