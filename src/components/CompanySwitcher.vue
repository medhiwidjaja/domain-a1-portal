<template>
  <div class="bg-white border-b border-gray-200 shadow-sm px-4 py-3">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Entity Selector -->
      <div class="flex items-center space-x-3 w-full md:w-auto">
        <div class="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
          </svg>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Konteks Entitas Usaha (Company Switcher)
          </label>
          <select
            :value="companyStore.activeCompanyId"
            @change="onCompanyChange"
            class="mt-0.5 font-semibold text-gray-800 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
          >
            <option
              v-for="company in companyStore.companies"
              :key="company.id"
              :value="company.id"
            >
              {{ company.name }} ({{ company.type }})
            </option>
          </select>
        </div>
      </div>

      <!-- Active Role & Metadata -->
      <div class="flex items-center space-x-4 text-xs md:text-sm">
        <div class="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <span class="font-medium">Peran Session:</span>
          <span class="font-bold bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
            {{ companyStore.activeCompany.role }}
          </span>
        </div>

        <div class="hidden lg:flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 text-xs">
          <span>NPWP:</span>
          <span class="font-mono font-medium text-gray-900">{{ companyStore.activeCompany.npwp }}</span>
        </div>

        <div class="flex items-center space-x-1">
          <span
            v-if="companyStore.canSubmit"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            <svg class="w-3.5 h-3.5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Hak Akses Submit Permohonan
          </span>
          <span
            v-else
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
          >
            <svg class="w-3.5 h-3.5 mr-1 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            Hanya Hak Akses Drafter (Membutuhkan Sign-Off Direktur)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCompanyStore } from '../stores/companyStore';

const companyStore = useCompanyStore();

function onCompanyChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  companyStore.setActiveCompany(target.value);
}
</script>

