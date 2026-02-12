import L from 'leaflet';
import { CONFLICTS, CONFLICT_TYPES, INTENSITY_LEVELS } from './conflicts.js';
import { NEWS_ARTICLES } from './news.js';

// ── State ──
let map;
let markers = [];
let activeFilters = new Set();
let activeIntensities = new Set();
let selectedConflict = null;

// ── Map initialization ──
function initMap() {
  map = L.map('map', {
    center: [20, 15],
    zoom: 3,
    minZoom: 2,
    maxZoom: 18,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  // High-detail OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Additional detail layer for terrain
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17,
    opacity: 0,
    className: 'topo-layer',
  });
}

// ── Marker creation ──
function createConflictMarker(conflict) {
  const type = Object.values(CONFLICT_TYPES).find(t => t.id === conflict.type);
  const intensity = INTENSITY_LEVELS[conflict.intensity.toUpperCase()];

  const markerColor = type ? type.color : '#95a5a6';
  const radius = intensity ? intensity.radius : 12;

  // Pulsing marker
  const pulseClass = conflict.intensity === 'high' ? 'pulse-high' : conflict.intensity === 'medium' ? 'pulse-medium' : 'pulse-low';

  const icon = L.divIcon({
    className: `conflict-marker ${pulseClass}`,
    html: `
      <div class="marker-outer" style="background:${markerColor}; width:${radius * 2}px; height:${radius * 2}px;">
        <div class="marker-inner" style="background:${markerColor};"></div>
        <div class="marker-pulse" style="border-color:${markerColor};"></div>
      </div>
    `,
    iconSize: [radius * 2, radius * 2],
    iconAnchor: [radius, radius],
  });

  const marker = L.marker([conflict.lat, conflict.lng], { icon });

  // Tooltip
  marker.bindTooltip(
    `<strong>${conflict.name}</strong><br>${conflict.country}<br><em>${type ? type.label : conflict.type}</em>`,
    { direction: 'top', offset: [0, -radius], className: 'conflict-tooltip' }
  );

  // Click handler
  marker.on('click', () => {
    selectConflict(conflict);
  });

  marker.conflictData = conflict;
  return marker;
}

// ── Render markers on map ──
function renderMarkers() {
  // Clear existing markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const filtered = CONFLICTS.filter(conflict => {
    const typeMatch = activeFilters.size === 0 || activeFilters.has(conflict.type);
    const intensityMatch = activeIntensities.size === 0 || activeIntensities.has(conflict.intensity);
    return typeMatch && intensityMatch;
  });

  filtered.forEach(conflict => {
    const marker = createConflictMarker(conflict);
    marker.addTo(map);
    markers.push(marker);
  });

  updateStats(filtered.length);
}

// ── Conflict selection ──
function selectConflict(conflict) {
  selectedConflict = conflict;
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('sidebar-closed');
  sidebar.classList.add('sidebar-open');

  const type = Object.values(CONFLICT_TYPES).find(t => t.id === conflict.type);
  const intensity = INTENSITY_LEVELS[conflict.intensity.toUpperCase()];

  // Title
  document.getElementById('sidebar-title').textContent = conflict.name;

  // Conflict details
  const detailsEl = document.getElementById('conflict-details');
  detailsEl.innerHTML = `
    <div class="conflict-meta">
      <span class="badge" style="background:${type ? type.color : '#95a5a6'}">${type ? type.label : conflict.type}</span>
      <span class="badge intensity-badge" style="background:${intensity ? intensity.color : '#95a5a6'}">Intensite : ${intensity ? intensity.label : conflict.intensity}</span>
    </div>
    <div class="conflict-info">
      <div class="info-row">
        <span class="info-label">Pays / Region</span>
        <span class="info-value">${conflict.country} — ${conflict.region}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Debut du conflit</span>
        <span class="info-value">${formatDate(conflict.startDate)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Parties impliquees</span>
        <span class="info-value">${conflict.parties.join(' vs ')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Victimes</span>
        <span class="info-value">${conflict.casualties}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Deplaces</span>
        <span class="info-value">${conflict.displaced}</span>
      </div>
    </div>
    <div class="conflict-description">
      <p>${conflict.description}</p>
    </div>
  `;

  // News feed
  renderNewsFeed(conflict.id);

  // Center map on conflict
  map.flyTo([conflict.lat, conflict.lng], 6, { duration: 1.5 });
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('sidebar-open');
  sidebar.classList.add('sidebar-closed');
  selectedConflict = null;
}

// ── News feed ──
function renderNewsFeed(conflictId) {
  const newsListEl = document.getElementById('news-list');
  const articles = NEWS_ARTICLES[conflictId] || [];

  if (articles.length === 0) {
    newsListEl.innerHTML = '<p class="no-news">Aucun article disponible pour ce conflit.</p>';
    return;
  }

  newsListEl.innerHTML = articles.map(article => `
    <article class="news-article">
      <div class="news-header">
        <span class="news-source">${article.source}</span>
        <span class="news-date">${formatDate(article.date)}</span>
        ${article.verified ? '<span class="verified-badge" title="Source verifiee">&#10003; Verifie</span>' : ''}
      </div>
      <h4 class="news-title">
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a>
      </h4>
      <p class="news-summary">${article.summary}</p>
    </article>
  `).join('');
}

// ── Filters ──
function initFilters() {
  const filterContainer = document.getElementById('filter-buttons');
  const intensityContainer = document.getElementById('intensity-buttons');

  // Conflict type filters
  Object.values(CONFLICT_TYPES).forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.type = type.id;
    btn.innerHTML = `<span class="filter-dot" style="background:${type.color}"></span>${type.label}`;
    btn.addEventListener('click', () => toggleFilter(type.id, btn));
    filterContainer.appendChild(btn);
  });

  // Intensity filters
  Object.values(INTENSITY_LEVELS).forEach(level => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn intensity-btn';
    btn.dataset.intensity = level.id;
    btn.innerHTML = `<span class="filter-dot" style="background:${level.color}"></span>${level.label}`;
    btn.addEventListener('click', () => toggleIntensity(level.id, btn));
    intensityContainer.appendChild(btn);
  });
}

function toggleFilter(typeId, btn) {
  if (activeFilters.has(typeId)) {
    activeFilters.delete(typeId);
    btn.classList.remove('active');
  } else {
    activeFilters.add(typeId);
    btn.classList.add('active');
  }
  renderMarkers();
}

function toggleIntensity(intensityId, btn) {
  if (activeIntensities.has(intensityId)) {
    activeIntensities.delete(intensityId);
    btn.classList.remove('active');
  } else {
    activeIntensities.add(intensityId);
    btn.classList.add('active');
  }
  renderMarkers();
}

// ── Legend ──
function initLegend() {
  const legendEl = document.getElementById('map-legend');
  legendEl.innerHTML = `
    <h4>Legende</h4>
    <div class="legend-section">
      <h5>Types de conflits</h5>
      ${Object.values(CONFLICT_TYPES).map(type => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${type.color}"></span>
          <span>${type.label}</span>
        </div>
      `).join('')}
    </div>
    <div class="legend-section">
      <h5>Intensite</h5>
      ${Object.values(INTENSITY_LEVELS).map(level => `
        <div class="legend-item">
          <span class="legend-circle" style="border-color:${level.color}; width:${level.radius}px; height:${level.radius}px;"></span>
          <span>${level.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Stats ──
function updateStats(visibleCount) {
  const statsEl = document.getElementById('stats');
  const highCount = CONFLICTS.filter(c => c.intensity === 'high').length;
  statsEl.innerHTML = `
    <span class="stat">${visibleCount} / ${CONFLICTS.length} conflits affiches</span>
    <span class="stat stat-alert">${highCount} haute intensite</span>
  `;
}

// ── Utilities ──
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Sidebar toggle ──
function initSidebarToggle() {
  document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('sidebar-closed')) {
      if (selectedConflict) {
        sidebar.classList.remove('sidebar-closed');
        sidebar.classList.add('sidebar-open');
      }
    } else {
      closeSidebar();
    }
  });
}

// ── Keyboard shortcuts ──
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });
}

// ── Initialize app ──
function init() {
  initMap();
  initFilters();
  initLegend();
  initSidebarToggle();
  initKeyboard();
  renderMarkers();
}

document.addEventListener('DOMContentLoaded', init);
