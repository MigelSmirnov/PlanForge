const $ = id => document.getElementById(id);
const STORAGE_KEY = 'planforge:synthetic-apartment:v1';
const state = {spec:null, values:{}, selected:null, transform:{x:0,y:0,scale:1}, pointers:new Map(), drag:null};

async function init(){
  state.spec = await fetch('plan-spec.json').then(r=>{if(!r.ok)throw new Error('plan-spec.json not found');return r.json()});
  try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved?.sourceFingerprint===state.spec.source.fingerprint)state.values=saved.values||{}}catch{}
  renderMarkers();bind();fit();update();
}

function valid(value){return /^\d+(?:[.,]\d+)?$/.test(String(value||'').trim())&&Number(String(value).replace(',','.'))>0}
function project(){return {schemaVersion:1,planSpecId:state.spec.id,sourceFingerprint:state.spec.source.fingerprint,values:state.values,updatedAt:new Date().toISOString()}}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(project()));update()}

function renderMarkers(){
  const svg=$('overlay');svg.innerHTML='';
  for(const field of state.spec.fields){
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.classList.add('marker');g.dataset.id=field.id;g.setAttribute('transform',`translate(${field.x} ${field.y})`);
    g.innerHTML='<circle class="hit" r="30"/><rect class="bubble" x="-27" y="-18" width="54" height="36" rx="8"/><text text-anchor="middle" dominant-baseline="central">?</text>';
    g.addEventListener('click',event=>{event.stopPropagation();openField(field.id)});svg.append(g);
  }
}

function update(){
  const done=state.spec.fields.filter(f=>valid(state.values[f.id])).length;$('progress').textContent=`${done} / ${state.spec.fields.length}`;
  for(const g of $('overlay').querySelectorAll('.marker')){
    const value=state.values[g.dataset.id];const text=g.querySelector('text');const shown=valid(value)?String(value):'?';
    text.textContent=shown;g.classList.toggle('completed',valid(value));
    const width=Math.max(54,shown.length*14+22);const rect=g.querySelector('rect');rect.setAttribute('x',-width/2);rect.setAttribute('width',width);
  }
}

function openField(id){
  state.selected=id;const field=state.spec.fields.find(f=>f.id===id);$('fieldTitle').textContent=`${field.id}: ${field.label}`;$('value').value=state.values[id]||'';$('error').textContent='';$('editor').showModal();setTimeout(()=>$('value').focus(),20)
}

function apply(){const t=state.transform;$('stage').style.transform=`translate(${t.x}px,${t.y}px) scale(${t.scale})`}
function fit(){const r=$('viewport').getBoundingClientRect(),s=state.spec.source;state.transform.scale=Math.min(r.width/s.width,r.height/s.height)*.96;state.transform.x=(r.width-s.width*state.transform.scale)/2;state.transform.y=(r.height-s.height*state.transform.scale)/2;apply()}
function zoomAt(clientX,clientY,factor){const r=$('viewport').getBoundingClientRect(),t=state.transform;const sx=clientX-r.left,sy=clientY-r.top,wx=(sx-t.x)/t.scale,wy=(sy-t.y)/t.scale;t.scale=Math.max(.2,Math.min(5,t.scale*factor));t.x=sx-wx*t.scale;t.y=sy-wy*t.scale;apply()}

function bind(){
  $('fit').onclick=fit;window.addEventListener('resize',fit);
  $('editorForm').onsubmit=e=>{e.preventDefault();const value=$('value').value.trim().replace(',','.');if(!valid(value)){$('error').textContent='Введите положительное число.';return}state.values[state.selected]=value;persist();$('editor').close()};
  $('clear').onclick=()=>{delete state.values[state.selected];persist();$('value').value=''};
  $('saveProject').onclick=()=>download('plan-project.json',JSON.stringify(project(),null,2),'application/json');
  $('openProject').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.planSpecId!==state.spec.id||data.sourceFingerprint!==state.spec.source.fingerprint)throw new Error('Этот JSON относится к другому плану.');state.values=data.values||{};persist()}catch(error){alert(error.message)}finally{e.target.value=''}};
  $('exportSvg').onclick=()=>download('completed-plan.svg',buildSvg(),'image/svg+xml');
  const viewport=$('viewport');viewport.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,e.deltaY<0?1.12:.89)},{passive:false});
  viewport.addEventListener('pointerdown',e=>{viewport.setPointerCapture(e.pointerId);state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(state.pointers.size===1)state.drag={x:e.clientX,y:e.clientY,tx:state.transform.x,ty:state.transform.y}});
  viewport.addEventListener('pointermove',e=>{if(!state.pointers.has(e.pointerId))return;const before=[...state.pointers.values()];state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(state.pointers.size===1&&state.drag){state.transform.x=state.drag.tx+e.clientX-state.drag.x;state.transform.y=state.drag.ty+e.clientY-state.drag.y;apply()}else if(state.pointers.size===2){const now=[...state.pointers.values()],oldDistance=Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y),newDistance=Math.hypot(now[0].x-now[1].x,now[0].y-now[1].y);if(oldDistance>0)zoomAt((now[0].x+now[1].x)/2,(now[0].y+now[1].y)/2,newDistance/oldDistance)}});
  const release=e=>{state.pointers.delete(e.pointerId);state.drag=null};viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);
}

function esc(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]))}
function buildSvg(){
  const s=state.spec.source;
  const labels=state.spec.fields.filter(f=>valid(state.values[f.id])).map(f=>{const v=esc(state.values[f.id]),w=Math.max(54,v.length*14+22);return `<g transform="translate(${f.x} ${f.y})"><rect x="${-w/2}" y="-18" width="${w}" height="36" rx="8" fill="#effcf3" stroke="#287a45" stroke-width="3"/><text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#287a45">${v}</text></g>`}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}"><image href="${s.assetPath}" width="${s.width}" height="${s.height}"/>${labels}</svg>`
}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

init().catch(error=>{document.body.innerHTML=`<pre>Ошибка запуска: ${esc(error.message)}</pre>`});