import { defineStore } from 'pinia';
import { useCompanyStore } from './companyStore';
import { useNotificationStore } from './notificationStore';
import { getAppState, setAppState } from '../utils/idbStorage';

export type CredentialCategory =
  | 'KKPR'
  | 'LINGKUNGAN'
  | 'PBG_SLF'
  | 'NIB'
  | 'SERTIFIKAT_STANDAR'
  | 'PB_UMKU';

export interface PersyaratanDasarCredential {
  id: string;
  companyId: string;
  category: CredentialCategory;
  title: string;
  kbliCode: string;
  kbliTitle: string;
  credentialType: string;
  issuerDid: string;
  issuerName: string;
  issuedAt: string;
  proofHash: string;
  qrCodeData: string;
  status: 'ACTIVE' | 'REVOKED';
  claims: Record<string, any>;
}

export const useCredentialStore = defineStore('credentialStore', {
  state: () => ({
    isHydrated: false,
    credentials: [
      {
        id: 'urn:uuid:vc-kkpr-2026-01285-8812',
        companyId: 'COMP-001',
        category: 'KKPR' as CredentialCategory,
        title: 'Verifiable Konfirmasi KKPR (Tata Ruang Darat)',
        kbliCode: '01285',
        kbliTitle: 'Penanaman dan Pasca Panen Minyak Atsiri',
        credentialType: 'VerifiableKKPR',
        issuerDid: 'did:oss:atr-bpn:gov:id',
        issuerName: 'Kementerian ATR/BPN Republik Indonesia',
        issuedAt: '2026-09-27 01:15',
        proofHash: '4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        qrCodeData: 'https://oss.go.id/verify-vc/urn:uuid:vc-kkpr-2026-01285-8812',
        status: 'ACTIVE' as const,
        claims: {
          nomor_kkpr: '056000000002-KKPR-2026',
          zona_ruang: 'Kawasan Industri Sentul Sentra',
          status_rdtr: 'SESUAI (Zonasi Industri Non-Polutan)',
          luas_tanah_m2: 2500,
          koefisien_dasar_bangunan: '60%',
          koefisien_lantai_bangunan: '2.4',
          garis_sempadan_bangunan: '8 meter',
          status_lahan: 'HGB Terdaftar Kantah Kab. Bogor'
        }
      },
      {
        id: 'urn:uuid:vc-env-2026-01285-3391',
        companyId: 'COMP-001',
        category: 'LINGKUNGAN' as CredentialCategory,
        title: 'Verifiable SPPL (Pernyataan Pengelolaan Lingkungan Hidup)',
        kbliCode: '01285',
        kbliTitle: 'Penanaman dan Pasca Panen Minyak Atsiri',
        credentialType: 'VerifiableSPPL',
        issuerDid: 'did:oss:klhk:gov:id',
        issuerName: 'Kementerian Lingkungan Hidup dan Kehutanan',
        issuedAt: '2026-09-27 01:20',
        proofHash: '8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
        qrCodeData: 'https://oss.go.id/verify-vc/urn:uuid:vc-env-2026-01285-3391',
        status: 'ACTIVE' as const,
        claims: {
          nomor_surat: '029000000010-SPPL-2026',
          jenis_dokumen: 'SPPL Otomatis (Penapisan PP 28/2025)',
          komitmen: 'Pengelolaan limbah biomassa & baku mutu air buangan',
          kapasitas_olah: '500 kg/hari distilasi',
          status_verifikasi: 'Mandiri Terverifikasi DLH'
        }
      },
      {
        id: 'urn:uuid:vc-pbg-2026-01285-7140',
        companyId: 'COMP-001',
        category: 'PBG_SLF' as CredentialCategory,
        title: 'Verifiable PBG (Persetujuan Bangunan Gedung Sentra)',
        kbliCode: '01285',
        kbliTitle: 'Penanaman dan Pasca Panen Minyak Atsiri',
        credentialType: 'VerifiablePBG',
        issuerDid: 'did:oss:pupr:gov:id',
        issuerName: 'Kementerian PUPR (SIMBG)',
        issuedAt: '2026-09-27 01:25',
        proofHash: '1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
        qrCodeData: 'https://oss.go.id/verify-vc/urn:uuid:vc-pbg-2026-01285-7140',
        status: 'ACTIVE' as const,
        claims: {
          nomor_pbg: '033000000001-PBG-2026',
          nama_bangunan: 'Gedung Sentra Operasional & Pengeringan',
          fungsi_bangunan: 'Industri & Pengolahan Hasil Panen',
          luas_lantai_m2: 1500,
          jumlah_lantai: 2,
          tinggi_bangunan_m: 9.5,
          status_kelaikan: 'Rancang Bangun Memenuhi Standar PUPR'
        }
      }
    ] as PersyaratanDasarCredential[]
  }),

  getters: {
    credentialsByCompany: (state) => (companyId: string) => {
      return state.credentials
        .filter((c) => c.companyId === companyId)
        .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    },

    activeCompanyCredentials(): PersyaratanDasarCredential[] {
      const companyStore = useCompanyStore();
      return this.credentialsByCompany(companyStore.activeCompanyId);
    }
  },

  actions: {
    async init() {
      if (this.isHydrated) return;
      try {
        const stored = await getAppState<PersyaratanDasarCredential[]>('verifiable_credentials');
        if (stored && stored.length > 0) {
          this.credentials = stored;
        } else {
          await setAppState('verifiable_credentials', this.credentials);
        }
      } catch (err) {
        console.warn('IDB credential hydration error:', err);
      } finally {
        this.isHydrated = true;
      }
    },

    async persist() {
      try {
        await setAppState('verifiable_credentials', this.credentials);
      } catch (e) {
        // silent
      }
    },

    async issueCredential(payload: {
      category: CredentialCategory;
      title: string;
      kbliCode: string;
      kbliTitle: string;
      credentialType: string;
      issuerDid: string;
      issuerName: string;
      claims: Record<string, any>;
      companyId?: string;
    }): Promise<PersyaratanDasarCredential> {
      const companyStore = useCompanyStore();
      const notificationStore = useNotificationStore();
      const targetCompany = payload.companyId || companyStore.activeCompanyId;

      const randomDigest = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const vcId = `urn:uuid:vc-${payload.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-2026-${payload.kbliCode}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Check if credential already issued for this company & category & kbli
      const existingIdx = this.credentials.findIndex(
        (c) =>
          c.companyId === targetCompany &&
          c.category === payload.category &&
          c.kbliCode === payload.kbliCode
      );

      const newCred: PersyaratanDasarCredential = {
        id: vcId,
        companyId: targetCompany,
        category: payload.category,
        title: payload.title,
        kbliCode: payload.kbliCode,
        kbliTitle: payload.kbliTitle,
        credentialType: payload.credentialType,
        issuerDid: payload.issuerDid,
        issuerName: payload.issuerName,
        issuedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        proofHash: randomDigest,
        qrCodeData: `https://oss.go.id/verify-vc/${vcId}`,
        status: 'ACTIVE',
        claims: payload.claims
      };

      if (existingIdx >= 0) {
        this.credentials[existingIdx] = newCred;
      } else {
        this.credentials.unshift(newCred);
      }

      await this.persist();

      // Dispatch notification & Flash card
      await notificationStore.addNotification({
        companyId: targetCompany,
        type: 'CREDENTIAL_ISSUED',
        title: `Verifiable Credential Terbit: ${payload.credentialType}`,
        message: `${payload.title} untuk KBLI ${payload.kbliCode} telah lolos validasi Persyaratan Dasar dan disegel ke dalam Virtual Filing Cabinet Anda.`,
        actionLabel: 'Buka di Folder VFC',
        actionType: 'VIEW_CREDENTIAL',
        metadata: {
          credentialId: vcId,
          credentialType: payload.credentialType,
          authorityName: payload.issuerName,
          kbliCode: payload.kbliCode,
          folderKey: 'CREDENTIALS'
        }
      });

      return newCred;
    },

    async revokeCredential(id: string) {
      const cred = this.credentials.find((c) => c.id === id);
      if (cred) {
        cred.status = 'REVOKED';
        await this.persist();
      }
    }
  }
});
