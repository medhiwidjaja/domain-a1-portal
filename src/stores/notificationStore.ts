import { defineStore } from 'pinia';
import { useCompanyStore } from './companyStore';
import { getAppState, setAppState } from '../utils/idbStorage';

export type NotificationType =
  | 'CREDENTIAL_ISSUED'
  | 'PNBP_BILLING'
  | 'DOCUMENT_REVISION'
  | 'INFO';

export interface NotificationItem {
  id: string;
  companyId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  dismissedFromFlash: boolean;
  actionLabel?: string;
  actionType?: 'VIEW_CREDENTIAL' | 'PAY_PNBP' | 'UPLOAD_PAYMENT_PROOF' | 'REVISE_DOC' | 'OPEN_TAB';
  metadata?: {
    credentialId?: string;
    credentialType?: string;
    billingCode?: string;
    amount?: number;
    paymentStatus?: 'UNPAID' | 'PAID';
    proofFileName?: string;
    ntpn?: string;
    bankName?: string;
    paymentNotes?: string;
    vfcDocId?: string;
    revisionTargetDoc?: string;
    revisionNote?: string;
    authorityName?: string;
    kbliCode?: string;
    folderKey?: string;
    targetTab?: string;
    [key: string]: any;
  };
}

export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    isHydrated: false,
    notifications: [
      {
        id: 'NOTIF-2026-001',
        companyId: 'COMP-001',
        type: 'CREDENTIAL_ISSUED' as NotificationType,
        title: 'Verifiable Credential Terbit: Verifiable KKPR (Tata Ruang)',
        message: 'Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) Darat untuk Kawasan Industri Sentul telah diverifikasi otomatis dan diterbitkan sebagai W3C Verifiable Credential resmi.',
        timestamp: '2026-09-27 01:15',
        read: false,
        dismissedFromFlash: false,
        actionLabel: 'Buka di Folder VFC',
        actionType: 'VIEW_CREDENTIAL',
        metadata: {
          credentialId: 'urn:uuid:vc-kkpr-2026-01285-8812',
          credentialType: 'VerifiableKKPR',
          authorityName: 'Kementerian ATR/BPN',
          kbliCode: '01285',
          folderKey: 'CREDENTIALS'
        }
      },
      {
        id: 'NOTIF-2026-002',
        companyId: 'COMP-001',
        type: 'PNBP_BILLING' as NotificationType,
        title: 'Surat Perintah Setor: Tagihan PNBP Simponi (Rp 7.500.000)',
        message: 'Kementerian ATR/BPN telah menerbitkan Surat Perintah Setor (Kode Billing Simponi: 8202609012399). Sistem OSS tidak memproses pembayaran secara online. Harap lakukan pembayaran melalui teller bank, ATM, atau internet banking persepsi, kemudian unggah bukti pembayaran (bukti setor) untuk melanjutkan proses evaluasi. Berkas bukti pembayaran akan disimpan secara aman di Virtual Filing Cabinet.',
        timestamp: '2026-09-26 14:30',
        read: false,
        dismissedFromFlash: false,
        actionLabel: 'Unggah Bukti Bayar',
        actionType: 'UPLOAD_PAYMENT_PROOF',
        metadata: {
          billingCode: '8202609012399',
          amount: 7500000,
          paymentStatus: 'UNPAID',
          authorityName: 'Kementerian ATR/BPN (Simponi Kemenkeu)',
          kbliCode: '03111',
          folderKey: 'PEMBAYARAN'
        }
      },
      {
        id: 'NOTIF-2026-003',
        companyId: 'COMP-001',
        type: 'DOCUMENT_REVISION' as NotificationType,
        title: 'Permintaan Perbaikan Berkas: Dokumen Pengelolaan Lingkungan (UKL-UPL)',
        message: 'Tim Uji Kelayakan Lingkungan Hidup meminta revisi uraian sistem pengelolaan limbah cair dan peta sebaran dampak emisi udara sebelum penerbitan rekomendasi PKPLH.',
        timestamp: '2026-09-25 11:20',
        read: false,
        dismissedFromFlash: false,
        actionLabel: 'Revisi & Upload Dokumen Baru',
        actionType: 'REVISE_DOC',
        metadata: {
          revisionTargetDoc: 'Dokumen Teknis Pengelolaan Lingkungan (RKL-RPL)',
          authorityName: 'Dinas Lingkungan Hidup (Amdalnet)',
          kbliCode: '03111',
          folderKey: 'LINGKUNGAN'
        }
      }
    ] as NotificationItem[]
  }),

  getters: {
    notificationsByCompany: (state) => (companyId: string) => {
      return state.notifications
        .filter((n) => n.companyId === companyId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    activeCompanyNotifications(): NotificationItem[] {
      const companyStore = useCompanyStore();
      return this.notificationsByCompany(companyStore.activeCompanyId);
    },

    unreadCount(): number {
      return this.activeCompanyNotifications.filter((n) => !n.read).length;
    },

    activeFlashCards(): NotificationItem[] {
      return this.activeCompanyNotifications
        .filter((n) => !n.dismissedFromFlash)
        .slice(0, 3);
    }
  },

  actions: {
    async init() {
      if (this.isHydrated) return;
      try {
        const stored = await getAppState<NotificationItem[]>('user_notifications');
        if (stored && stored.length > 0) {
          this.notifications = stored.map((n) => {
            if (n.id === 'NOTIF-2026-002' && n.metadata?.paymentStatus !== 'PAID') {
              return {
                ...n,
                message: 'Kementerian ATR/BPN telah menerbitkan Surat Perintah Setor (Kode Billing Simponi: 8202609012399). Sistem OSS tidak memproses pembayaran secara online. Harap lakukan pembayaran melalui teller bank, ATM, atau internet banking persepsi, kemudian unggah bukti pembayaran (bukti setor) untuk melanjutkan proses evaluasi. Berkas bukti pembayaran akan disimpan secara aman di Virtual Filing Cabinet.',
                actionLabel: 'Unggah Bukti Bayar',
                actionType: 'UPLOAD_PAYMENT_PROOF' as const,
                metadata: {
                  ...n.metadata,
                  folderKey: 'PEMBAYARAN'
                }
              };
            }
            return n;
          });
        } else {
          await setAppState('user_notifications', this.notifications);
        }
      } catch (err) {
        console.warn('IDB notification hydration error:', err);
      } finally {
        this.isHydrated = true;
      }
    },

    async persist() {
      try {
        await setAppState('user_notifications', this.notifications);
      } catch (e) {
        // silent
      }
    },

    async addNotification(payload: {
      type: NotificationType;
      title: string;
      message: string;
      actionLabel?: string;
      actionType?: 'VIEW_CREDENTIAL' | 'PAY_PNBP' | 'REVISE_DOC' | 'OPEN_TAB';
      metadata?: Record<string, any>;
      companyId?: string;
    }) {
      const companyStore = useCompanyStore();
      const targetCompany = payload.companyId || companyStore.activeCompanyId;
      const newNotif: NotificationItem = {
        id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        companyId: targetCompany,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        read: false,
        dismissedFromFlash: false,
        actionLabel: payload.actionLabel,
        actionType: payload.actionType,
        metadata: payload.metadata
      };

      this.notifications.unshift(newNotif);
      await this.persist();
      return newNotif;
    },

    async markAsRead(id: string) {
      const item = this.notifications.find((n) => n.id === id);
      if (item) {
        item.read = true;
        await this.persist();
      }
    },

    async markAllAsRead() {
      const companyStore = useCompanyStore();
      for (const n of this.notifications) {
        if (n.companyId === companyStore.activeCompanyId) {
          n.read = true;
        }
      }
      await this.persist();
    },

    async dismissFlash(id: string) {
      const item = this.notifications.find((n) => n.id === id);
      if (item) {
        item.dismissedFromFlash = true;
        await this.persist();
      }
    },

    async dismissAllFlashCards() {
      const companyStore = useCompanyStore();
      for (const n of this.notifications) {
        if (n.companyId === companyStore.activeCompanyId) {
          n.dismissedFromFlash = true;
        }
      }
      await this.persist();
    },

    async removeNotification(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
      await this.persist();
    },

    async uploadPaymentProof(
      notifId: string,
      proofData: {
        fileName: string;
        fileSize?: string;
        bankName?: string;
        ntpn?: string;
        notes?: string;
        vfcDocId?: string;
      }
    ) {
      const notif = this.notifications.find((n) => n.id === notifId);
      if (!notif || !notif.metadata) return;

      notif.metadata.paymentStatus = 'PAID';
      notif.metadata.proofFileName = proofData.fileName;
      if (proofData.bankName) notif.metadata.bankName = proofData.bankName;
      if (proofData.ntpn) notif.metadata.ntpn = proofData.ntpn;
      if (proofData.notes) notif.metadata.paymentNotes = proofData.notes;
      if (proofData.vfcDocId) notif.metadata.vfcDocId = proofData.vfcDocId;
      notif.read = true;
      notif.dismissedFromFlash = true;

      // Create settlement confirmation notification
      await this.addNotification({
        type: 'INFO',
        title: `✅ Bukti Pembayaran Disimpan ke Filing Cabinet: ${notif.metadata.billingCode}`,
        message: `Bukti setoran PNBP/Retribusi untuk kode billing ${notif.metadata.billingCode} (${proofData.fileName}) berhasil diunggah dan disimpan ke Virtual Filing Cabinet (Folder Pembayaran). Berkas telah diteruskan ke instansi verifikator (${notif.metadata.authorityName}) untuk konfirmasi teknis.`,
        actionLabel: 'Buka di Folder VFC',
        actionType: 'OPEN_TAB',
        metadata: {
          folderKey: 'PEMBAYARAN',
          targetTab: 'dashboard'
        }
      });

      await this.persist();
    },

    async payPnbp(notifId: string) {
      const notif = this.notifications.find((n) => n.id === notifId);
      const code = notif?.metadata?.billingCode || '82026';
      await this.uploadPaymentProof(notifId, {
        fileName: `bukti_setor_simponi_${code}.pdf`,
        bankName: 'Bank Mandiri (Kas Negara)',
        ntpn: `NTPN${Date.now().toString().slice(-8)}`
      });
    },

    async submitRevision(notifId: string, revisionNote: string) {
      const notif = this.notifications.find((n) => n.id === notifId);
      if (!notif) return;

      notif.read = true;
      notif.dismissedFromFlash = true;
      if (notif.metadata) {
        notif.metadata.revisionNote = revisionNote;
      }

      await this.addNotification({
        type: 'INFO',
        title: `✅ Berkas Revisi Diterima oleh Instansi Terkait`,
        message: `Perbaikan berkas "${notif.metadata?.revisionTargetDoc || 'Dokumen Teknis'}" berhasil disampaikan. Tim verifikator sedang melakukan pengujian ulang berkas.`,
        actionLabel: 'Pantau di Dashboard',
        actionType: 'OPEN_TAB',
        metadata: {
          targetTab: 'dashboard'
        }
      });

      await this.persist();
    },

    // Simulation Triggers for User Demos
    async simulatePnbpTrigger() {
      const billingCode = `82026${Math.floor(10000000 + Math.random() * 90000000)}`;
      await this.addNotification({
        type: 'PNBP_BILLING',
        title: `Surat Perintah Setor: Tagihan PNBP Simponi (Rp 5.000.000)`,
        message: `Kementerian ATR/BPN menerbitkan Surat Perintah Setor PNBP Simponi dengan kode billing ${billingCode}. Sistem OSS tidak memproses pembayaran secara online. Silakan lakukan pembayaran melalui bank persepsi (teller/ATM/m-banking) dan unggah bukti pembayaran (bukti setor). Berkas bukti pembayaran akan otomatis disimpan pada Virtual Filing Cabinet.`,
        actionLabel: 'Unggah Bukti Bayar',
        actionType: 'UPLOAD_PAYMENT_PROOF',
        metadata: {
          billingCode,
          amount: 5000000,
          paymentStatus: 'UNPAID',
          authorityName: 'Kementerian ATR/BPN',
          folderKey: 'PEMBAYARAN'
        }
      });
    },

    async simulateRevisionTrigger() {
      await this.addNotification({
        type: 'DOCUMENT_REVISION',
        title: `Permintaan Revisi: Gambar Rencana Arsitektur & Struktur (SIMBG)`,
        message: `Dinas Teknis PUPR meminta perbaikan spesifikasi teknis perhitungan pembebanan struktur dan denah proteksi kebakaran gedung operasional.`,
        actionLabel: 'Revisi & Upload Dokumen Baru',
        actionType: 'REVISE_DOC',
        metadata: {
          revisionTargetDoc: 'Gambar Rencana Teknis Gedung & Fire Safety',
          authorityName: 'Dinas PUPR (SIMBG)',
          folderKey: 'PENGAJUAN'
        }
      });
    },

    async simulateCredentialTrigger() {
      const randomId = Math.floor(10000 + Math.random() * 90000);
      await this.addNotification({
        type: 'CREDENTIAL_ISSUED',
        title: `Verifiable Credential Terbit: Verifiable PBG (Bangunan Gedung)`,
        message: `Persetujuan Bangunan Gedung (PBG) resmi telah diterbitkan oleh Kementerian PUPR SIMBG dan disegel sebagai W3C Verifiable Credential.`,
        actionLabel: 'Buka di Folder VFC',
        actionType: 'VIEW_CREDENTIAL',
        metadata: {
          credentialId: `urn:uuid:vc-pbg-2026-${randomId}`,
          credentialType: 'VerifiablePBG',
          authorityName: 'Kementerian PUPR (SIMBG)',
          folderKey: 'CREDENTIALS'
        }
      });
    }
  }
});
