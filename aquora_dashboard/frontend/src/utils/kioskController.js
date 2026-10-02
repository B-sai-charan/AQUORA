/**
 * Aquora Marine Debris Triage Dashboard - Kiosk Demo Mode Controller
 * Orchestrates a 60-second automated presentation tour across GIS Web map,
 * telemetry layers, monsoon blinding simulation, SAMUDRA advisories, AI Copilot, and report export.
 */

export const KIOSK_TOUR_STEPS = [
  {
    id: 'step-1-init-epicenter',
    duration: 8000,
    title: 'Locking on MSC ELSA 3 Spill Epicenter',
    badge: 'STEP 1/6 • SATELLITE EO',
    description: 'Centering on 13 NM off Kochi, Kerala. Isolating Sentinel-2 multi-spectral hotspot HOTSPOT-ELSA-001 (96.4% polymer concentration).',
    action: (appControls) => {
      appControls.setIsCloudCoverActive(false);
      appControls.setIsSamudraOpen(false);
      appControls.setIsCopilotOpen(false);
      appControls.setActiveForecastHour(0);
      if (appControls.detections?.features) {
        const poly = appControls.detections.features.find(f => f.properties?.hotspot_id === 'HOTSPOT-ELSA-001' && f.geometry.type === 'Polygon');
        if (poly) appControls.setSelectedHotspot(poly.properties);
      }
    }
  },
  {
    id: 'step-2-drift-scrub',
    duration: 10000,
    title: 'Projecting 72h Lagrangian RK4 Drift Trajectory',
    badge: 'STEP 2/6 • HYDRODYNAMICS',
    description: 'Scrubbing forecast timeline along Kerala shelf (158° SSE heading) towards Ashtamudi Estuary (Ramsar #1211) and Gulf of Mannar.',
    action: (appControls) => {
      appControls.setActiveForecastHour(24);
      setTimeout(() => appControls.setActiveForecastHour(48), 3000);
      setTimeout(() => appControls.setActiveForecastHour(72), 6000);
    }
  },
  {
    id: 'step-3-monsoon-blinding',
    duration: 10000,
    title: 'Simulating Monsoon Cloud Cover (Optical Blinded)',
    badge: 'STEP 3/6 • SENSOR ROBUSTNESS',
    description: 'Optical sensors blinded by dense monsoon clouds. Dashboard automatically falls back to INCOIS ROMS ocean current vectors.',
    action: (appControls) => {
      appControls.setIsCloudCoverActive(true);
      appControls.setSelectedHotspot(null);
    }
  },
  {
    id: 'step-4-samudra-advisory',
    duration: 10000,
    title: 'Reviewing SAMUDRA 2.0 Multilingual Alert Matrix',
    badge: 'STEP 4/6 • INTER-AGENCY',
    description: 'Broadcasting regional alerts in Malayalam, Tamil, and English with Coast Guard MRCC containment boom coordinates.',
    action: (appControls) => {
      appControls.setIsSamudraOpen(true);
      appControls.setIsCopilotOpen(false);
    }
  },
  {
    id: 'step-5-ai-copilot',
    duration: 12000,
    title: 'Querying Aquora AI Mission Copilot',
    badge: 'STEP 5/6 • AI REASONING',
    description: 'Engaging real-time Sentinel-2 & INCOIS AI Copilot to analyze 48h landfall vulnerabilities and ESI priority scores.',
    action: (appControls) => {
      appControls.setIsSamudraOpen(false);
      appControls.setIsCopilotOpen(true);
      if (appControls.onTriggerCopilotQuery) {
        appControls.onTriggerCopilotQuery("What is the 48h landfall risk?");
      }
    }
  },
  {
    id: 'step-6-export-report',
    duration: 10000,
    title: 'Compiling & Exporting Official Incident Report (PDF)',
    badge: 'STEP 6/6 • EXECUTIVE EXPORT',
    description: 'Generating official Indian Coast Guard / INCOIS executive situation report formatted for immediate tactical dispatch.',
    action: (appControls) => {
      appControls.setIsCopilotOpen(false);
      appControls.setIsCloudCoverActive(false);
      appControls.handleExportReport();
    }
  }
];

export class KioskTourManager {
  constructor(appControls, onStatusUpdate) {
    this.appControls = appControls;
    this.onStatusUpdate = onStatusUpdate;
    this.isRunning = false;
    this.currentStepIdx = 0;
    this.stepTimeout = null;
    this.progressInterval = null;
    this.elapsedInStep = 0;
  }

  start() {
    this.stop();
    this.isRunning = true;
    this.currentStepIdx = 0;
    this._executeCurrentStep();
  }

  stop() {
    this.isRunning = false;
    if (this.stepTimeout) clearTimeout(this.stepTimeout);
    if (this.progressInterval) clearInterval(this.progressInterval);
    this.stepTimeout = null;
    this.progressInterval = null;
    this.onStatusUpdate({
      isActive: false,
      stepIndex: 0,
      totalSteps: KIOSK_TOUR_STEPS.length,
      step: null,
      progressPct: 0
    });
  }

  _executeCurrentStep() {
    if (!this.isRunning) return;

    if (this.currentStepIdx >= KIOSK_TOUR_STEPS.length) {
      // Tour completed
      this.onStatusUpdate({
        isActive: false,
        isCompleted: true,
        stepIndex: KIOSK_TOUR_STEPS.length,
        totalSteps: KIOSK_TOUR_STEPS.length,
        step: {
          title: 'Kiosk Presentation Tour Completed',
          badge: 'COMPLETE',
          description: 'All 6 tactical presentation modules demonstrated successfully.'
        },
        progressPct: 100
      });
      this.stop();
      return;
    }

    const currentStep = KIOSK_TOUR_STEPS[this.currentStepIdx];
    this.elapsedInStep = 0;

    // Execute step action
    try {
      currentStep.action(this.appControls);
    } catch (err) {
      console.warn(`Error running kiosk step ${currentStep.id}:`, err);
    }

    // Initial step status notification
    this.onStatusUpdate({
      isActive: true,
      stepIndex: this.currentStepIdx + 1,
      totalSteps: KIOSK_TOUR_STEPS.length,
      step: currentStep,
      progressPct: 0
    });

    // Progress tick every 100ms
    if (this.progressInterval) clearInterval(this.progressInterval);
    const intervalMs = 100;
    this.progressInterval = setInterval(() => {
      this.elapsedInStep += intervalMs;
      const progressPct = Math.min(100, (this.elapsedInStep / currentStep.duration) * 100);
      this.onStatusUpdate({
        isActive: true,
        stepIndex: this.currentStepIdx + 1,
        totalSteps: KIOSK_TOUR_STEPS.length,
        step: currentStep,
        progressPct
      });
    }, intervalMs);

    // Schedule next step
    if (this.stepTimeout) clearTimeout(this.stepTimeout);
    this.stepTimeout = setTimeout(() => {
      clearInterval(this.progressInterval);
      this.currentStepIdx += 1;
      this._executeCurrentStep();
    }, currentStep.duration);
  }
}
