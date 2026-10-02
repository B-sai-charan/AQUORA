/**
 * Aquora Marine Debris Triage Dashboard
 * Executive Incident Report Generator (Indian Coast Guard / INCOIS standard)
 * Generates an official, print-ready HTML/PDF-styled executive report.
 */

export function generateExecutiveReportHTML(report) {
  const meta = report.report_metadata || {};
  const coords = report.incident_coordinates || {};
  const tele = report.telemetry_metrics || {};
  const hotspots = report.hotspot_triage_queue || [];
  const drift = report.lagrangian_drift_projection || {};
  const advisories = report.samudra_advisories || {};
  const dispatch = report.inter_agency_action_matrix || {};
  const milestones = drift.drift_milestones || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AQUORA INCIDENT REPORT - ${meta.document_id || 'MSC ELSA 3'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      line-height: 1.5;
      padding: 32px 20px;
    }
    
    .report-container {
      max-width: 960px;
      margin: 0 auto;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    
    .report-header {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%);
      padding: 32px 40px;
      border-bottom: 2px solid #38bdf8;
      position: relative;
    }
    
    .badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .doc-badge {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid #38bdf8;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      letter-spacing: 0.05em;
    }
    
    .status-badge {
      background: #ef4444;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 9999px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    
    .report-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 8px;
    }
    
    .report-sub {
      font-size: 14px;
      color: #bae6fd;
      font-weight: 500;
    }
    
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 24px;
      background: rgba(15, 23, 42, 0.6);
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    
    .meta-item .label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    
    .meta-item .val {
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
    }
    
    .report-body {
      padding: 36px 40px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #334155;
    }
    
    .summary-card {
      background: #0f172a;
      border-left: 4px solid #38bdf8;
      padding: 18px 20px;
      border-radius: 0 12px 12px 0;
      font-size: 14px;
      color: #e2e8f0;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 32px;
    }
    
    .kpi-card {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }
    
    .kpi-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 24px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    
    .kpi-num.critical {
      color: #ef4444;
    }
    
    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-size: 12px;
      background: #0f172a;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #334155;
    }
    
    th {
      background: #1e293b;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid #334155;
    }
    
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #1e293b;
      color: #cbd5e1;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
    
    tr:hover td {
      background: rgba(56, 189, 248, 0.05);
    }
    
    .tier-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      color: #ffffff;
      text-transform: uppercase;
    }
    
    .lang-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 16px;
    }
    
    .lang-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .lang-title {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
    }
    
    .lang-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      padding: 2px 8px;
      background: #334155;
      color: #f1f5f9;
      border-radius: 4px;
    }
    
    .lang-body {
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 8px;
      line-height: 1.6;
    }
    
    .lang-action {
      font-size: 12px;
      font-weight: 600;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #f59e0b;
    }
    
    .directive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 14px;
      margin-bottom: 32px;
    }
    
    .directive-card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px;
    }
    
    .directive-agency {
      font-size: 12px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 6px;
    }
    
    .directive-text {
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    
    .print-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 40px;
      background: #0f172a;
      border-top: 1px solid #334155;
    }
    
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    
    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: 1px solid #38bdf8;
    }
    
    .btn-print:hover {
      background: #0369a1;
    }
    
    .footer-note {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      padding: 20px;
    }

    @media print {
      body {
        background: #ffffff !important;
        color: #0f172a !important;
        padding: 0 !important;
      }
      .report-container {
        border: none !important;
        box-shadow: none !important;
        background: #ffffff !important;
        max-width: 100% !important;
      }
      .print-actions {
        display: none !important;
      }
      .report-header {
        background: #0284c7 !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .kpi-card, .summary-card, .lang-card, .directive-card, table {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
        color: #0f172a !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      th {
        background: #e2e8f0 !important;
        color: #334155 !important;
      }
      td {
        color: #1e293b !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    
    <!-- Header -->
    <div class="report-header">
      <div class="badge-bar">
        <span class="doc-badge">${meta.document_id || 'ICG-INCOIS-REP-2026'}</span>
        <span class="status-badge">${meta.operational_status || 'INCIDENT ACTIVE'}</span>
      </div>
      <h1 class="report-title">${meta.title || 'OPERATIONAL INCIDENT SITUATION & TRIAGE REPORT'}</h1>
      <div class="report-sub">${meta.incident_name || 'MSC ELSA 3 Marine Debris Spill'} • ${coords.location_name || '13 NM Off Kochi, Kerala'}</div>
      
      <div class="meta-grid">
        <div class="meta-item">
          <div class="label">Date & Time (IST)</div>
          <div class="val">${meta.generated_at_ist || new Date().toLocaleString()}</div>
        </div>
        <div class="meta-item">
          <div class="label">Spill Material</div>
          <div class="val">${coords.primary_spill_material || 'PE/PP Polymer Resin Nurdles'}</div>
        </div>
        <div class="meta-item">
          <div class="label">Spill Centroid</div>
          <div class="val">${coords.spill_origin_lat || '9.940'}°N, ${coords.spill_origin_lon || '76.140'}°E</div>
        </div>
        <div class="meta-item">
          <div class="label">Classification</div>
          <div class="val">${meta.security_classification || 'RESTRICTED'}</div>
        </div>
      </div>
    </div>
    
    <!-- Report Body -->
    <div class="report-body">
      
      <!-- Executive Summary -->
      <div class="section-title">1. Executive Situation Summary</div>
      <div class="summary-card">
        ${meta.executive_summary || 'Multi-spectral Sentinel-2 MSI satellite unmixing coupled with INCOIS ROMS Lagrangian hydrodynamic particle drift tracking indicates immediate south-southeast trajectory towards sensitive coastal Ramsar sites and artisanal fisheries.'}
      </div>
      
      <!-- Telemetry KPIs -->
      <div class="section-title">2. Big Data & Sentinel-2 Telemetry Readout</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-num">${tele.total_detected_clusters || hotspots.length}</div>
          <div class="kpi-label">Detected Clusters</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num critical">${tele.critical_tier_1_count || 1}</div>
          <div class="kpi-label">Tier-1 Critical Slicks</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${tele.total_slick_area_hectares || '7.9'} Ha</div>
          <div class="kpi-label">Total Slick Extent</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${tele.average_polymer_concentration_pct || '58.0%'}</div>
          <div class="kpi-label">Mean Concentration</div>
        </div>
      </div>
      
      <!-- Hotspot Triage Queue -->
      <div class="section-title">3. Multi-Spectral Hotspot Triage Matrix [P = C × ESI × (1 - U)]</div>
      <table>
        <thead>
          <tr>
            <th>Hotspot ID</th>
            <th>Centroid</th>
            <th>Conc (C)</th>
            <th>ESI Score</th>
            <th>Priority (P)</th>
            <th>Tier & Action</th>
          </tr>
        </thead>
        <tbody>
          ${hotspots.map(h => `
            <tr>
              <td><strong style="color: #38bdf8; font-family: 'JetBrains Mono', monospace;">${h.hotspot_id}</strong></td>
              <td style="font-family: 'JetBrains Mono', monospace;">[${h.centroid ? h.centroid.join(', ') : 'N/A'}]</td>
              <td><strong>${h.concentration_pct || ((h.concentration || 0) * 100).toFixed(0) + '%'}</strong></td>
              <td><strong style="color: #10b981;">${h.ESI_score}/10</strong></td>
              <td><strong style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: ${h.color_hex || '#38bdf8'};">${(h.priority_score || 0).toFixed(2)}</strong></td>
              <td>
                <span class="tier-badge" style="background-color: ${h.color_hex || '#0284c7'}; margin-bottom: 4px;">${h.priority_tier || 'TIER'}</span>
                <div style="font-size: 11px; color: #cbd5e1;">${h.action_directive || ''}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- Lagrangian Drift Projections -->
      <div class="section-title">4. Lagrangian Hydrodynamic Drift Projections (72h Horizon)</div>
      <div class="summary-card" style="margin-bottom: 16px;">
        <strong>Advection Vector:</strong> ${drift.dominant_advection_heading || '158° SSE (South-Southeast along Kerala shelf)'} &nbsp;|&nbsp; 
        <strong>Net Displacement:</strong> ${drift.net_displacement_km || '132.4'} km &nbsp;|&nbsp; 
        <strong>Hydrodynamic Scheme:</strong> ${drift.integration_scheme || '4th-Order Runge-Kutta (RK4)'}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Milestone</th>
            <th>Coordinates</th>
            <th>Closest Shoreline Target</th>
            <th>Beaching Threat Level</th>
            <th>Local ESI</th>
          </tr>
        </thead>
        <tbody>
          ${milestones.map(m => `
            <tr>
              <td><strong style="color: #38bdf8;">${m.milestone_label || m.milestone || `+${m.time_offset_hours}h`}</strong></td>
              <td style="font-family: 'JetBrains Mono', monospace;">[${m.coordinates ? m.coordinates.map(v => v.toFixed ? v.toFixed(3) : v).join(', ') : 'N/A'}]</td>
              <td>${m.closest_coast || 'Kerala Shelf'}</td>
              <td><strong style="color: ${m.beaching_risk?.toLowerCase().includes('critical') || m.beaching_risk?.toLowerCase().includes('severe') || m.beaching_risk?.toLowerCase().includes('high') ? '#ef4444' : '#f59e0b'};">${m.beaching_risk || 'Moderate'}</strong></td>
              <td><strong style="color: #10b981;">${m.local_ESI_score || '8.5'}/10</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- SAMUDRA 2.0 Multilingual Advisories -->
      <div class="section-title">5. SAMUDRA 2.0 Multilingual Community Advisories</div>
      
      ${advisories.en ? `
        <div class="lang-card">
          <div class="lang-header">
            <span class="lang-title">English Operational Directive</span>
            <span class="lang-badge">EN</span>
          </div>
          <div class="lang-body"><strong>${advisories.en.headline || ''}</strong><br/>${advisories.en.body || ''}</div>
          <div class="lang-action">Directive: ${advisories.en.action_directive || ''}</div>
        </div>
      ` : ''}

      ${advisories.ml ? `
        <div class="lang-card">
          <div class="lang-header">
            <span class="lang-title">മലയാളം (Malayalam Coastal Broadcast)</span>
            <span class="lang-badge">ML</span>
          </div>
          <div class="lang-body"><strong>${advisories.ml.headline || ''}</strong><br/>${advisories.ml.body || ''}</div>
          <div class="lang-action">നിർദ്ദേശം: ${advisories.ml.action_directive || ''}</div>
        </div>
      ` : ''}

      ${advisories.ta ? `
        <div class="lang-card">
          <div class="lang-header">
            <span class="lang-title">தமிழ் (Tamil Gulf of Mannar Broadcast)</span>
            <span class="lang-badge">TA</span>
          </div>
          <div class="lang-body"><strong>${advisories.ta.headline || ''}</strong><br/>${advisories.ta.body || ''}</div>
          <div class="lang-action">வழிகாட்டல்: ${advisories.ta.action_directive || ''}</div>
        </div>
      ` : ''}

      <!-- Inter-Agency Matrix -->
      <div class="section-title" style="margin-top: 32px;">6. Inter-Agency Operational Dispatch Matrix</div>
      <div class="directive-grid">
        ${Object.entries(dispatch).map(([agency, directive]) => `
          <div class="directive-card">
            <div class="directive-agency">${agency.replace(/_/g, ' ')}</div>
            <div class="directive-text">${directive}</div>
          </div>
        `).join('')}
      </div>

    </div>
    
    <!-- Action / Print Bar -->
    <div class="print-actions">
      <button class="btn btn-print" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save Official PDF
      </button>
    </div>
    
    <div class="footer-note">
      Aquora Big Data GIS Platform • Indian Coast Guard MRCC & INCOIS Joint Advisory Cell • Generated Live
    </div>

  </div>
</body>
</html>`;
}

export function downloadReportBlob(reportData, filename = `aquora_incident_report_msc_elsa3_${new Date().toISOString().slice(0, 10)}.html`) {
  const htmlContent = generateExecutiveReportHTML(reportData);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
