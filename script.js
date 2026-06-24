const SEARCH_ENGINES = {
    google: { name: 'google', url: 'https://www.google.com/search?q=' },
    duckduckgo: { name: 'duckDuckGo', url: 'https://duckduckgo.com/?q=' },
    startpage: { name: 'startpage', url: 'https://www.startpage.com/do/dsearch?query=' },
    gemini: { name: 'gemini', url: 'https://gemini.google.com/app?q=' },
    claude: { name: 'claude', url: 'https://claude.ai/new?q=' },
    grok: { name: 'grok', url: 'https://grok.com/?q=' },
    chatgpt: { name: 'chatGPT', url: 'https://chatgpt.com/?q=' },
    custom: { name: 'custom', url: null },
};

const DEFAULT_LINKS = [
    { name: 'github', url: 'https://github.com' },
    { name: 'reddit', url: 'https://reddit.com' },
    { name: 'youtube', url: 'https://youtube.com' },
    { name: 'hacker news', url: 'https://news.ycombinator.com' },
];

const STORAGE_KEY_LINKS = 'startpage_links';
const STORAGE_KEY_ENGINE = 'startpage_engine';
const STORAGE_KEY_COLLAPSED = 'startpage_collapsed';
const STORAGE_KEY_THEME = 'startpage_theme';
const STORAGE_KEY_WEATHER = 'startpage_weather';
const STORAGE_KEY_CUSTOM_URL = 'startpage_custom_url';
const STORAGE_KEY_WEATHER_DATA = 'startpage_weather_data_v2';
const STORAGE_KEY_WEATHER_LAT = 'startpage_weather_lat';
const STORAGE_KEY_WEATHER_LON = 'startpage_weather_lon';

// --- Clock ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}
updateClock();
setInterval(updateClock, 1000);

// --- Weather ---
const weatherEl = document.getElementById('weather');
let weatherEnabled = localStorage.getItem(STORAGE_KEY_WEATHER) !== '0';

const WMO_CODES = {
    0: { emoji: '☀️', text: 'Clear' },
    1: { emoji: '🌤️', text: 'Mostly clear' },
    2: { emoji: '⛅', text: 'Partly cloudy' },
    3: { emoji: '☁️', text: 'Overcast' },
    45: { emoji: '🌫️', text: 'Foggy' },
    48: { emoji: '🌫️', text: 'Rime fog' },
    51: { emoji: '🌦️', text: 'Light drizzle' },
    53: { emoji: '🌦️', text: 'Drizzle' },
    55: { emoji: '🌦️', text: 'Heavy drizzle' },
    56: { emoji: '🌧️', text: 'Freezing drizzle' },
    57: { emoji: '🌧️', text: 'Heavy freezing drizzle' },
    61: { emoji: '🌧️', text: 'Light rain' },
    63: { emoji: '🌧️', text: 'Rain' },
    65: { emoji: '🌧️', text: 'Heavy rain' },
    66: { emoji: '🌧️', text: 'Freezing rain' },
    67: { emoji: '🌧️', text: 'Heavy freezing rain' },
    71: { emoji: '❄️', text: 'Light snow' },
    73: { emoji: '❄️', text: 'Snow' },
    75: { emoji: '❄️', text: 'Heavy snow' },
    77: { emoji: '❄️', text: 'Snow grains' },
    80: { emoji: '🌦️', text: 'Light showers' },
    81: { emoji: '🌦️', text: 'Rain showers' },
    82: { emoji: '🌦️', text: 'Heavy showers' },
    85: { emoji: '🌨️', text: 'Snow showers' },
    86: { emoji: '🌨️', text: 'Heavy snow showers' },
    95: { emoji: '⛈️', text: 'Thunderstorm' },
    96: { emoji: '⛈️', text: 'Thunderstorm + hail' },
    99: { emoji: '⛈️', text: 'Thunderstorm + heavy hail' },
};

function getWeather() {
    if (!weatherEnabled) { weatherEl.textContent = ''; weatherEl.style.display = 'none'; return; }
    weatherEl.style.display = '';

    const cached = localStorage.getItem(STORAGE_KEY_WEATHER_DATA);
    if (cached) {
        try {
            const { data, ts } = JSON.parse(cached);
            if (Date.now() - ts < 30 * 60 * 1000) {
                weatherEl.textContent = data;
                return;
            }
        } catch { }
    }

    weatherEl.textContent = 'weather...';

    const customLat = localStorage.getItem(STORAGE_KEY_WEATHER_LAT);
    const customLon = localStorage.getItem(STORAGE_KEY_WEATHER_LON);
    if (customLat && customLon && !isNaN(customLat) && !isNaN(customLon)) {
        fetchWeather(parseFloat(customLat), parseFloat(customLon));
        return;
    }

    const fetchWeather = (lat, lon) => {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
            .then(r => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(json => {
                const cw = json.current_weather;
                const entry = WMO_CODES[cw.weathercode];
                const condition = entry ? `${entry.emoji} ${entry.text}` : 'Unknown';
                const temp = Math.round(cw.temperature);
                weatherEl.textContent = `${condition} ${temp}°C`;
                localStorage.setItem(STORAGE_KEY_WEATHER_DATA, JSON.stringify({ data: weatherEl.textContent, ts: Date.now() }));
            })
            .catch(err => {
                console.error('Weather fetch failed:', err);
                weatherEl.textContent = '';
            });
    };

    const byGeo = () => {
        try {
            navigator.geolocation.getCurrentPosition(
                pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => byIP(),
                { timeout: 5000, enableHighAccuracy: false }
            );
        } catch { byIP(); }
    };

    const byIP = () => {
        fetch('https://ip-api.com/json/?fields=lat,lon')
            .then(r => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(d => fetchWeather(d.lat, d.lon))
            .catch(err => {
                console.error('IP geolocation failed:', err);
                fetchWeather(51.5, -0.12);
            });
    };

    byGeo();
}
getWeather();

const weatherLat = document.getElementById('weather-lat');
const weatherLon = document.getElementById('weather-lon');

function populateWeatherCoords() {
    weatherLat.value = localStorage.getItem(STORAGE_KEY_WEATHER_LAT) || '';
    weatherLon.value = localStorage.getItem(STORAGE_KEY_WEATHER_LON) || '';
}

weatherLat.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEY_WEATHER_LAT, weatherLat.value);
    getWeather();
});
weatherLon.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEY_WEATHER_LON, weatherLon.value);
    getWeather();
});

document.getElementById('weather-toggle').addEventListener('change', (e) => {
    weatherEnabled = e.target.checked;
    localStorage.setItem(STORAGE_KEY_WEATHER, weatherEnabled ? '1' : '0');
    getWeather();
});

// --- Theme ---
function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') html.dataset.theme = 'light';
    else if (theme === 'dark') html.dataset.theme = 'dark';
    else html.removeAttribute('data-theme');
}

const themeRadios = document.querySelectorAll('#theme-list input[type="radio"]');
const themeLabels = ['system', 'light', 'dark'];
const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'system';
applyTheme(savedTheme);

for (const val of themeLabels) {
    const div = document.createElement('div');
    div.className = 'settings-option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'theme';
    radio.value = val;
    radio.id = 'theme-' + val;
    if (val === savedTheme) radio.checked = true;

    const label = document.createElement('label');
    label.htmlFor = 'theme-' + val;
    label.textContent = val.charAt(0).toUpperCase() + val.slice(1);

    div.appendChild(radio);
    div.appendChild(label);
    div.addEventListener('click', () => radio.click());
    radio.addEventListener('change', () => {
        if (radio.checked) {
            localStorage.setItem(STORAGE_KEY_THEME, val);
            applyTheme(val);
        }
    });

    document.getElementById('theme-list').appendChild(div);
}

// --- Search ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const weatherToggle = document.getElementById('weather-toggle');

weatherToggle.checked = weatherEnabled;

function getEngineKey() {
    const key = localStorage.getItem(STORAGE_KEY_ENGINE);
    return key && SEARCH_ENGINES[key] ? key : 'google';
}

let dotTimer = null;
let dotCount = 0;
let placeholderBase = '';

function updatePlaceholder() {
    const engine = SEARCH_ENGINES[getEngineKey()];
    placeholderBase = `search with ${engine.name}`;
    dotCount = 0;
    if (dotTimer) clearInterval(dotTimer);
    const update = () => {
        const dots = ['.  ', '.. ', '...'][dotCount];
        searchInput.placeholder = placeholderBase + dots;
    };
    update();
    dotTimer = setInterval(() => {
        dotCount = (dotCount + 1) % 3;
        update();
    }, 500);
}

function getSearchUrl(query) {
    const key = getEngineKey();
    if (key === 'custom') {
        const template = localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || 'https://www.google.com/search?q=%s';
        return template.replace(/%s/g, encodeURIComponent(query));
    }
    return SEARCH_ENGINES[key].url + encodeURIComponent(query);
}

function isUrl(str) {
    if (/^https?:\/\//i.test(str)) return true;
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+(:[0-9]+)?(\/.*)?$/i.test(str) && !/\s/.test(str);
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    const href = isUrl(query)
        ? (query.startsWith('http://') || query.startsWith('https://') ? query : 'https://' + query)
        : getSearchUrl(query);
    window.location.href = href;
});

// --- Settings panel ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const engineList = document.getElementById('engine-list');
const customEngineSection = document.getElementById('custom-engine-section');
const customEngineInput = document.getElementById('custom-engine-input');

customEngineInput.value = localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || '';

customEngineInput.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_URL, customEngineInput.value);
});

function populateEngineList() {
    engineList.innerHTML = '';
    const current = getEngineKey();
    for (const [key, eng] of Object.entries(SEARCH_ENGINES)) {
        const div = document.createElement('div');
        div.className = 'settings-option';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'engine';
        radio.value = key;
        radio.id = 'eng-' + key;
        if (key === current) radio.checked = true;

        const label = document.createElement('label');
        label.htmlFor = 'eng-' + key;
        label.textContent = eng.name;

        div.appendChild(radio);
        div.appendChild(label);
        div.addEventListener('click', () => radio.click());
        radio.addEventListener('change', () => {
            if (radio.checked) {
                localStorage.setItem(STORAGE_KEY_ENGINE, key);
                customEngineSection.classList.toggle('hidden', key !== 'custom');
                updatePlaceholder();
            }
        });

        engineList.appendChild(div);
    }
}

function openSettings() {
    populateEngineList();
    populateWeatherCoords();
    customEngineSection.classList.toggle('hidden', getEngineKey() !== 'custom');
    settingsPanel.classList.remove('hidden');
}

function closeSettings() {
    settingsPanel.classList.add('hidden');
}

function toggleSettings() {
    if (settingsPanel.classList.contains('hidden')) openSettings();
    else closeSettings();
    settingsBtn.classList.remove('spinning');
    void settingsBtn.offsetWidth;
    settingsBtn.classList.add('spinning');
}

settingsBtn.addEventListener('click', toggleSettings);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsPanel.classList.contains('hidden')) closeSettings();
});

// --- Links ---
function getLinks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_LINKS);
        return data ? JSON.parse(data) : null;
    } catch { return null; }
}

function setLinks(links) {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
}

const linksList = document.getElementById('links-list');
const manageBtn = document.getElementById('manage-btn');
const addLinkArea = document.getElementById('add-link-area');
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput = document.getElementById('link-url-input');
const addLinkBtn = document.getElementById('add-link-btn');
const collapseBtn = document.getElementById('collapse-btn');
const collapseToggle = document.getElementById('collapse-toggle');
const linksBody = document.getElementById('links-body');

let links = getLinks() || [...DEFAULT_LINKS];
if (!getLinks()) setLinks(links);
let manageMode = false;
let editingIndex = -1;

function faviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch { return ''; }
}

function renderLinks() {
    linksList.innerHTML = '';
    for (const [i, link] of links.entries()) {
        const item = document.createElement('div');
        item.className = 'link-item';
        item.dataset.index = i;

        if (manageMode && editingIndex === i) {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = link.name;
            nameInput.style.width = '80px';

            const urlInput = document.createElement('input');
            urlInput.type = 'text';
            urlInput.value = link.url;
            urlInput.style.width = '120px';

            const saveBtn = document.createElement('button');
            saveBtn.className = 'icon-btn';
            saveBtn.innerHTML = '<i class="ph ph-check"></i>';
            saveBtn.addEventListener('click', () => {
                const name = nameInput.value.trim();
                const url = urlInput.value.trim();
                if (!name || !url) return;
                const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
                links[i] = { name, url: fullUrl };
                setLinks(links);
                editingIndex = -1;
                renderLinks();
            });

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'icon-btn';
            cancelBtn.innerHTML = '<i class="ph ph-x"></i>';
            cancelBtn.addEventListener('click', () => {
                editingIndex = -1;
                renderLinks();
            });

            item.appendChild(nameInput);
            item.appendChild(urlInput);
            item.appendChild(saveBtn);
            item.appendChild(cancelBtn);
        } else {
            const img = document.createElement('img');
            img.src = faviconUrl(link.url);
            img.loading = 'lazy';
            img.alt = '';
            item.appendChild(img);

            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            item.appendChild(a);

            if (manageMode) {
                const editBtn = document.createElement('button');
                editBtn.className = 'icon-btn remove-btn';
                editBtn.innerHTML = '<i class="ph ph-pencil"></i>';
                editBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    editingIndex = i;
                    renderLinks();
                });

                const rm = document.createElement('button');
                rm.className = 'icon-btn remove-btn';
                rm.innerHTML = '<i class="ph ph-x"></i>';
                rm.addEventListener('click', (e) => {
                    e.preventDefault();
                    links.splice(i, 1);
                    setLinks(links);
                    renderLinks();
                });
                item.appendChild(editBtn);
                item.appendChild(rm);
            }
        }

        linksList.appendChild(item);
    }
}

manageBtn.addEventListener('click', () => {
    manageMode = !manageMode;
    manageBtn.classList.toggle('active', manageMode);
    linksList.classList.toggle('managing', manageMode);
    addLinkArea.classList.toggle('hidden', !manageMode);
    editingIndex = -1;
    renderLinks();
});

addLinkBtn.addEventListener('click', () => {
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    if (!name || !url) return;
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
    links.push({ name, url: fullUrl });
    setLinks(links);
    linkNameInput.value = '';
    linkUrlInput.value = '';
    renderLinks();
});

linkUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLinkBtn.click();
});
linkNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') linkUrlInput.focus();
});

// --- Collapse ---
function setCollapsed(collapsed) {
    localStorage.setItem(STORAGE_KEY_COLLAPSED, collapsed ? '1' : '');
    linksBody.classList.toggle('collapsed', collapsed);
    collapseBtn.innerHTML = collapsed ? '<i class="ph ph-caret-down"></i>' : '<i class="ph ph-caret-up"></i>';
}

function toggleCollapsed() {
    setCollapsed(!linksBody.classList.contains('collapsed'));
}

const savedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED) === '1';
setCollapsed(savedCollapsed);

collapseBtn.addEventListener('click', toggleCollapsed);
collapseToggle.addEventListener('click', toggleCollapsed);

// --- Init ---
updatePlaceholder();
renderLinks();

function focusSearchInput() {
    const input = document.getElementById('search-input');
    if (input) input.focus();
}
focusSearchInput();
setTimeout(focusSearchInput, 50);
setTimeout(focusSearchInput, 100);
setTimeout(focusSearchInput, 200);
setTimeout(focusSearchInput, 500);
