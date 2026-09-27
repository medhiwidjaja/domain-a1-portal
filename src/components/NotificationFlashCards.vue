<template>
  <div class="fixed top-20 right-4 sm:right-6 z-[120] max-w-md w-full space-y-3 pointer-events-none">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 sm:translate-x-0"
      leave-to-class="opacity-0 sm:translate-x-4"
    >
      <div
        v-for="card in flashCards"
        :key="card.id"
        class="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 relative overflow-hidden transition"
      >
        <!-- Top Glow Accent Line based on type -->
        <div
          class="absolute top-0 left-0 right-0 h-1"
          :class="[
            card.type === 'CREDENTIAL_ISSUED' ? 'bg-emerald-500' :
            card.type === 'PNBP_BILLING' ? 'bg-amber-500' :
            card.type === 'DOCUMENT_REVISION' ? 'bg-orange-500' : 'bg-blue-500'
          ]"
        ></div>

        <!-- Header: Badge & Dismiss -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-base">
              {{
                card.type === 'CREDENTIAL_ISSUED' ? '📜' :
                card.type === 'PNBP_BILLING' ? '💳' :
                card.type === 'DOCUMENT_REVISION' ? '⚠️' : '🔔'
              }}
            </span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              :class="[
                card.type === 'CREDENTIAL_ISSUED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                card.type === 'PNBP_BILLING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                card.type === 'DOCUMENT_REVISION' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              ]"
            >
              {{
                card.type === 'CREDENTIAL_ISSUED' ? 'W3C VC Terbit' :
                card.type === 'PNBP_BILLING' ? 'Tagihan PNBP' :
                card.type === 'DOCUMENT_REVISION' ? 'Perbaikan Berkas' : 'Notifikasi'
              }}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">{{ card.timestamp.slice(11, 16) }}</span>
          </div>

          <button
            type="button"
            @click="dismiss(card.id)"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-sm"
            title="Tutup Notifikasi Flash Card"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="mt-2.5">
          <h4 class="text-xs font-bold text-white leading-snug">{{ card.title }}</h4>
          <p class="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
            {{ card.message }}
          </p>

          <!-- Specific Metadata Badges -->
          <div v-if="card.type === 'PNBP_BILLING' && card.metadata" class="mt-2 flex items-center space-x-2 text-[10px] font-mono bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
            <span class="text-amber-400 font-bold">Billing: {{ card.metadata.billingCode }}</span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-200 font-bold">Rp {{ Number(card.metadata.amount || 0).toLocaleString('id-ID') }}</span>
          </div>

          <div v-else-if="card.type === 'CREDENTIAL_ISSUED' && card.metadata" class="mt-2 flex items-center space-x-2 text-[10px] font-mono bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
            <span class="text-emerald-400 font-bold">{{ card.metadata.credentialType }}</span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-300 truncate max-w-[180px]">{{ card.metadata.authorityName }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            @click="dismiss(card.id)"
            class="text-[11px] text-slate-400 hover:text-slate-200 transition underline underline-offset-2"
          >
            Abaikan
          </button>

          <div class="flex items-center space-x-2">
            <!-- Action Trigger -->
            <button
              v-if="card.type === 'PNBP_BILLING'"
              type="button"
              @click="handlePayPnbp(card.id)"
              class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow transition flex items-center space-x-1"
            >
              <span>💳</span>
              <span>Bayar PNBP</span>
            </button>

            <button
              v-else-if="card.type === 'CREDENTIAL_ISSUED'"
              type="button"
              @click="handleViewVfc(card)"
              class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow transition flex items-center space-x-1"
            >
              <span>📜</span>
              <span>Buka di VFC →</span>
            </button>

            <button
              v-else-if="card.type === 'DOCUMENT_REVISION'"
              type="button"
              @click="handleReviseDoc(card)"
              class="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] rounded-lg shadow transition flex items-center space-x-1"
            >
              <span>📤</span>
              <span>Unggah Revisi</span>
            </button>

            <button
              v-else
              type="button"
              @click="openInbox"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow transition"
            >
              Buka Kotak Masuk →
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore, type NotificationItem } from '../stores/notificationStore';

const emit = defineEmits(['switch-tab', 'open-vfc-folder']);
const notificationStore = useNotificationStore();

const flashCards = computed(() => notificationStore.activeFlashCards);

function dismiss(id: string) {
  notificationStore.dismissFlash(id);
}

async function handlePayPnbp(id: string) {
  await notificationStore.payPnbp(id);
}

function handleViewVfc(card: NotificationItem) {
  notificationStore.dismissFlash(card.id);
  notificationStore.markAsRead(card.id);
  emit('switch-tab', 'dashboard');
  emit('open-vfc-folder', 'CREDENTIALS');
}

function handleReviseDoc(card: NotificationItem) {
  notificationStore.dismissFlash(card.id);
  notificationStore.markAsRead(card.id);
  emit('switch-tab', 'inbox');
}

function openInbox() {
  emit('switch-tab', 'inbox');
}
</script>
