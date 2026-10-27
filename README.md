# NEO – Face the Future
### Australian Anti Ice Campaign (AAIC) • Youth Prevention Experience

[![Test Suite](https://img.shields.io/badge/tests-35%20passed%20(30%20unit%20%2B%205%20e2e)-emerald)]()
[![Privacy](https://img.shields.io/badge/privacy-100%25%20on--device%20%2F%20zero%20upload-blue)]()
[![PWA](https://img.shields.io/badge/pwa-offline%20ready-sky)]()
[![TypeScript](https://img.shields.io/badge/typescript-strict-indigo)]()

> **"ICE — NOT EVEN ONCE"**  
> **"CHOOSE LIFE SO THAT YOU MAY LIVE"**

---

## 1. Executive Summary & Purpose

**NEO – Face the Future** is a student-focused web application developed for the **Australian Anti Ice Campaign (AAIC)**. Its mission is to educate Australian youth about the physical, mental, and social consequences of crystal methamphetamine (*ice*), while presenting an encouraging alternative: **My Healthy Future**.

### Key Architectural Tenets
1. **100% On-Device Image Processing**: Student selfies never leave the device. Image processing occurs within the browser's local sandbox using Canvas 2D pixel manipulation and client-side ONNX Runtime Web.
2. **Strict Child Safety & Non-Stigmatising Ethics**: Visual simulations avoid sensationalised gore or stigmatisation. All visual effects are clearly labelled as **educational illustrations, NOT predictive medical forecasts**.
3. **No Login / No Tracking**: Students can use the app without an account. There are no advertising trackers, analytics scripts, or cookies.
4. **Independent from LEASE**: LEASE (Lived Experience & Addiction Support Ecosystem) is not integrated. A documented architectural boundary guarantees that no student selfies or biometrics can ever be transmitted to external databases.
5. **Universal Opt-Out**: Students who do not wish to use their own camera or photo can complete the entire experience using diverse illustrative **Demo Avatars**.

---

## 2. Student-Facing Journeys

1. **Welcome Screen (`/`)**: Age-appropriate introduction, campaign slogans, feature overview, ethics statement, and direct link to 24/7 support.
2. **Privacy Notice & Consent (`/consent`)**: Transparent disclosure of on-device processing. Enforces 3 mandatory student confirmations for photo use, or allows one-click **Continue Without Photo**.
3. **Photo Selection & Capture (`/selfie`)**: 
   - Drag-and-drop file upload with validation (JPEG/PNG/WebP, $\le 10\,\text{MB}$, $\ge 180\times 180\,\text{px}$, decode check).
   - Live camera viewfinder with front/back toggle, face silhouette guide, and safe permission handling.
   - Demo avatar gallery for instant opt-out participation.
4. **My Future with Ice (`/future-ice`)**:
   - Simulated timeline stages: Stage 1 (6–12 Months), Stage 2 (2–3 Years), Stage 3 (4+ Years).
   - Fine-tuning intensity slider ($20\%\text{--}100\%$).
   - Dermatologically grounded explanations (vascular strain, loss of hydration, subcutaneous hollows).
5. **My Healthy Future (`/healthy-future`)**:
   - Encouraging visual treatment (warm vitality, clear eyes, healthy skin tone).
   - Protective factors: natural collagen, cognitive clarity, sports/career aspirations, relationships.
6. **Before-and-After Comparison (`/compare`)**:
   - Accessible draggable split slider with keyboard navigation (`ArrowLeft` / `ArrowRight`, `Home`, `End`).
   - Side-by-side mode toggle.
   - Toggle between Baseline vs Ice Toll and Baseline vs Healthy Future.
7. **Get Help Today (`/help`)**:
   - Verified Australian helplines:
     - **Australian Anti Ice Campaign**: `1300 424 238` / [aaic.org.au](https://aaic.org.au)
     - **National Alcohol & Other Drug Hotline**: `1800 250 015` (24/7 free support)
     - **Kids Helpline**: `1800 55 1800` (free, private 24/7 counselling for ages 5–25)
     - **Lifeline Australia**: `13 11 14` (24/7 crisis support)
     - **headspace**: `1800 650 890` (youth mental health)
     - **Emergency Services**: `000` (Triple Zero)
8. **Reset & Memory Purge**:
   - Clears image state, stops camera hardware tracks, revokes all Blob URLs (`URL.revokeObjectURL`), releases canvas contexts, and verifies zero persistence in `localStorage`/`sessionStorage`.

---

## 3. Technology Stack

- **Framework**: React 18 with TypeScript (Strict mode: `noUnusedLocals`, `noUncheckedIndexedAccess`)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (custom AAIC and youth-safe palette)
- **Routing**: React Router 6 (SPA client-side navigation)
- **Inference Runtime**: ONNX Runtime Web (`onnxruntime-web` v1.20) + HTML5 Canvas 2D Procedural Shader Engine
- **Testing**: Vitest, React Testing Library, Playwright E2E
- **Offline / PWA**: `vite-plugin-pwa` with Workbox service worker caching for application shell

---

## 4. Facial Transformation Engine: Technical Feasibility & Provenance Report

### Architecture
The transformation system implements the `ITransformationEngine` interface:
```typescript
export interface ITransformationEngine {
  readonly id: string;
  readonly name: string;
  initialize(): Promise<boolean>;
  transform(imageSource: HTMLImageElement | ImageBitmap, options: TransformationOptions): Promise<TransformationResult>;
  release(): void;
  getInfo(): EngineInfo;
}
```

### Active Engine: On-Device Procedural Canvas Engine
- **Status**: **Active & Fully Operational**
- **Locality**: 100% on-device inside the browser DOM sandbox.
- **Algorithm**:
  - Image downsampling to standard $768\times 768\,\text{px}$ preserving aspect ratio to protect mobile RAM.
  - Raw pixel extraction via `ctx.getImageData()`.
  - **Ice Pathway**: Per-pixel luminance calculation, progressive desaturation ($25\%\text{--}65\%$), sallow chrominance shift (reduction of warm red, increase in cool undertones), localized orbital and cheek fatigue shadowing, and micro-texture high-frequency dehydration simulation.
  - **Healthy Pathway**: Subtle warm vitality curve, catchlight radiance enhancement around the eyes, natural clarity smoothing, and dynamic range boost.
  - Output converted to a Blob URL and registered with `ImageCleanupManager`.

### ONNX Runtime Web Engine & Feasibility Analysis
- **Status**: **Adapter Implemented; Model Weights Pending AAIC Approval**
- **Feasibility Evaluation**:
  1. *Mobile Bandwidth Constraint*: High-parameter generative AI models (Stable Diffusion, StyleGAN, SDXL) require $1\text{--}4\,\text{GB}$ checkpoint downloads, making them impractical for Australian regional students on mobile 4G/5G connections.
  2. *Hardware Constraint*: WebGPU support remains inconsistent across low-end Android mobile devices; WASM SIMD execution of $>100\,\text{M}$ parameter models causes noticeable thermal throttling and tab crashes.
  3. *Child Safety & Provenance*: Generative AI diffusion models can hallucinate unpredictable or stigmatising facial disfigurements. AAIC policy explicitly requires controlled, respectful, youth-safe visualizations.
  4. *Roadmap*: Once AAIC curates a lightweight, fine-tuned UNet/GAN checkpoint ($\le 25\,\text{MB}$) under an approved non-profit redistributable licence, mounting it at `/public/models/face_transform.onnx` enables automatic WebGL/WASM hardware acceleration without any codebase modifications.

---

## 5. LEASE Integration Architectural Boundary

LEASE (Lived Experience & Addiction Support Ecosystem) is an external support platform. **LEASE source code and APIs are not currently available.**

### Safety Boundary Rules:
1. **Standalone Experience**: NEO runs without authentication or backend dependencies.
2. **Zero Biometric Egress**: Biometric landmarks, selfies, and student images are prohibited from being transmitted to LEASE or any remote endpoint.
3. **Explicit Consent for Referrals**: Any future connection with LEASE must be an explicitly user-initiated request for an AAIC school presentation or support consultation, not an automatic background data pipe.
4. **Validation Guard**: `validateLeaseSafeguards()` in `src/services/leaseIntegrationBoundary.ts` automatically rejects any payload containing image, selfie, or biometric keys.

---

## 6. Privacy & Security Audit

| Security Control | Implementation | Verification |
| :--- | :--- | :--- |
| **No Selfie Uploads** | No backend endpoint exists. Outbound network traffic monitored. | Verified by Playwright test `privacySecurity.spec.ts` (0 image requests). |
| **No Persistent Storage** | Images are never written to `localStorage` or `sessionStorage`. | Checked by `imageCleanup.verifyNoPersistentStorage()`. |
| **Camera Cleanup** | Hardware tracks stopped via `track.stop()` on modal dismiss or unmount. | Verified in unit test `imageCleanup.test.ts`. |
| **Content Security Policy** | Strict CSP meta tag configured in `index.html`. | Enforced: `default-src 'self'; img-src 'self' blob: data:`. |
| **No Secrets in Code** | Zero API keys, tokens, or credentials embedded. | Codebase audited. |

---

## 7. Installation, Testing & Build Commands

### Prerequisites
- Node.js $\ge 18.0.0$ (Tested on v22.17.0)
- npm $\ge 9.0.0$

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Unit & Component Tests (Vitest)
```bash
npm test
```
*Executes all 30 unit & component tests across validation, cleanup, engine, and UI.*

### 4. Run End-to-End Tests (Playwright)
```bash
npx playwright test --project=chromium
```
*Executes all 5 end-to-end tests validating the complete student journey, privacy zero-upload guarantee, camera modals, and opt-out paths.*

### 5. Build for Production
```bash
npm run build
```
Generates production assets, optimized JavaScript/CSS bundles, PWA service worker (`dist/sw.js`), and Web App Manifest in `dist/`.

### 6. Preview Production Build
```bash
npm run preview
```

---

## 8. Test Execution Summary

### Vitest Suite (8 files, 30 tests — 100% Passed)
- `src/tests/unit/imageValidation.test.ts`: 5 passed
- `src/tests/unit/imageCleanup.test.ts`: 4 passed
- `src/tests/unit/leaseBoundary.test.ts`: 4 passed
- `src/tests/unit/transformationEngine.test.ts`: 4 passed
- `src/tests/components/Welcome.test.tsx`: 4 passed
- `src/tests/components/Consent.test.tsx`: 3 passed
- `src/tests/components/BeforeAfterSlider.test.tsx`: 3 passed
- `src/tests/components/Help.test.tsx`: 3 passed

### Playwright E2E Suite (2 files, 5 tests — 100% Passed)
- `tests/e2e/privacySecurity.spec.ts`: Zero-Upload Guarantee verified.
- `tests/e2e/studentJourney.spec.ts`:
  - Complete student journey with Demo Avatar: Passed.
  - Photo preview, removal, and reset flow: Passed.
  - Camera capture modal opening & graceful dismissal: Passed.
  - Consent validation gates: Passed.

---

## 9. Deployment Instructions (Static HTTPS Hosting)

NEO is a client-side Single Page Application (SPA). It can be deployed to any static HTTPS host.

### Cloudflare Pages / Vercel / Netlify
1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Node Version**: `18+` or `20+`
4. **SPA Rewrites**: Ensure all routes (`/*`) rewrite to `/index.html`.

### Nginx Configuration Example
```nginx
server {
    listen 443 ssl http2;
    server_name neo.aaic.org.au;

    ssl_certificate /etc/letsencrypt/live/neo.aaic.org.au/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neo.aaic.org.au/privkey.pem;

    root /var/www/neo/dist;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self' blob: data:; object-src 'none';" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static immutable assets
    location ~* \.(?:ico|css|js|gif|jpe?g|png|wasm|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## 10. Outstanding Approvals & Recommendations for AAIC

1. **Medical & Legal Disclaimers**: While educational disclaimers are prominently displayed, formal legal and child-safety sign-off by AAIC's legal counsel is recommended prior to broad school rollouts.
2. **ONNX Model Licensing**: If AAIC commissions a dedicated, fine-tuned neural model for facial age progression, ensure the training dataset is licensed for non-profit youth educational use and compliant with Australian Privacy Principles (APPs).
3. **School Presentation Link**: Coordinate with AAIC booking coordinators to ensure the `1300 424 238` and `aaic.org.au` workshop booking information reflects current regional scheduling.
4. **PWA Offline Distribution**: For remote and regional Australian schools with intermittent internet access, the PWA application shell can be pre-installed on school tablets.
