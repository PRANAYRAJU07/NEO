/**
 * ARCHITECTURAL INTEGRATION BOUNDARY: LEASE / AAIC REFERRAL
 *
 * NOTE ON LEASE (Lived Experience & Addiction Support Ecosystem):
 *
 * 1. Independent Scope: NEO is an autonomous, client-side, public educational
 *    prevention experience. It operates strictly without login, accounts, or backend storage.
 * 2. Privacy & Child Safety: Under no circumstances should student selfies, biometric
 *    landmarks, or raw images ever be transferred to LEASE or any external server.
 * 3. Future Referral Safeguards: Any future connection with LEASE must be limited to
 *    an explicitly user-initiated, separately consented referral request (e.g. requesting
 *    an AAIC school workshop or seeking youth support contact), NOT an automatic data pipeline.
 * 4. No Fake Backend: This boundary intentionally does not simulate fake API responses,
 *    fake member records, or credentials.
 */

export interface FutureLeaseReferralPayload {
  // Only non-image, consented contact or workshop inquiry fields
  inquiryType: 'school_workshop' | 'support_information' | 'general_inquiry';
  postcode?: string;
  consentedContactEmail?: string;
  notes?: string;
  // NOTE: Photo, selfie, and facial biometric data are strictly prohibited.
}

export interface LeaseIntegrationStatus {
  isEnabled: boolean;
  status: 'STANDALONE_PUBLIC_PREVENTION' | 'AUTHORIZED_INTEGRATION_PENDING';
  message: string;
  leaseApiEndpoint: null;
}

export const LEASE_BOUNDARY: LeaseIntegrationStatus = {
  isEnabled: false,
  status: 'STANDALONE_PUBLIC_PREVENTION',
  message: 'NEO operates as an independent, no-login educational tool. Student photos remain 100% on-device and are never transmitted to LEASE or external systems.',
  leaseApiEndpoint: null,
};

/**
 * Validates that an inquiry payload contains zero biometric or image data before any future submission.
 */
export function validateLeaseSafeguards(payload: Record<string, unknown>): { safe: boolean; reason?: string } {
  const forbiddenKeys = ['photo', 'image', 'selfie', 'face', 'biometric', 'blob', 'avatar', 'dataUrl'];
  const hasForbiddenKey = Object.keys(payload).some((k) =>
    forbiddenKeys.some((f) => k.toLowerCase().includes(f))
  );

  if (hasForbiddenKey) {
    return {
      safe: false,
      reason: 'Biometric, photo, or facial data is strictly prohibited from external transmission under AAIC child-safety policy.',
    };
  }

  return { safe: true };
}
