<template>
  <div class="text-center py-12 space-y-4">
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
            @click="$emit('select-umku', u.umku_code)"
            class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
          >
            {{ isUmkuIssued(u.umku_code) ? 'Lihat Izin Terbit →' : 'Ajukan PB-UMKU →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeKbliUmkuList: any[];
  isUmkuIssued: (code: string) => boolean;
}>();

defineEmits<{
  (e: 'switch-tab', tab: string): void;
  (e: 'select-umku', umkuCode: string): void;
}>();
</script>
