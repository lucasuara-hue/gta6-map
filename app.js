/* ===========================================================
   Mapa Interativo GTA 6 — Leonida
   Base de tiles + dados: Open GTA 6 Map (fbritoferreira), CC BY 4.0
   =========================================================== */
"use strict";

const TILE_BASE = "https://fbritoferreira.github.io/gta6";
const IMG_BASE  = "https://fbritoferreira.github.io/gta6";
// Tiles existem para unidades de mapa x:160..832, y:160..800. latitude = -y.
const BOUNDS = L.latLngBounds([-800, 160], [-160, 832]);
const START  = [-480, 496];

const LS_KEY_LAYERS = "gta6_layers_on";
const LS_KEY_PINS   = "gta6_my_pins";

/* categorias ligadas por padrão (pra não jogar 3800 pontos de cara) */
const DEFAULT_ON = new Set(["safehouse","bank","gang","meteorite","flamingo","package","mural","treasure"]);

/* ---------- traduções PT-BR ---------- */
const KIND_PT = {
  flamingo:"Flamingos de cocaína", card:"Cartas colecionáveis", waink:"Scans WAiNK",
  magazine:"Revistas, livros e quadrinhos", meditation:"Pontos de meditação",
  underwater:"Descobertas subaquáticas", kenton:"Conjuntos Kenton", playlist:"Playlists únicas",
  hoop:"Cestas de basquete", bret:"Alvos do Bret", stunt:"Manobras e saltos", race:"Corridas",
  drone:"Desafios de drone", range:"Estandes de tiro", arcade:"Fliperama, sinuca e minigolfe",
  gang:"Operações de gangue", bank:"Bancos e cofres", smash:"Assaltos relâmpago",
  store:"Lojas pra assaltar", fence:"Receptadores e Pay 'n' Spray", other:"Outros",
  package:"Pacotes escondidos", meteorite:"Meteoritos", treasure:"Tesouros",
  bottle:"Mensagens na garrafa", bookswap:"Troca de livros", mural:"Murais 1010",
  streetart:"Arte de rua (Ahol)", vehicle:"Veículos de destaque", bridge:"Debaixo da ponte",
  knife:"Saltos de faca", basejump:"Saltos BASE e paraquedas", fishing:"Pontos de pesca",
  hunting:"Caça", event:"Eventos aleatórios", safe:"Cofres",
  towatm:"Caixas eletrônicos rebocáveis", payday:"Agiotas", weapon:"Armas (pegar)",
  safehouse:"Esconderijos", shop:"Lojas e serviços", food:"Comida, bares e baladas",
  hotel:"Hotéis", transport:"Transporte", civic:"Polícia, hospitais e governo",
  leisure:"Lazer e esporte", nature:"Pontos naturais", building:"Prédios e pontos de referência",
};
const TYPE_PT = {
  "Bus stop":"Ponto de ônibus","Under the bridge":"Debaixo da ponte","Random event":"Evento aleatório",
  "Standout vehicle":"Veículo de destaque","ATM":"Caixa eletrônico","Street food":"Comida de rua",
  "Bar":"Bar","Stunt jump":"Salto de manobra","Café and takeout":"Café e lanchonete",
  "Basketball hoop":"Cesta de basquete","Towable ATM":"Caixa eletrônico rebocável",
  "EV charger":"Carregador elétrico","Yellow Loot Box":"Caixa amarela (loot)",
  "Hidden package":"Pacote escondido","Magazine":"Revista","Convenience store":"Loja de conveniência",
  "Clothes shop":"Loja de roupas","Weapon pickup":"Arma (pegar)","Safe":"Cofre",
  "Gas station":"Posto de gasolina","Race":"Corrida","Unique Weapon":"Arma única","Meteorite":"Meteorito",
  "Ahol Street Art":"Arte de rua (Ahol)","Landmark":"Ponto de referência","Drone race":"Corrida de drone",
  "WAiNK curiosity":"Curiosidade WAiNK","Gang operation":"Operação de gangue","Knife flight":"Salto de faca",
  "Fishing spot":"Ponto de pesca","Smash 'n' Grab":"Assalto relâmpago","Food and drink":"Comida e bebida",
  "Station":"Estação","Arcade":"Fliperama","WAiNK landmark":"Marco WAiNK","BASE jump":"Salto BASE",
  "Ammu-Nation":"Ammu-Nation","WAiNK sculpture":"Escultura WAiNK","Bank":"Banco","Pay 'n' Spray":"Pay 'n' Spray",
  "Hair salon":"Salão de cabeleireiro","Fire station":"Corpo de bombeiros","Shoe shop":"Loja de calçados",
  "Collectible card":"Carta colecionável","Pool":"Sinuca","Vehicle request":"Pedido de veículo",
  "Police station":"Delegacia","Marina":"Marina","Electronics":"Eletrônicos","Shooting range":"Estande de tiro",
  "Mod shop":"Oficina de modificação","Garage":"Garagem","Liquor store":"Loja de bebidas","Fence":"Receptador",
  "Tattoo parlour":"Estúdio de tatuagem","Airport":"Aeroporto","Vehicle spawn":"Local de veículo",
  "City / Town":"Cidade / Vila","Meditation spot":"Ponto de meditação","Gym":"Academia",
  "Luxury Watch":"Relógio de luxo","Payday loan":"Agiota","Hotel":"Hotel","Hunting":"Caça",
  "Treasure":"Tesouro","Message in a bottle":"Mensagem na garrafa","Book swap":"Troca de livros",
  "1010 mural":"Mural 1010","Parachuting":"Paraquedismo","Underwater":"Subaquático","Mini golf":"Minigolfe",
};
function ptKind(kind){ return KIND_PT[kind] || (CATS[kind] && CATS[kind].name) || kind; }
function ptType(t){
  if(!t) return "";
  if(TYPE_PT[t]) return TYPE_PT[t];
  if(/ card$/i.test(t)) return "Carta — " + t.replace(/ card$/i,"");
  return t;
}
function ptConf(c){ return ({community:"comunidade", confirmed:"confirmado"})[c] || c || ""; }

/* ---------- pins reais do jogo (icons/pins/<slug>.webp) ---------- */
const PIN_SET = new Set(["ahol-street-art","ammu-nation","arcade","atm","bank","bar","base-jump",
  "basketball","book-swap","bus-stop","car-wash","cinema","clothing","collectible-card",
  "convenience-store","drone-race","electronics","ev-charger","fence","fire-station","fishing",
  "footwear","gang-operation","garage","gas-station","golf","gym","haircut","hidden-package",
  "hospital","hunting","knife-flight","landmark","liquor-store","magazine","marina","message-bottle",
  "meteorite","mini-golf","mural","nightclub","pay-n-spray","payday-loan","playlist","police-station",
  "pool","public-transport","race","random-event","safe","safehouse","shooting-range","smash-n-grab",
  "standout-vehicle","street-food","stunt-jump","tattoo","towable-atm","treasure","under-the-bridge",
  "vehicle-rental","vehicle-request","vehicle-spawn","waink-curiosity","waink-landmark",
  "waink-sculpture","weapon-spawn"]);
/* pin padrão por categoria (quando o tipo não tem pin próprio); null = usa emoji */
const KIND_PIN = {
  card:"collectible-card", magazine:"magazine", playlist:"playlist", hoop:"basketball",
  stunt:"stunt-jump", race:"race", drone:"drone-race", range:"shooting-range", arcade:"arcade",
  gang:"gang-operation", bank:"bank", smash:"smash-n-grab", store:"convenience-store", fence:"fence",
  other:"landmark", package:"hidden-package", meteorite:"meteorite", treasure:"treasure",
  bottle:"message-bottle", bookswap:"book-swap", mural:"mural", streetart:"ahol-street-art",
  vehicle:"standout-vehicle", bridge:"under-the-bridge", knife:"knife-flight", basejump:"base-jump",
  fishing:"fishing", hunting:"hunting", event:"random-event", safe:"safe", towatm:"towable-atm",
  payday:"payday-loan", weapon:"weapon-spawn", safehouse:"safehouse", shop:"convenience-store",
  food:"street-food", transport:"public-transport", civic:"police-station", leisure:"gym",
  building:"landmark", waink:"waink-landmark",
  flamingo:null, meditation:null, underwater:null, kenton:null, bret:null, hotel:null, nature:null,
};
/* overrides por tipo (tipos sem slug direto que têm um pin bom) */
const TYPE_PIN = {
  "Café and takeout":"street-food","Cafe Takeout":"street-food","Food and drink":"bar",
  "Basketball hoop":"basketball","Clothes shop":"clothing","Weapon pickup":"weapon-spawn",
  "Unique Weapon":"weapon-spawn","Fishing spot":"fishing","Station":"public-transport",
  "Hair salon":"haircut","Shoe shop":"footwear","Mod shop":"garage","Tattoo parlour":"tattoo",
  "Airport":"public-transport","Message in a bottle":"message-bottle","1010 mural":"mural",
  "Parachuting":"base-jump","City / Town":"landmark","Helipad":"public-transport",
  "helipad":"public-transport","Ferry":"public-transport","Gang compound":"gang-operation",
  "Unique playlist":"playlist","Comics":"magazine","Comic":"magazine","Car Meet":"standout-vehicle",
  "Yellow Loot Box":"hidden-package","Scoop Container":"hidden-package","Meditation spot":null,
};
function slugify(t){
  return (t||"").toLowerCase().replace(/'/g,"").replace(/&/g,"and")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function pinSlug(e){
  const s = slugify(e.type);
  if (PIN_SET.has(s)) return s;
  if (/\bcard$/i.test(e.type||"")) return "collectible-card";
  if (Object.prototype.hasOwnProperty.call(TYPE_PIN, e.type)) return TYPE_PIN[e.type];
  if (Object.prototype.hasOwnProperty.call(KIND_PIN, e.kind)) return KIND_PIN[e.kind];
  return null;
}
/* fallback quando o pin falha ao carregar */
window.pinErr = function(img, color, emoji){
  const b = document.createElement("b");
  b.className = "gpin-fb"; b.style.background = color; b.textContent = emoji;
  if (img.parentNode) img.parentNode.replaceChild(b, img);
};
function gameIcon(e, cat){
  const slug = pinSlug(e);
  const emoji = (cat && cat.icon) || "📍";
  const color = (cat && cat.colour) || "#9aa0a6";
  if (slug){
    return L.divIcon({
      className: "gpin",
      html: `<img src="${IMG_BASE}/icons/pins/${slug}.webp" alt="" loading="lazy"
              onerror="pinErr(this,'${color}','${emoji}')">`,
      iconSize: [27, 30], iconAnchor: [13.5, 29], popupAnchor: [0, -27],
    });
  }
  return L.divIcon({
    className: "gpin",
    html: `<b class="gpin-fb" style="background:${color}">${emoji}</b>`,
    iconSize: [26, 30], iconAnchor: [13, 29], popupAnchor: [0, -27],
  });
}

/* -------- utilidades de armazenamento -------- */
function lsGet(k, fb){ try{ const v=localStorage.getItem(k); return v==null?fb:JSON.parse(v);}catch(e){return fb;} }
function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

/* -------- coordenadas de jogo -------- */
function gameCoords(lat, lng){
  // inverso de: x=(gx+16384)/32 ; y=(16384-gy)/32  (lat=-y, lng=x)
  const x = lng, y = -lat;
  return { gx: Math.round(x*32 - 16384), gy: Math.round(16384 - y*32) };
}

/* -------- mapa -------- */
const map = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -1, maxZoom: 7, zoomSnap: 0.5,
  preferCanvas: true,
  maxBounds: BOUNDS.pad(0.35),
  zoomControl: false,
  attributionControl: false,
});
map.setView(START, 3);
L.control.zoom({ position: "topright" }).addTo(map);

const canvasRenderer = L.canvas({ padding: 0.5 });

function tileLayer(style){
  return L.tileLayer(`${TILE_BASE}/tiles/${style}/{z}/{z},{y},{x}.webp`, {
    tileSize: 256, minZoom: -1, minNativeZoom: 0, maxNativeZoom: 5,
    noWrap: true, bounds: BOUNDS, keepBuffer: 4,
  });
}
let baseLayer = tileLayer("night").addTo(map);

/* -------- prédios (camada vetorial por cima dos tiles) -------- */
const buildingRenderer = L.canvas({ padding: 0.5 });
let buildingLayer = null;
function isDay(){ return document.getElementById("toggle-day").checked; }
function buildingStyle(day){
  return day
    ? { stroke:true, color:"#8f8699", weight:0.4, fill:true, fillColor:"#b9afc4", fillOpacity:0.92 }
    : { stroke:true, color:"#6f87a6", weight:0.45, fill:true, fillColor:"#475a73", fillOpacity:0.96 };
}
function applyBuildingVisibility(){
  if (!buildingLayer) return;
  const show = map.getZoom() >= 2;
  if (show && !map.hasLayer(buildingLayer)){ buildingLayer.addTo(map); baseLayer.bringToBack(); }
  else if (!show && map.hasLayer(buildingLayer)) map.removeLayer(buildingLayer);
}
fetch("data/surface.json").then(r=>r.json()).then(fc => {
  buildingLayer = L.geoJSON(fc, {
    filter: f => f.properties && f.properties.layer === "building",
    coordsToLatLng: c => L.latLng(-c[1], c[0]),
    renderer: buildingRenderer,
    interactive: false,
    style: () => buildingStyle(isDay()),
  });
  applyBuildingVisibility();
}).catch(err => console.warn("prédios indisponíveis:", err));
map.on("zoomend", applyBuildingVisibility);

document.getElementById("toggle-day").addEventListener("change", (e) => {
  map.removeLayer(baseLayer);
  baseLayer = tileLayer(e.target.checked ? "day" : "night").addTo(map);
  baseLayer.bringToBack();
  if (buildingLayer) buildingLayer.setStyle(buildingStyle(e.target.checked));
});

/* -------- ícones -------- */
function pinIcon(color, emoji, big){
  const size = big ? 30 : 24;
  return L.divIcon({
    className: "",
    html: `<div class="pin ${big?'big':''}" style="width:${size}px;height:${size}px;background:${color}"><span>${emoji||"📍"}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size+2],
  });
}

/* -------- popup -------- */
function popupHTML(e, cat){
  const ico = (cat && cat.icon) || "📍";
  const full = e.screenshot ? `${IMG_BASE}/${e.screenshot}` : "";
  const img = full
    ? `<button class="pop-imgwrap" data-full="${full}" title="Clique para ampliar">
         <img class="pop-img" loading="lazy" src="${full}" alt="" onerror="this.closest('.pop-imgwrap').remove()">
         <span class="pop-zoom">⤢</span>
       </button>` : "";
  const area = e.area ? `<span class="pop-area">${e.area}</span>` : "";
  const type = e.type ? `<div class="pop-type">${ptType(e.type)}</div>` : "";
  const desc = e.description ? `<p class="desc">${e.description}</p>` : "";
  const conf = e.confidence
    ? `<span class="badge conf-${e.confidence}">${ptConf(e.confidence)}</span>` : "";
  const catb = `<span class="badge">${ptKind(e.kind)}</span>`;
  let srcs = "";
  if (Array.isArray(e.source_urls) && e.source_urls.length){
    srcs = `<div class="srcs">` + e.source_urls.map((u,i)=>
      `<a href="${u}" target="_blank" rel="noopener">↗ fonte ${i+1}</a>`).join("") + `</div>`;
  }
  const g = gameCoords(-e.y, e.x);
  return `<div class="pop">${img}<div class="pop-body">
      <h3><span class="pop-ico">${ico}</span>${e.name||"Sem nome"}</h3>
      ${type}${area}${desc}
      <div class="badges">${catb}${conf}</div>${srcs}
      <div class="coordline">mapa ${e.x.toFixed(1)}, ${e.y.toFixed(1)} · jogo ${g.gx}, ${g.gy}</div>
    </div></div>`;
}

/* ===========================================================
   Carregamento dos dados
   =========================================================== */
const groupsOrder = ["Places","Collectibles","Activities","Crime","Other"];
const groupLabel = { Places:"Lugares & História", Collectibles:"Colecionáveis",
  Activities:"Atividades", Crime:"Crime", Other:"Outros" };

let CATS = {};          // key -> {name,colour,icon,group}
const kindLayer = {};   // key -> L.layerGroup
const markerById = {};  // id  -> {marker, kind}
let LOCATIONS = [];

Promise.all([
  fetch("data/categories.json").then(r=>r.json()),
  fetch("data/locations.json").then(r=>r.json()),
]).then(([cats, locs]) => {
  (cats.kinds||[]).forEach(k => { CATS[k.key] = k; });
  LOCATIONS = locs;
  buildLayers(locs);
  buildSidebar(locs);
  buildHighlights();
  restorePins();
}).catch(err => {
  document.getElementById("layers").innerHTML =
    `<p class="loading">Erro ao carregar os dados.<br><small>${err}</small><br><br>
     Abra o site por um servidor local (não por file://).</p>`;
  console.error(err);
});

function catOf(kind){
  return CATS[kind] || { name:kind, colour:"#ffffff", icon:"📍", group:"Other" };
}

function buildLayers(locs){
  const savedOn = lsGet(LS_KEY_LAYERS, null);
  const onSet = savedOn ? new Set(savedOn) : DEFAULT_ON;

  locs.forEach(e => {
    const kind = e.kind || "other";
    if (!kindLayer[kind]) kindLayer[kind] = L.layerGroup();
    const cat = catOf(kind);
    const m = L.marker([-e.y, e.x], { icon: gameIcon(e, cat), riseOnHover: true });
    m.bindPopup(() => popupHTML(e, cat), { maxWidth: 300, minWidth: 268 });
    m.addTo(kindLayer[kind]);
    if (e.id) markerById[e.id] = { marker: m, kind };
  });

  Object.keys(kindLayer).forEach(kind => {
    if (onSet.has(kind)) kindLayer[kind].addTo(map);
  });
}

function saveLayerState(){
  const on = Object.keys(kindLayer).filter(k => map.hasLayer(kindLayer[k]));
  lsSet(LS_KEY_LAYERS, on);
}

/* -------- sidebar de camadas -------- */
function buildSidebar(locs){
  const counts = {};
  locs.forEach(e => { counts[e.kind]=(counts[e.kind]||0)+1; });

  const byGroup = {};
  Object.keys(kindLayer).forEach(kind => {
    const g = catOf(kind).group || "Other";
    (byGroup[g] = byGroup[g] || []).push(kind);
  });

  const host = document.getElementById("layers");
  host.innerHTML = "";

  groupsOrder.forEach(g => {
    const kinds = (byGroup[g]||[]).sort((a,b)=> (counts[b]||0)-(counts[a]||0));
    if (!kinds.length) return;
    const total = kinds.reduce((s,k)=>s+(counts[k]||0),0);

    const wrap = document.createElement("div");
    wrap.className = "grp";
    const head = document.createElement("button");
    head.type = "button"; head.className = "grp-head";
    head.innerHTML = `<span>${groupLabel[g]||g}</span>
        <span class="grp-count">${total}</span><span class="chev">▾</span>`;
    head.addEventListener("click", ()=> wrap.classList.toggle("closed"));
    wrap.appendChild(head);

    const body = document.createElement("div");
    body.className = "grp-body";
    kinds.forEach(kind => {
      const cat = catOf(kind);
      const row = document.createElement("label");
      row.className = "cat"; row.style.setProperty("--chip", cat.colour);
      row.innerHTML =
        `<input type="checkbox" ${map.hasLayer(kindLayer[kind])?"checked":""}>
         <span class="dot" style="background:${cat.colour}"></span>
         <span class="emoji">${cat.icon||"📍"}</span>
         <span class="nm">${ptKind(kind)}</span>
         <span class="ct">${counts[kind]||0}</span>`;
      const cb = row.querySelector("input");
      cb.addEventListener("change", ()=>{
        if (cb.checked) kindLayer[kind].addTo(map); else map.removeLayer(kindLayer[kind]);
        saveLayerState();
      });
      row.dataset.kind = kind;
      body.appendChild(row);
    });
    wrap.appendChild(body);
    host.appendChild(wrap);
  });
}

function setAll(on){
  Object.keys(kindLayer).forEach(kind => {
    if (on) kindLayer[kind].addTo(map); else map.removeLayer(kindLayer[kind]);
  });
  document.querySelectorAll(".cat input").forEach(cb => cb.checked = on);
  saveLayerState();
}
document.getElementById("btn-all-on").addEventListener("click", ()=>setAll(true));
document.getElementById("btn-all-off").addEventListener("click", ()=>setAll(false));

/* ===========================================================
   Destaques (curados em PT-BR)
   =========================================================== */
const HIGHLIGHTS = [
  { name:"Casa da Mandy (missão Pipework)", x:442.6, y:682.3, emoji:"🎬",
    note:"Em Key Lento. Você conhece a Mandy na frente de uma casa amarela, ao lado de um chalé azul — ela está filmando o vizinho escondida." },
  { name:"Casa do Jason", x:438.4, y:684.9, emoji:"🏠",
    note:"A casa palafita do Jason em Key Lento, emprestada pelo Brian. Primeiro esconderijo do Jason e da Lucia (Capítulo 1)." },
  { name:"Key Lento", x:437, y:700.4, emoji:"🌴",
    note:"Cidade nas Leonida Keys, provavelmente inspirada em Key Largo. Onde fica a casa do Jason." },
  { name:"Megamundo Building", x:497.3, y:521.3, emoji:"🏢",
    note:"Arranha-céu no centro de Vice City, sede da rede de TV Megamundo (inspirado no One Biscayne Tower de Miami)." },
  { name:"Leonida Penitentiary", x:428.3, y:604.2, emoji:"⛓️",
    note:"A prisão onde a Lucia cumpriu pena antes do início da história." },
];
let highlightLayer;
function buildHighlights(){
  highlightLayer = L.layerGroup();
  HIGHLIGHTS.forEach(h => {
    const m = L.marker([-h.y, h.x], { icon: pinIcon("#2dd4bf", h.emoji, true), zIndexOffset: 1000 });
    const g = gameCoords(-h.y, h.x);
    m.bindPopup(`<div class="pop"><div class="pop-body">
        <h3><span class="pop-ico">${h.emoji}</span>${h.name}</h3>
        <div class="pop-type">⭐ Destaque</div>
        <p class="desc">${h.note}</p>
        <div class="coordline">mapa ${h.x}, ${h.y} · jogo ${g.gx}, ${g.gy}</div>
      </div></div>`, { minWidth: 268 });
    m.addTo(highlightLayer);
  });
  highlightLayer.addTo(map);
}

/* ===========================================================
   Busca
   =========================================================== */
const searchInput = document.getElementById("search");
const searchResults = document.getElementById("search-results");

function runSearch(q){
  q = q.trim().toLowerCase();
  if (q.length < 2){ searchResults.classList.remove("open"); searchResults.innerHTML=""; return; }
  const hits = [];
  for (const e of LOCATIONS){
    if ((e.name||"").toLowerCase().includes(q) ||
        (e.type||"").toLowerCase().includes(q) ||
        (e.area||"").toLowerCase().includes(q)){
      hits.push(e); if (hits.length >= 14) break;
    }
  }
  if (!hits.length){ searchResults.innerHTML = `<li class="sr-none">Nada encontrado</li>`; searchResults.classList.add("open"); return; }
  searchResults.innerHTML = hits.map(e => {
    const c = catOf(e.kind);
    return `<li data-id="${e.id}"><span class="sr-ico">${c.icon||"📍"}</span>
      <span><div>${e.name}</div><div class="sr-sub">${ptKind(e.kind)}${e.area?" · "+e.area:""}</div></span></li>`;
  }).join("");
  searchResults.classList.add("open");
  searchResults.querySelectorAll("li[data-id]").forEach(li => {
    li.addEventListener("click", ()=> gotoLocation(li.dataset.id));
  });
}
function gotoLocation(id){
  const ref = markerById[id];
  if (!ref) return;
  if (!map.hasLayer(kindLayer[ref.kind])){
    kindLayer[ref.kind].addTo(map);
    const cb = document.querySelector(`.cat[data-kind="${ref.kind}"] input`);
    if (cb) cb.checked = true;
    saveLayerState();
  }
  const ll = ref.marker.getLatLng();
  map.flyTo(ll, 6, { duration: .6 });
  setTimeout(()=> ref.marker.openPopup(), 650);
  searchResults.classList.remove("open");
  if (window.innerWidth <= 720) document.getElementById("app").classList.add("collapsed");
}
let searchT;
searchInput.addEventListener("input", ()=>{ clearTimeout(searchT); searchT=setTimeout(()=>runSearch(searchInput.value), 140); });
document.addEventListener("click", (e)=>{ if(!e.target.closest(".searchbox")) searchResults.classList.remove("open"); });

/* ===========================================================
   Pinos pessoais
   =========================================================== */
let addMode = false;
const myPinsLayer = L.layerGroup().addTo(map);
const addBtn = document.getElementById("btn-addpin");

addBtn.addEventListener("click", ()=>{
  addMode = !addMode;
  addBtn.setAttribute("aria-pressed", String(addMode));
  addBtn.textContent = addMode ? "Clique no mapa…" : "+ Meu pino";
  map.getContainer().style.cursor = addMode ? "crosshair" : "";
});

map.on("click", (ev)=>{
  if (!addMode) return;
  const name = prompt("Nome do seu pino:", "Meu ponto");
  if (name !== null){
    const p = { id:"my-"+Date.now(), name:name||"Meu ponto", lat:ev.latlng.lat, lng:ev.latlng.lng };
    addMyPin(p); const all = lsGet(LS_KEY_PINS, []); all.push(p); lsSet(LS_KEY_PINS, all);
  }
  addMode = false; addBtn.setAttribute("aria-pressed","false");
  addBtn.textContent = "+ Meu pino"; map.getContainer().style.cursor = "";
});

function addMyPin(p){
  const g = gameCoords(p.lat, p.lng);
  const m = L.marker([p.lat, p.lng], { icon: pinIcon("#ff5c8a", "📌", true), zIndexOffset: 2000 });
  m.bindPopup(`<div class="pop"><div class="pop-body">
      <h3><span class="pop-ico">📌</span>${p.name}</h3>
      <div class="pop-type">Meu pino</div>
      <div class="coordline">mapa ${p.lng.toFixed(1)}, ${(-p.lat).toFixed(1)} · jogo ${g.gx}, ${g.gy}</div>
      <div class="srcs"><a href="#" data-del="${p.id}">🗑 remover</a></div>
    </div></div>`, { minWidth: 268 });
  m.on("popupopen", (e)=>{
    const del = e.popup.getElement().querySelector("[data-del]");
    if (del) del.addEventListener("click", (ev)=>{ ev.preventDefault(); removeMyPin(p.id, m); });
  });
  m.addTo(myPinsLayer);
}
function removeMyPin(id, marker){
  myPinsLayer.removeLayer(marker);
  lsSet(LS_KEY_PINS, lsGet(LS_KEY_PINS, []).filter(x=>x.id!==id));
}
function restorePins(){ lsGet(LS_KEY_PINS, []).forEach(addMyPin); }

/* ===========================================================
   UI diversos
   =========================================================== */
document.getElementById("sidebar-toggle").addEventListener("click", ()=>{
  document.getElementById("app").classList.toggle("collapsed");
  setTimeout(()=> map.invalidateSize(), 260);
});
const coordsEl = document.getElementById("coords");
map.on("mousemove", (e)=>{
  const g = gameCoords(e.latlng.lat, e.latlng.lng);
  coordsEl.textContent = `jogo  x:${g.gx}  y:${g.gy}`;
});

/* -------- lightbox (ampliar imagem) -------- */
const lightbox = document.createElement("div");
lightbox.id = "lightbox"; lightbox.hidden = true;
lightbox.innerHTML = `<img alt=""><button class="lb-close" aria-label="Fechar">✕</button>`;
document.body.appendChild(lightbox);
function closeLightbox(){ lightbox.hidden = true; lightbox.querySelector("img").src = ""; }
lightbox.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeLightbox(); });
document.addEventListener("click", (e)=>{
  const w = e.target.closest(".pop-imgwrap");
  if (!w) return;
  e.preventDefault();
  lightbox.querySelector("img").src = w.dataset.full;
  lightbox.hidden = false;
});
