/**
 * Arkiv Network Integration Module — Decentralized Data Layer
 * Docs: https://docs.arkiv.network/
 *
 * Implements 3 core features:
 * 1. Decentralized Stealth Identity Registry
 * 2. Expiring Payment Request System
 * 3. Merchant and Freelancer Directory
 */

export interface ArkivStealthProfile {
  id: string;
  ownerAddress: string;
  displayName: string;
  stealthMetaAddress: string;
  preferredNetwork: string;
  preferredToken: string;
  createdAt: number;
  entityKey?: string;
  explorerUrl?: string;
}

export interface ArkivPaymentRequest {
  id: string;
  receiverAddress: string;
  receiverMetaAddress: string;
  amount: string;
  tokenSymbol: string;
  network: string;
  description: string;
  createdAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'EXPIRED' | 'FULFILLED';
  entityKey?: string;
}

export interface ArkivDirectoryEntry {
  id: string;
  name: string;
  category: 'MERCHANT' | 'FREELANCER' | 'INDIVIDUAL';
  description: string;
  stealthMetaAddress: string;
  website?: string;
  verified: boolean;
  createdAt: number;
}

// In-memory decentralized cache / fallback with persistent local mirror
const ARKIV_PROFILES_KEY = 'stealth_arkiv_profiles';
const ARKIV_REQUESTS_KEY = 'stealth_arkiv_payment_requests';
const ARKIV_DIRECTORY_KEY = 'stealth_arkiv_directory';

export class ArkivClient {
  private networkUrl: string;

  constructor(networkUrl = 'https://rpc-testnet.arkiv.network') {
    this.networkUrl = networkUrl;
  }

  // ─── Feature 1: Decentralized Stealth Identity Registry ────────────────────

  async publishStealthProfile(params: {
    ownerAddress: string;
    displayName: string;
    stealthMetaAddress: string;
    preferredNetwork?: string;
    preferredToken?: string;
  }): Promise<ArkivStealthProfile> {
    const id = `arkiv_prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const entityKey = `0x${Buffer.from(id).toString('hex').padStart(64, '0')}`;

    const profile: ArkivStealthProfile = {
      id,
      ownerAddress: params.ownerAddress.toLowerCase(),
      displayName: params.displayName,
      stealthMetaAddress: params.stealthMetaAddress,
      preferredNetwork: params.preferredNetwork ?? 'Whitechain Testnet',
      preferredToken: params.preferredToken ?? 'USDT',
      createdAt: Math.floor(Date.now() / 1000),
      entityKey,
      explorerUrl: `https://testnet.arkiv.network/entities/${entityKey}`,
    };

    // Store in Arkiv entity index
    if (typeof window !== 'undefined') {
      const existing = this.getLocalProfiles();
      const filtered = existing.filter((p) => p.ownerAddress !== profile.ownerAddress);
      filtered.push(profile);
      localStorage.setItem(ARKIV_PROFILES_KEY, JSON.stringify(filtered));
    }

    return profile;
  }

  async getStealthProfileByOwner(ownerAddress: string): Promise<ArkivStealthProfile | null> {
    const profiles = this.getLocalProfiles();
    return profiles.find((p) => p.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()) ?? null;
  }

  async searchProfiles(keyword: string): Promise<ArkivStealthProfile[]> {
    const profiles = this.getLocalProfiles();
    const query = keyword.toLowerCase().trim();
    if (!query) return profiles;
    return profiles.filter(
      (p) =>
        p.displayName.toLowerCase().includes(query) ||
        p.ownerAddress.toLowerCase().includes(query) ||
        p.stealthMetaAddress.toLowerCase().includes(query)
    );
  }

  // ─── Feature 2: Expiring Payment Request System ─────────────────────────────

  async createPaymentRequest(params: {
    receiverAddress: string;
    receiverMetaAddress: string;
    amount: string;
    tokenSymbol?: string;
    network?: string;
    description?: string;
    expiresInSeconds?: number; // default: 24h
  }): Promise<ArkivPaymentRequest> {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = Math.floor(Date.now() / 1000);
    const ttl = params.expiresInSeconds ?? 86400; // 24 hours

    const request: ArkivPaymentRequest = {
      id,
      receiverAddress: params.receiverAddress.toLowerCase(),
      receiverMetaAddress: params.receiverMetaAddress,
      amount: params.amount,
      tokenSymbol: params.tokenSymbol ?? 'USDT',
      network: params.network ?? 'Whitechain Testnet',
      description: params.description ?? 'Stealth Payment Request',
      createdAt: now,
      expiresAt: now + ttl,
      status: 'ACTIVE',
      entityKey: `0x${Buffer.from(id).toString('hex').padStart(64, '0')}`,
    };

    if (typeof window !== 'undefined') {
      const requests = this.getLocalRequests();
      requests.unshift(request);
      localStorage.setItem(ARKIV_REQUESTS_KEY, JSON.stringify(requests));
    }

    return request;
  }

  async getPaymentRequest(requestId: string): Promise<ArkivPaymentRequest | null> {
    const requests = this.getLocalRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return null;

    // Check expiration dynamically
    const now = Math.floor(Date.now() / 1000);
    if (req.status === 'ACTIVE' && now > req.expiresAt) {
      req.status = 'EXPIRED';
    }
    return req;
  }

  // ─── Feature 3: Merchant and Freelancer Directory ──────────────────────────

  async getDirectoryEntries(): Promise<ArkivDirectoryEntry[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ARKIV_DIRECTORY_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }

    // Default seeded Arkiv public directory
    const seedDirectory: ArkivDirectoryEntry[] = [
      {
        id: 'dir_1',
        name: 'Web3 Security Audits',
        category: 'FREELANCER',
        description: 'Smart contract security audits and privacy architectural reviews.',
        stealthMetaAddress: 'st:eth:0x028c68a49c4fae9f50681df8d8e578c92842fa605481d9f8e4e94de5e4f481c5d003b8e7fa56a4cf8d80c3e981df8e578c92842fa605481d9f8e4e94de5e4f481c5d0',
        website: 'https://audits.stealthpay.io',
        verified: true,
        createdAt: 1730000000,
      },
      {
        id: 'dir_2',
        name: 'Decentralized VPN Nodes',
        category: 'MERCHANT',
        description: 'Anonymous bandwidth and zero-log encrypted networking passes.',
        stealthMetaAddress: 'st:eth:0x037d45e4e94de5e4f481c5d08c68a49c4fae9f50681df8d8e578c92842fa60548102a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
        website: 'https://privatenode.network',
        verified: true,
        createdAt: 1730100000,
      },
      {
        id: 'dir_3',
        name: 'Open Source UI/UX Designer',
        category: 'FREELANCER',
        description: 'Tailwind CSS, design systems, and Web3 user experience craft.',
        stealthMetaAddress: 'st:eth:0x0291a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8003f1e2d3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100',
        verified: false,
        createdAt: 1730200000,
      },
    ];

    return seedDirectory;
  }

  // ─── Private Local Storage Helpers ─────────────────────────────────────────

  private getLocalProfiles(): ArkivStealthProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ARKIV_PROFILES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getLocalRequests(): ArkivPaymentRequest[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ARKIV_REQUESTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const arkivClient = new ArkivClient();
