// Feature flags for capabilities that depend on external accounts/infrastructure not yet
// provisioned. Flip manually once ready — see backend/.env's TENCENT_PALM_* for the server side.
//
// Real palm-vein/palm-print biometric enrolment & payment (Tencent PalmAI Enterprise KYC),
// replacing the QR-code enrolment mock (KycEnrollScreen) — requires a Tencent tenant/AppId/keys
// (sales-gated, not self-service; see backend/src/services/tencent/). Keep this false until then:
// the QR-code mock stays the active enrolment path so nothing in the app breaks.
export const TENCENT_PALM_ENABLED = false;
