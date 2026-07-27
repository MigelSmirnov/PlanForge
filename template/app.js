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
  document.getElementById('printBtn').addEventListener('click', () => window.print());
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
    const labels = spec.fields.filter(field => values[field.id]).map(field => `<text x="${field.x}" y="${field.y}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="22" font-weight="700" fill="#087a55" stroke="white" stroke-width="5" paint-order="stroke">${escapeXml(values[field.id])}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.source.width}" height="${spec.source.height}" viewBox="0 0 ${spec.source.width} ${spec.source.height}"><image href="${spec.source.assetPath}" width="${spec.source.width}" height="${spec.source.height}"/>${labels}</svg>`;
    download('completed-plan.svg', svg, 'image/svg+xml');
  });

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