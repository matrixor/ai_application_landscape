(() => {
  const APPS = window.WORKSHOP_APPS || [];
  const APP_BY_ID = Object.fromEntries(APPS.map((app) => [app.id, app]));
  const FAMILY_COLORS = {
    'Fraud & Entity Intelligence': '#2f6df6',
    'Pricing & Portfolio Optimization': '#8a3ffc',
    'Assistants & Document AI': '#119c92'
  };
  const DEFAULT_WEIGHTS = {
    purpose: 0.25,
    capabilities: 0.20,
    features: 0.15,
    tech: 0.30,
    data: 0.10
  };
  const STOPWORDS = new Set([
    'the','and','for','with','from','that','this','into','through','over','across','their','them','will','then','than','using','used','use',
    'onto','while','where','which','what','when','able','such','like','also','very','more','less','same','different','provide','provides',
    'support','supports','help','helps','allow','allows','application','solution','platform','business','global','regional','region','teams','team',
    'project','section','document','architecture','system','data','user','users','process','processes','model','models','service','services'
  ]);

  const STATE = {
    selectedId: APPS[0]?.id || null,
    weights: { ...DEFAULT_WEIGHTS },
    threshold: 0.08,
    layoutKey: 'embedding3d',
    familyFilter: 'All',
    regionFilter: 'All',
    statusFilter: 'All',
    spin: true,
    cameraAngle: 0.35,
    cameraRadius: 2.25,
    spinTimer: null,
    internalRelayout: false
  };

  function titleCase(value) {
    return String(value || '').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function slug(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function tokenize(text) {
    return new Set(
      String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token && token.length > 2 && !STOPWORDS.has(token))
    );
  }

  function listTokenSet(items) {
    const set = new Set();
    (items || []).forEach((item) => {
      tokenize(item).forEach((token) => set.add(token));
    });
    return set;
  }

  function jaccardFromSets(a, b) {
    const union = new Set([...a, ...b]);
    if (!union.size) return 0;
    let inter = 0;
    a.forEach((value) => {
      if (b.has(value)) inter += 1;
    });
    return inter / union.size;
  }

  function sharedFromSets(a, b, limit = 8) {
    const shared = [];
    a.forEach((value) => {
      if (b.has(value)) shared.push(value);
    });
    return shared.sort().slice(0, limit);
  }

  function scoreToPct(score) {
    return `${Math.round(score * 100)}%`;
  }

  APPS.forEach((app) => {
    app._purposeTokens = tokenize(app.business_purpose);
    app._capSet = listTokenSet(app.capabilities);
    app._featureSet = listTokenSet(app.features);
    app._techSet = listTokenSet(app.tech_stack);
    app._dataSet = listTokenSet(app.data_domains);
    app._regionSet = listTokenSet(app.region_scope);
    app._coords = app.coords || {};
  });

  function pairBreakdown(appA, appB) {
    const purpose = jaccardFromSets(appA._purposeTokens, appB._purposeTokens);
    const capabilities = jaccardFromSets(appA._capSet, appB._capSet);
    const features = jaccardFromSets(appA._featureSet, appB._featureSet);
    const tech = jaccardFromSets(appA._techSet, appB._techSet);
    const dataDomains = jaccardFromSets(appA._dataSet, appB._dataSet);
    const classification = appA.data_classification === appB.data_classification ? 1 : 0;
    const region = jaccardFromSets(appA._regionSet, appB._regionSet);
    const data = (0.6 * dataDomains) + (0.2 * classification) + (0.2 * region);
    return {
      purpose,
      capabilities,
      features,
      tech,
      data,
      sharedPurpose: sharedFromSets(appA._purposeTokens, appB._purposeTokens),
      sharedCapabilities: sharedFromSets(appA._capSet, appB._capSet),
      sharedFeatures: sharedFromSets(appA._featureSet, appB._featureSet),
      sharedTech: sharedFromSets(appA._techSet, appB._techSet),
      sharedData: sharedFromSets(appA._dataSet, appB._dataSet)
    };
  }

  function scorePair(appA, appB, weights = STATE.weights) {
    const breakdown = pairBreakdown(appA, appB);
    const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
    const score = (
      (weights.purpose * breakdown.purpose) +
      (weights.capabilities * breakdown.capabilities) +
      (weights.features * breakdown.features) +
      (weights.tech * breakdown.tech) +
      (weights.data * breakdown.data)
    ) / totalWeight;
    breakdown.score = score;
    return breakdown;
  }

  function getVisibleApps() {
    return APPS.filter((app) => {
      if (STATE.familyFilter !== 'All' && app.family !== STATE.familyFilter) return false;
      if (STATE.statusFilter !== 'All' && app.review_status !== STATE.statusFilter) return false;
      if (STATE.regionFilter !== 'All' && !(app.region_scope || []).includes(STATE.regionFilter)) return false;
      return true;
    });
  }

  function getSelectedApp(visibleApps) {
    const app = APP_BY_ID[STATE.selectedId];
    if (app && visibleApps.some((v) => v.id === app.id)) return app;
    return visibleApps[0] || null;
  }

  function getNeighbors(app, population, limit = 4) {
    return population
      .filter((candidate) => candidate.id !== app.id)
      .map((candidate) => ({ app: candidate, ...scorePair(app, candidate) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function getClosestAlternative(app, population = APPS) {
    return getNeighbors(app, population, 1)[0] || null;
  }

  function getRecommendation(app, population = APPS) {
    const nearest = getClosestAlternative(app, population);
    if (!nearest) {
      return {
        label: 'Only item in view',
        className: 'rec-novel',
        reason: 'No other application is available in the current filtered set.',
        nearest,
      };
    }
    if (nearest.score >= 0.15) {
      return {
        label: 'Check for overlap',
        className: 'rec-duplicate',
        reason: 'This application shares enough dimensions with another current app that Alan should explicitly check for reuse, consolidation, or a narrower regional extension.',
        nearest,
      };
    }
    if (nearest.score >= 0.09) {
      return {
        label: 'Shared platform patterns',
        className: 'rec-variant',
        reason: 'There are meaningful shared patterns, especially in the technology stack or operating model, but the business purpose still looks different.',
        nearest,
      };
    }
    return {
      label: 'Distinct pattern',
      className: 'rec-novel',
      reason: 'This application appears materially different from the current real-document set and likely needs an independent review path.',
      nearest,
    };
  }

  function statusClass(status) {
    const value = String(status || '').toLowerCase();
    if (value.includes('approved')) return 'approved';
    if (value.includes('pending')) return 'pending';
    return 'review';
  }

  function sourceClass() {
    return 'real-doc';
  }

  function badgeHtml(text, className) {
    return `<span class="badge ${className}">${text}</span>`;
  }

  function pills(items, flavor = 'pill') {
    if (!items || !items.length) return '<div class="muted">None</div>';
    return `<div class="pills">${items.map((item) => `<span class="${flavor}">${item}</span>`).join('')}</div>`;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function populateFilters() {
    const families = ['All', ...new Set(APPS.map((app) => app.family))];
    const regions = ['All', ...new Set(APPS.flatMap((app) => app.region_scope || []))];
    const statuses = ['All', ...new Set(APPS.map((app) => app.review_status))];

    function fillSelect(id, values) {
      const select = document.getElementById(id);
      select.innerHTML = values.map((value) => `<option value="${value}">${value}</option>`).join('');
    }

    fillSelect('familyFilter', families);
    fillSelect('regionFilter', regions);
    fillSelect('statusFilter', statuses);

    document.getElementById('familyFilter').value = STATE.familyFilter;
    document.getElementById('regionFilter').value = STATE.regionFilter;
    document.getElementById('statusFilter').value = STATE.statusFilter;
    document.getElementById('layoutFilter').value = STATE.layoutKey;
    document.getElementById('thresholdSlider').value = String(Math.round(STATE.threshold * 100));
    document.getElementById('spinToggle').checked = STATE.spin;

    ['purpose', 'capabilities', 'features', 'tech', 'data'].forEach((key) => {
      document.getElementById(`${key}Weight`).value = String(Math.round(STATE.weights[key] * 100));
    });
  }

  function updateWeightLabels() {
    setText('purposeWeightValue', `${document.getElementById('purposeWeight').value}%`);
    setText('capabilitiesWeightValue', `${document.getElementById('capabilitiesWeight').value}%`);
    setText('featuresWeightValue', `${document.getElementById('featuresWeight').value}%`);
    setText('techWeightValue', `${document.getElementById('techWeight').value}%`);
    setText('dataWeightValue', `${document.getElementById('dataWeight').value}%`);
    setText('thresholdValue', `${document.getElementById('thresholdSlider').value}%`);
  }

  function updateStats(visibleApps) {
    const docCount = visibleApps.filter((app) => app.source_type === 'Real SAS document').length;
    const reviewCount = visibleApps.filter((app) => !String(app.review_status).toLowerCase().includes('approved')).length;
    setText('statTotal', String(visibleApps.length));
    setText('statDocs', String(docCount));
    setText('statReview', String(reviewCount));
  }

  function collectEdges(visibleApps, selectedApp) {
    const genericPairs = new Map();
    const highlightedPairs = new Map();

    function addPair(map, a, b, breakdown) {
      const ids = [a.id, b.id].sort();
      const key = ids.join('|');
      const existing = map.get(key);
      if (!existing || existing.breakdown.score < breakdown.score) {
        map.set(key, { a: APP_BY_ID[ids[0]], b: APP_BY_ID[ids[1]], breakdown });
      }
    }

    visibleApps.forEach((app) => {
      const neighbors = getNeighbors(app, visibleApps, 2).filter((item) => item.score >= STATE.threshold);
      neighbors.forEach((item) => addPair(genericPairs, app, item.app, item));
    });

    if (selectedApp) {
      getNeighbors(selectedApp, visibleApps, 3)
        .filter((item) => item.score >= Math.max(STATE.threshold - 0.02, 0.01))
        .forEach((item) => addPair(highlightedPairs, selectedApp, item.app, item));
    }

    return {
      generic: Array.from(genericPairs.values()),
      highlighted: Array.from(highlightedPairs.values())
    };
  }

  function edgeTrace(edgeList, color, width) {
    const x = [];
    const y = [];
    const z = [];
    edgeList.forEach(({ a, b }) => {
      const ac = a._coords[STATE.layoutKey] || a._coords.embedding3d;
      const bc = b._coords[STATE.layoutKey] || b._coords.embedding3d;
      x.push(ac.x, bc.x, null);
      y.push(ac.y, bc.y, null);
      z.push(ac.z, bc.z, null);
    });
    return {
      type: 'scatter3d',
      mode: 'lines',
      x,
      y,
      z,
      hoverinfo: 'skip',
      line: { color, width },
      showlegend: false
    };
  }

  function nodeTrace(visibleApps, selectedApp) {
    return {
      type: 'scatter3d',
      mode: 'markers+text',
      ids: visibleApps.map((app) => app.id),
      x: visibleApps.map((app) => (app._coords[STATE.layoutKey] || app._coords.embedding3d).x),
      y: visibleApps.map((app) => (app._coords[STATE.layoutKey] || app._coords.embedding3d).y),
      z: visibleApps.map((app) => (app._coords[STATE.layoutKey] || app._coords.embedding3d).z),
      text: visibleApps.map((app) => app.short_name),
      textposition: 'top center',
      textfont: { size: 11, color: '#344256' },
      customdata: visibleApps.map((app) => [app.id, app.family, app.review_status, app.document?.title || '', app.document?.issue_date || '']),
      hovertemplate:
        '<b>%{text}</b><br>' +
        '%{customdata[1]}<br>' +
        'Status: %{customdata[2]}<br>' +
        'Doc: %{customdata[3]}<br>' +
        'Issue date: %{customdata[4]}<extra></extra>',
      marker: {
        size: visibleApps.map((app) => {
          const base = 12 + (app.priority || 1);
          return selectedApp && app.id === selectedApp.id ? base + 8 : base;
        }),
        color: visibleApps.map((app) => FAMILY_COLORS[app.family] || '#64748b'),
        opacity: 0.95,
        line: {
          color: 'rgba(255,255,255,0.9)',
          width: 1.5
        }
      },
      showlegend: false
    };
  }

  function resolveClickedAppId(point, graphDiv) {
    if (!point) return null;

    if (
      graphDiv &&
      Number.isInteger(point.curveNumber) &&
      point.curveNumber === graphDiv._nodeTraceIndex &&
      Number.isInteger(point.pointNumber)
    ) {
      const mappedId = graphDiv._nodeIds?.[point.pointNumber];
      if (mappedId && APP_BY_ID[mappedId]) return mappedId;
    }

    if (point.id && APP_BY_ID[point.id]) return point.id;

    if (point.data?.ids && Number.isInteger(point.pointNumber)) {
      const idFromPointData = point.data.ids[point.pointNumber];
      if (idFromPointData && APP_BY_ID[idFromPointData]) return idFromPointData;
    }

    if (graphDiv?.data && Number.isInteger(point.curveNumber) && Number.isInteger(point.pointNumber)) {
      const idFromGraph = graphDiv.data[point.curveNumber]?.ids?.[point.pointNumber];
      if (idFromGraph && APP_BY_ID[idFromGraph]) return idFromGraph;
    }

    if (Array.isArray(point.customdata) && APP_BY_ID[point.customdata[0]]) return point.customdata[0];
    return null;
  }

  function renderPlot(visibleApps, selectedApp) {
    const graphDiv = document.getElementById('graph');
    const edges = collectEdges(visibleApps, selectedApp);
    const traces = [];
    if (edges.generic.length) traces.push(edgeTrace(edges.generic, 'rgba(120,138,160,0.25)', 2));
    if (edges.highlighted.length) traces.push(edgeTrace(edges.highlighted, 'rgba(39,110,241,0.8)', 5));
    const nodeTraceIndex = traces.length;
    traces.push(nodeTrace(visibleApps, selectedApp));

    const layout = {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      scene: {
        bgcolor: 'rgba(0,0,0,0)',
        xaxis: { visible: false, showbackground: false },
        yaxis: { visible: false, showbackground: false },
        zaxis: { visible: false, showbackground: false },
        camera: {
          eye: {
            x: STATE.cameraRadius * Math.cos(STATE.cameraAngle),
            y: STATE.cameraRadius * Math.sin(STATE.cameraAngle),
            z: 0.95 + 0.15 * Math.sin(STATE.cameraAngle / 2)
          }
        }
      }
    };

    Plotly.react(graphDiv, traces, layout, {
      displayModeBar: false,
      responsive: true,
      scrollZoom: true
    });
    graphDiv._nodeTraceIndex = nodeTraceIndex;
    graphDiv._nodeIds = visibleApps.map((app) => app.id);

    if (!graphDiv._workshopBound) {
      graphDiv.on('plotly_click', (event) => {
        const nodePoint = (event.points || []).find((p) => typeof graphDiv._nodeTraceIndex === 'number' ? p.curveNumber === graphDiv._nodeTraceIndex : true);
        const point = nodePoint || (event.points || []).find((p) => !!resolveClickedAppId(p, graphDiv));
        const selectedId = resolveClickedAppId(point, graphDiv);
        if (!selectedId) return;
        STATE.selectedId = selectedId;
        renderAll();
      });
      graphDiv.on('plotly_relayout', () => {
        if (STATE.internalRelayout) return;
        if (STATE.spin) {
          STATE.spin = false;
          document.getElementById('spinToggle').checked = false;
          stopSpin();
        }
      });
      graphDiv._workshopBound = true;
    }
  }

  function scoreRowHtml(label, value) {
    return `
      <div class="score-row">
        <span>${label}</span>
        <div class="bar"><span style="width:${Math.round(value * 100)}%"></span></div>
        <span>${scoreToPct(value)}</span>
      </div>
    `;
  }

  function recommendationHtml(rec) {
    if (!rec) return '';
    const nearest = rec.nearest;
    return `
      <div class="approval-card">
        <div class="badge-row">${badgeHtml(rec.label, rec.className)}</div>
        <div class="headline">${rec.reason}</div>
        ${nearest ? `
          <div class="subline">Closest current application: <strong>${nearest.app.name}</strong> · similarity ${scoreToPct(nearest.score)}</div>
          <div class="score-block">
            ${scoreRowHtml('Purpose', nearest.purpose)}
            ${scoreRowHtml('Capabilities', nearest.capabilities)}
            ${scoreRowHtml('Features', nearest.features)}
            ${scoreRowHtml('Tech stack', nearest.tech)}
            ${scoreRowHtml('Data / security', nearest.data)}
          </div>
        ` : '<div class="subline">No comparable application in the current filtered set.</div>'}
      </div>
    `;
  }

  function documentHtml(app) {
    const doc = app.document || {};
    const docHref = doc.path ? encodeURI(doc.path) : '#';
    return `
      <div class="field-block">
        <div class="section-title"><h3>Source SAS document</h3><span class="small-note">Linked back to the real Word document.</span></div>
        <div class="meta-grid">
          <div class="meta-item"><span class="label">Document title</span><span class="value">${doc.title || app.name}</span></div>
          <div class="meta-item"><span class="label">Filename</span><span class="value"><a href="${docHref}" target="_blank">${doc.filename || 'Open document'}</a></span></div>
          <div class="meta-item"><span class="label">Version / issue date</span><span class="value">${doc.version || '—'} / ${doc.issue_date || '—'}</span></div>
          <div class="meta-item"><span class="label">Document status</span><span class="value">${doc.document_status || '—'}</span></div>
        </div>
      </div>
    `;
  }

  function sourceSectionsHtml(app) {
    const sections = app.source_sections || {};
    const tags = [];
    Object.entries(sections).forEach(([field, values]) => {
      values.forEach((value) => tags.push(`${titleCase(field.replace(/_/g, ' '))}: ${value}`));
    });
    return `
      <div class="field-block">
        <div class="section-title"><h3>SAS traceability</h3><span class="small-note">Sections used to build the normalized profile.</span></div>
        ${pills(tags, 'pill neutral')}
      </div>
    `;
  }

  function sourceExcerptHtml(app) {
    const excerpt = app.source_excerpt || {};
    const cards = [
      ['Background excerpt', excerpt.background],
      ['Objectives excerpt', excerpt.objectives],
      ['Architecture excerpt', excerpt.architecture_layers],
      ['Security excerpt', excerpt.security],
    ].filter(([, value]) => value);

    if (!cards.length) return '';
    return `
      <div class="field-block">
        <div class="section-title"><h3>Source excerpts</h3><span class="small-note">Short snippets extracted from the SAS document.</span></div>
        <div class="excerpt-block">
          ${cards.map(([label, value]) => `
            <div class="excerpt-card">
              <span class="label">${label}</span>
              <span class="value">${value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function neighborCardHtml(item) {
    const sharedBits = [];
    if (item.sharedCapabilities.length) sharedBits.push(`<strong>Shared capability keywords:</strong> ${item.sharedCapabilities.join(', ')}`);
    if (item.sharedTech.length) sharedBits.push(`<strong>Shared stack keywords:</strong> ${item.sharedTech.join(', ')}`);
    if (item.sharedFeatures.length) sharedBits.push(`<strong>Shared feature keywords:</strong> ${item.sharedFeatures.join(', ')}`);
    if (item.sharedData.length) sharedBits.push(`<strong>Shared data keywords:</strong> ${item.sharedData.join(', ')}`);
    if (!sharedBits.length && item.sharedPurpose.length) sharedBits.push(`<strong>Shared purpose keywords:</strong> ${item.sharedPurpose.join(', ')}`);
    return `
      <div class="neighbor-card">
        <div class="neighbor-top">
          <div>
            <div class="neighbor-title"><a href="#" class="app-jump" data-app-id="${item.app.id}">${item.app.name}</a></div>
            <div class="neighbor-subtitle">${item.app.family} · ${item.app.review_status}</div>
          </div>
          <div class="score-pill">${scoreToPct(item.score)}</div>
        </div>
        <div class="shared-list">${sharedBits.join('<br>') || '<strong>Limited direct overlap.</strong> Similarity is mainly driven by broader profile proximity.'}</div>
        <div class="score-block" style="margin-top:10px;">
          ${scoreRowHtml('Purpose', item.purpose)}
          ${scoreRowHtml('Capabilities', item.capabilities)}
          ${scoreRowHtml('Features', item.features)}
          ${scoreRowHtml('Tech stack', item.tech)}
          ${scoreRowHtml('Data / security', item.data)}
        </div>
      </div>
    `;
  }

  function renderDetails(selectedApp, visibleApps) {
    const container = document.getElementById('detailsContent');
    if (!selectedApp) {
      container.innerHTML = '<div class="placeholder">No application is visible with the current filters.</div>';
      return;
    }

    const rec = getRecommendation(selectedApp, visibleApps.length > 1 ? visibleApps : APPS);
    const neighbors = getNeighbors(selectedApp, visibleApps.length > 1 ? visibleApps : APPS, 3);

    container.innerHTML = `
      <div class="app-header">
        <div>
          <div class="badge-row">
            ${badgeHtml(selectedApp.source_type, sourceClass(selectedApp.source_type))}
            ${badgeHtml(selectedApp.review_status, statusClass(selectedApp.review_status))}
            ${badgeHtml(selectedApp.family, 'familytag')}
          </div>
          <h2 style="margin:10px 0 6px;">${selectedApp.name}</h2>
          <div class="small-note">Axes are latent-style 3D coordinates. The real review dimensions extracted from the SAS are listed below.</div>
        </div>
      </div>

      <div class="field-block">
        <div class="section-title"><h3>Dimensions behind this dot</h3><span class="small-note">The normalized review profile built from the SAS.</span></div>
        <p>${selectedApp.business_purpose}</p>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><span class="label">Business unit</span><span class="value">${selectedApp.business_unit}</span></div>
        <div class="meta-item"><span class="label">SI number</span><span class="value">${selectedApp.si_number}</span></div>
        <div class="meta-item"><span class="label">Regions</span><span class="value">${(selectedApp.region_scope || []).join(', ')}</span></div>
        <div class="meta-item"><span class="label">Data classification</span><span class="value">${selectedApp.data_classification}</span></div>
        <div class="meta-item"><span class="label">Deployment regions</span><span class="value">${(selectedApp.deployment_regions || []).join(', ')}</span></div>
        <div class="meta-item"><span class="label">Availability / recovery</span><span class="value">${selectedApp.nfr?.availability || '—'} · RTO ${selectedApp.nfr?.rto_hours ?? '—'}h · RPO ${selectedApp.nfr?.rpo_hours ?? '—'}h</span></div>
      </div>

      <div class="field-block"><h3>Capabilities</h3>${pills(selectedApp.capabilities, 'pill')}</div>
      <div class="field-block"><h3>Features</h3>${pills(selectedApp.features, 'pill alt')}</div>
      <div class="field-block"><h3>Tech stack</h3>${pills(selectedApp.tech_stack, 'pill soft')}</div>
      <div class="field-block"><h3>Data + models</h3>${pills([...(selectedApp.data_domains || []), ...(selectedApp.models || [])], 'pill neutral')}</div>
      <div class="field-block"><h3>Notes</h3><p>${selectedApp.notes || 'No additional notes.'}</p></div>

      ${recommendationHtml(rec)}

      <div class="field-block">
        <div class="section-title"><h3>Closest applications</h3><span class="small-note">Click a neighbor to jump.</span></div>
        ${neighbors.map(neighborCardHtml).join('') || '<div class="placeholder">No comparable applications in the current view.</div>'}
      </div>

      ${documentHtml(selectedApp)}
      ${sourceSectionsHtml(selectedApp)}
      ${sourceExcerptHtml(selectedApp)}
    `;

    container.querySelectorAll('.app-jump').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        STATE.selectedId = link.dataset.appId;
        renderAll();
      });
    });
  }

  function renderQueue(visibleApps) {
    const rows = visibleApps
      .map((app) => ({ app, rec: getRecommendation(app, visibleApps.length > 1 ? visibleApps : APPS) }))
      .sort((a, b) => {
        const scoreA = a.rec.nearest ? a.rec.nearest.score : -1;
        const scoreB = b.rec.nearest ? b.rec.nearest.score : -1;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.app.priority || 0) - (a.app.priority || 0);
      });

    const body = document.getElementById('queueBody');
    if (!rows.length) {
      body.innerHTML = '<div class="queue-row"><div class="queue-cell" style="grid-column:1 / -1;">No review items are visible with the current filters.</div></div>';
      return;
    }

    body.innerHTML = rows.map(({ app, rec }) => {
      const nearest = rec.nearest;
      return `
        <div class="queue-row">
          <div class="queue-cell"><a href="#" class="queue-link" data-app-id="${app.id}">${app.name}</a><span class="queue-sub">${app.family} · ${app.source_type}</span></div>
          <div class="queue-cell">${app.review_status}</div>
          <div class="queue-cell">${nearest ? `<strong>${nearest.app.short_name}</strong><span class="queue-sub">${nearest.app.family}</span>` : '<span class="muted">None in set</span>'}</div>
          <div class="queue-cell">${nearest ? scoreToPct(nearest.score) : '—'}</div>
          <div class="queue-cell">${badgeHtml(rec.label, rec.className)}</div>
        </div>
      `;
    }).join('');

    body.querySelectorAll('.queue-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        STATE.selectedId = link.dataset.appId;
        renderAll();
      });
    });
  }

  function renderLegend() {
    const legend = document.getElementById('familyLegend');
    legend.innerHTML = Object.entries(FAMILY_COLORS)
      .map(([family, color]) => `<div class="legend-item"><span class="legend-dot" style="background:${color}"></span><span>${family}</span></div>`)
      .join('') +
      '<div class="legend-item"><span class="legend-square"></span><span>Selected node is rendered larger</span></div>';
  }

  function readControls() {
    STATE.familyFilter = document.getElementById('familyFilter').value;
    STATE.regionFilter = document.getElementById('regionFilter').value;
    STATE.statusFilter = document.getElementById('statusFilter').value;
    STATE.layoutKey = document.getElementById('layoutFilter').value;
    STATE.threshold = Number(document.getElementById('thresholdSlider').value) / 100;
    STATE.weights.purpose = Number(document.getElementById('purposeWeight').value) / 100;
    STATE.weights.capabilities = Number(document.getElementById('capabilitiesWeight').value) / 100;
    STATE.weights.features = Number(document.getElementById('featuresWeight').value) / 100;
    STATE.weights.tech = Number(document.getElementById('techWeight').value) / 100;
    STATE.weights.data = Number(document.getElementById('dataWeight').value) / 100;
    STATE.spin = document.getElementById('spinToggle').checked;
    updateWeightLabels();
  }

  function renderAll() {
    readControls();
    const visibleApps = getVisibleApps();
    const selectedApp = getSelectedApp(visibleApps);
    STATE.selectedId = selectedApp?.id || null;
    updateStats(visibleApps);
    renderPlot(visibleApps, selectedApp);
    renderDetails(selectedApp, visibleApps);
    renderQueue(visibleApps);
    syncSpin();
  }

  function resetControls() {
    STATE.weights = { ...DEFAULT_WEIGHTS };
    STATE.threshold = 0.08;
    STATE.layoutKey = 'embedding3d';
    STATE.familyFilter = 'All';
    STATE.regionFilter = 'All';
    STATE.statusFilter = 'All';
    STATE.spin = true;
    populateFilters();
    updateWeightLabels();
    renderAll();
  }

  function stopSpin() {
    if (STATE.spinTimer) {
      clearInterval(STATE.spinTimer);
      STATE.spinTimer = null;
    }
  }

  function startSpin() {
    stopSpin();
    const graphDiv = document.getElementById('graph');
    STATE.spinTimer = setInterval(() => {
      if (!STATE.spin || !graphDiv?.data) return;
      STATE.cameraAngle += 0.02;
      STATE.internalRelayout = true;
      Plotly.relayout(graphDiv, {
        'scene.camera.eye': {
          x: STATE.cameraRadius * Math.cos(STATE.cameraAngle),
          y: STATE.cameraRadius * Math.sin(STATE.cameraAngle),
          z: 0.95 + 0.15 * Math.sin(STATE.cameraAngle / 2)
        }
      }).finally(() => {
        STATE.internalRelayout = false;
      });
    }, 120);
  }

  function syncSpin() {
    if (STATE.spin) startSpin();
    else stopSpin();
  }

  function bindEvents() {
    ['familyFilter', 'regionFilter', 'statusFilter', 'layoutFilter', 'thresholdSlider', 'purposeWeight', 'capabilitiesWeight', 'featuresWeight', 'techWeight', 'dataWeight', 'spinToggle']
      .forEach((id) => {
        const el = document.getElementById(id);
        const eventName = el.type === 'range' ? 'input' : 'change';
        el.addEventListener(eventName, () => renderAll());
      });

    document.getElementById('resetBtn').addEventListener('click', resetControls);
  }

  function init() {
    populateFilters();
    updateWeightLabels();
    renderLegend();
    bindEvents();
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
