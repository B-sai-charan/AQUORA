import { test, expect } from '@playwright/test';

test.describe('Aquora Marine Debris Triage Dashboard — E2E Workflow Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to local Web-GIS dashboard
    await page.goto('/');
    // Wait for initial state to load
    await page.waitForLoadState('networkidle');
  });

  test('Test 1: Dashboard loads, Web-GIS base map renders, and MSC ELSA 3 hotspots populate triage queue', async ({ page }) => {
    // 1. Verify Header and Tactical Branding
    await expect(page.locator('header')).toContainText('AQUORA');
    await expect(page.locator('header')).toContainText('Marine Debris Triage');
    await expect(page.locator('header')).toContainText('MSC ELSA 3');

    // 2. Verify Map Canvas is rendered in the DOM
    const mapContainer = page.locator('.mapboxgl-map, .mapboxgl-canvas-container, canvas');
    await expect(mapContainer.first()).toBeVisible({ timeout: 10000 });

    // 3. Verify CommandHUD Telemetry and Triage Queue
    const hud = page.locator('aside');
    await expect(hud).toBeVisible();
    await expect(hud).toContainText('MSC ELSA 3 Nurdle Spill Triage');
    await expect(hud).toContainText('Detected Hotspots');
    await expect(hud).toContainText('Avg Polymer Conc.');

    // 4. Verify Hotspots in the Priority Queue
    await expect(hud).toContainText('HOTSPOT-ELSA-001');
    await expect(hud).toContainText('HOTSPOT-ELSA-002');
    await expect(hud).toContainText('HOTSPOT-ELSA-003');

    // 5. Verify Priority formula and action directives
    await expect(hud).toContainText('P = C × ESI × (1-U)');
    await expect(hud).toContainText('Immediate Offshore Intercept & Containment');
  });

  test('Test 2: Simulate Monsoon Cloud Cover toggle blinds optical sensors while keeping hydrodynamic drift active', async ({ page }) => {
    const hud = page.locator('aside');

    // 1. Locate and click Monsoon Cloud Cover simulation button
    const monsoonButton = page.getByRole('button', { name: /Simulate Monsoon Cloud Cover/i });
    await expect(monsoonButton).toBeVisible();
    await monsoonButton.click();

    // 2. Assert that satellite sensor status updates to blinded
    await expect(hud).toContainText('SATELLITE BLINDED');
    await expect(hud).toContainText('OPTICAL OFFLINE');
    await expect(hud).toContainText('Optical sensors offline. Falling back to INCOIS ROMS Drift Models');

    // 3. Assert that the top-level monsoon blinding banner is visible on the map
    const blindingBanner = page.locator('text=MONSOON BLINDING ACTIVE');
    await expect(blindingBanner).toBeVisible();

    // 4. Verify that RK4 Drift Paths layer remains active and S-2 is marked (Cloud Blinded)
    await expect(page.locator('text=S-2 Nurdle Hotspots (Cloud Blinded)')).toBeVisible();
    await expect(page.locator('text=RK4 Drift Paths (+72h)')).toBeVisible();
  });

  test('Test 3: Export Report (PDF) triggers official executive incident report generation and download', async ({ page }) => {
    // 1. Locate the Export Report button in CommandHUD or Top Header
    const exportButton = page.getByRole('button', { name: /Export Report \(PDF\)|Export Incident Report/i }).first();
    await expect(exportButton).toBeVisible();

    // 2. Setup download listener and click export
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await exportButton.click();

    // 3. Verify download event resolves with expected HTML report artifact
    const download = await downloadPromise;
    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toMatch(/aquora_incident_report.*\.html$/);

    // 4. Verify button shows successful export state
    await expect(page.locator('text=Exported!').or(page.locator('text=Report Exported!'))).toBeVisible();
  });

  test('Test 4: AI Mission Copilot slide-out drawer opens, streams live telemetry, and responds to natural language tactical queries', async ({ page }) => {
    // 1. Locate and click AI Copilot toggle in the tactical header
    const copilotButton = page.getByRole('button', { name: /AI Copilot/i });
    await expect(copilotButton).toBeVisible();
    await copilotButton.click();

    // 2. Assert Copilot drawer slides into view
    const copilotDrawer = page.locator('text=AQUORA COPILOT').locator('..');
    await expect(copilotDrawer.first()).toBeVisible();
    await expect(page.locator('text=Sentinel-2 & INCOIS AI Reasoning Engine')).toBeVisible();

    // 3. Click a preset tactical quick prompt
    const quickPrompt = page.getByRole('button', { name: /48h Landfall Risk/i }).first();
    await expect(quickPrompt).toBeVisible();
    await quickPrompt.click();

    // 4. Assert that Copilot provides intelligent tactical response
    await expect(page.locator('text=Lagrangian Drift Forecast')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=158° SSE').first()).toBeVisible();
  });

  test('Test 5: Kiosk Presentation Mode toggle starts automated guided tour and displays progress overlay', async ({ page }) => {
    // 1. Locate and click Kiosk Demo button in the top tactical header
    const kioskButton = page.getByRole('button', { name: /Kiosk Demo/i });
    await expect(kioskButton).toBeVisible();
    await kioskButton.click();

    // 2. Assert Kiosk Presentation Mode overlay appears with active step details
    await expect(page.locator('text=KIOSK PRESENTATION MODE')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Locking on MSC ELSA 3 Spill Epicenter')).toBeVisible();

    // 3. Click Stop Tour and assert overlay dismisses cleanly
    const stopButton = page.getByRole('button', { name: /Stop Tour/i }).first();
    await expect(stopButton).toBeVisible();
    await stopButton.click();

    await expect(page.locator('text=KIOSK PRESENTATION MODE')).not.toBeVisible();
  });

});


