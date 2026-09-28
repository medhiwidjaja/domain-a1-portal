<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex justify-between items-center pb-3 border-b">
          <div>
            <h3 class="text-base font-bold text-gray-900">Pilih Aset Spasial dari VFC Lokasi</h3>
            <p class="text-xs text-gray-500">Pilih plot lahan yang sudah tersimpan di vault Anda untuk 1-click binding.</p>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
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
            @click="$emit('select-parcel', parcel)"
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
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useSpatialStore, type SpatialParcelAsset } from '../../stores/spatialStore';
import { useCompanyStore } from '../../stores/companyStore';

defineProps<{
  show: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'select-parcel', parcel: SpatialParcelAsset): void;
}>();

const spatialStore = useSpatialStore();
const companyStore = useCompanyStore();
</script>
