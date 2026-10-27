import { describe, it, expect } from 'vitest';
import { LEASE_BOUNDARY, validateLeaseSafeguards } from '../../services/leaseIntegrationBoundary';

describe('LEASE Architectural Boundary & Child Safety Safeguards', () => {
  it('verifies that LEASE integration is strictly unmounted and disabled in public NEO', () => {
    expect(LEASE_BOUNDARY.isEnabled).toBe(false);
    expect(LEASE_BOUNDARY.leaseApiEndpoint).toBeNull();
    expect(LEASE_BOUNDARY.status).toBe('STANDALONE_PUBLIC_PREVENTION');
  });

  it('rejects any referral payload containing student photos or biometric keys', () => {
    const dangerousPayloadWithPhoto = {
      inquiryType: 'school_workshop',
      studentPhoto: 'data:image/jpeg;base64,...',
    };

    const result = validateLeaseSafeguards(dangerousPayloadWithPhoto);
    expect(result.safe).toBe(false);
    expect(result.reason).toContain('Biometric, photo, or facial data is strictly prohibited');
  });

  it('rejects payloads with selfie or face tags', () => {
    expect(validateLeaseSafeguards({ selfieData: 'xyz' }).safe).toBe(false);
    expect(validateLeaseSafeguards({ faceMesh: 'xyz' }).safe).toBe(false);
  });

  it('allows safe, non-biometric school workshop inquiry payloads', () => {
    const safePayload = {
      inquiryType: 'school_workshop',
      postcode: '4217',
      consentedContactEmail: 'principal@school.edu.au',
      notes: 'Requesting Year 10 presentation',
    };

    const result = validateLeaseSafeguards(safePayload);
    expect(result.safe).toBe(true);
  });
});
