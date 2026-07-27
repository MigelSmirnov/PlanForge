(() => {
  const spec = window.PLAN_SPEC;
  if (!spec) throw new Error('PLAN_SPEC is missing');

  const storageKey = `planforge:${spec.id}`;
  const viewport = document.getElementById('viewport');
  const stage = document.getElementById('stage');
  const image = document.getElementById('planImage');
  const overlay = document.getElementById('overlay');
  const editor = document.getElementById('editor');
  const fieldLabel = document.getElementById('fieldLabel');
  const valueInput = document.getElementById('valueInput');
  const progress = document.getElementById('progress');
  const values = loadValues();

  let selectedId = null;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let drag = null;

  document.getElementById('title').textContent = spec.title;
  image.src = spec.source.assetPath;
  stage.style.width = `${spec.source.width}px`;
  stage.style.height = `${spec.source.height}px`;

  for (const field of spec.fields) {
    const button = document.createElement('button');
    button.className = `field ${field.confidence === 'probable' ? 'probable' : ''}`;
    button.style.left = `${field.x}px`;
    button.style.top = `${field.y}px`;
    button.dataset.id = field.id;
    button.title = field.label || field.id;
    button.addEventListener('click', event => {
      event.stopPropagation();
      openEditor(field.id);
    });
    overlay.appendChild(button);
  }

  function loadValues() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch { return {}; }
  }

  function saveValues() {
    localStorage.setItem(storageKey, JSON.stringify(values));
    render();
  }

  function render() {
    for (const button of overlay.children) {
      const value = values[button.dataset.id] || '';
      button.classList.toggle('filled', Boolean(value));
      button.dataset.value = value;
    }
    const done = spec.fields.filter(field => values[field.id]).length;
    progress.textContent = `${done} / ${spec.fields.length}`;
  }

  function openEditor(id) {
    selectedId = id;
    const field = spec.fields.find(item => item.id === id);
    fieldLabel.textContent = `${field.label || id} (${spec.units || ''})`;
    valueInput.value = values[id] || '';
    editor.showModal();
    setTimeout(() => valueInput.focus(), 0);
  }

  document.getElementById('editorForm').addEventListener('submit', event => {
    if (event.submitter?.value === 'cancel') return;
    const value = valueInput.value.trim();
    if (value) values[selectedId] = value;
    else delete values[selectedId];
    saveValues();
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    delete values[selectedId];
    saveValues();
    editor.close();
  });

  function applyTransform() {
    stage.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
  }

  function fit() {
    const pad = 16;
    scale = Math.min((viewport.clientWidth - pad * 2) / spec.source.width, (viewport.clientHeight - pad * 2) / spec.source.height);
    tx = (viewport.clientWidth - spec.source.width * scale) / 2;
    ty = (viewport.clientHeight - spec.source.height * scale) / 2;
    applyTransform();
  }

  viewport.addEventListener('pointerdown', event => {
    if (event.target.closest('.field')) return;
    viewport.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, tx, ty };
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    tx = drag.tx + event.clientX - drag.x;
    ty = drag.ty + event.clientY - drag.y;
    applyTransform();
  });
  viewport.addEventListener('pointerup', () => { drag = null; });
  viewport.addEventListener('wheel', event => {
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const old = scale;
    scale = Math.max(0.1, Math.min(8, scale * (event.deltaY < 0 ? 1.12 : 0.89)));
    tx = px - (px - tx) * (scale / old);
    ty = py - (py - ty) * (scale / old);
    applyTransform();
  }, { passive: false });

  document.getElementById('fitBtn').addEventListener('click', fit);
  document.getElementById('printBtn').addEventListener('click', printCompletedPlan);
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear all entered values?')) return;
    for (const key of Object.keys(values)) delete values[key];
    saveValues();
  });

  document.getElementById('saveBtn').addEventListener('click', () => download('plan-project.json', JSON.stringify({ schemaVersion: 1, planSpecId: spec.id, values }, null, 2), 'application/json'));
  document.getElementById('loadInput').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const project = JSON.parse(await file.text());
      if (project.planSpecId !== spec.id) throw new Error('This project belongs to another plan');
      for (const key of Object.keys(values)) delete values[key];
      Object.assign(values, project.values || {});
      saveValues();
    } catch (error) { alert(error.message); }
    event.target.value = '';
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    download('completed-plan.svg', buildCompletedSvg(), 'image/svg+xml');
  });

  // Golden export behavior from the proven v3-2 app:
  // each completed value is rendered inside an opaque light panel. The panel
  // deliberately covers a question mark baked into the raster source while
  // preserving the surrounding plan. Do not replace this with bare text.
  function buildCompletedSvg() {
    const labels = spec.fields.filter(field => values[field.id]).map(field => {
      const value = escapeXml(values[field.id]);
      const width = Math.max(48, String(value).length * 13 + 18);
      return `<g data-field-id="${escapeXml(field.id)}" transform="translate(${field.x} ${field.y})"><rect x="${-width / 2}" y="-16" width="${width}" height="32" rx="7" fill="#f4fff8" stroke="#1f7a45" stroke-width="3"/><text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#1f7a45">${value}</text></g>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.source.width}" height="${spec.source.height}" viewBox="0 0 ${spec.source.width} ${spec.source.height}"><image href="${escapeXml(spec.source.assetPath)}" width="${spec.source.width}" height="${spec.source.height}"/>${labels}</svg>`;
  }

  function printCompletedPlan() {
    const popup = window.open('', '_blank');
    if (!popup) {
      alert('Allow pop-ups to print the completed plan.');
      return;
    }
    popup.document.write(`<title>Completed plan</title><style>html,body{margin:0}svg{display:block;width:100%;height:auto}@media print{@page{size:landscape;margin:8mm}}</style>${buildCompletedSvg()}<script>onload=()=>print()<\/script>`);
    popup.document.close();
  }

  function download(name, content, type) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type }));
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
  function escapeXml(value) {
    return String(value).replace(/[<>&'\"]/g, char => ({ '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','\"':'&quot;' }[char]));
  }

  image.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  render();
})();