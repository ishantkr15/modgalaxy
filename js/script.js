const STORAGE_KEY = 'as_multiverse_apps';
let allApps = [];
let currentFilter = 'all';
let searchQuery = '';

async function fetchApps() {
    const loadingEl = document.getElementById('loading');

    try {
        // Check localStorage first (admin edits), then fall back to JSON file
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            allApps = JSON.parse(stored);
        } else {
            const response = await fetch('/data/apps.json');
            const data = await response.json();
            allApps = data;
        }

        loadingEl.style.display = 'none';
        displayApps(allApps);
        setupFilters();
    } catch (error) {
        loadingEl.textContent = 'Error loading apps. Please try again later.';
    }
}

function displayApps(apps) {
    const appsGrid = document.getElementById('apps-grid');
    appsGrid.innerHTML = '';

    if (apps.length === 0) {
        appsGrid.innerHTML = '<div class="no-results">No apps found matching your criteria</div>';
        return;
    }

    apps.forEach((app, index) => {
        const appCard = createAppCard(app, index);
        appsGrid.appendChild(appCard);
    });
}

function filterApps() {
    let filtered = allApps;

    if (currentFilter !== 'all') {
        if (currentFilter === 'popular') {
            filtered = filtered.filter(app => app.isPopular);
        } else if (currentFilter === 'new') {
            filtered = filtered.filter(app => app.isNew);
        } else {
            filtered = filtered.filter(app => app.category === currentFilter);
        }
    }

    if (searchQuery) {
        filtered = filtered.filter(app =>
            app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    displayApps(filtered);
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterApps();
        });
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterApps();
    });
}

function createAppCard(app, index) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const badgeHTML = app.isPopular
        ? '<span class="popular-badge">POPULAR</span>'
        : app.isNew
            ? '<span class="new-badge">NEW</span>'
            : '';

    card.innerHTML = `
        <div class="app-header">
            <img src="${app.icon}" alt="${app.title}" class="app-icon" onerror="this.src='https://i.postimg.cc/CMHx2j5f/20231013_112419.jpg'">
            <div class="app-info">
                <h3 class="app-title">${app.title}</h3>
                <p class="app-subtitle">${app.subtitle}</p>
            </div>
            ${badgeHTML}
        </div>
        <div class="app-meta">
            <div class="app-meta-item">
                <i class="fas fa-code-branch app-meta-icon"></i>
                <span>v${app.version}</span>
            </div>
            <div class="app-meta-item">
                <i class="fas fa-download app-meta-icon"></i>
                <span>${app.downloads}</span>
            </div>
            <div class="app-meta-item">
                <i class="fas fa-hdd app-meta-icon"></i>
                <span>${app.size}</span>
            </div>
        </div>
        <div class="app-actions">
            ${app.url && app.url.trim() ? `
            <button class="app-btn app-btn-primary" onclick="event.stopPropagation(); window.open('${app.url}', '_blank')">
                <i class="fas fa-download"></i>
                <span>Download</span>
            </button>
            ` : ''}
            <button class="app-btn app-btn-secondary" onclick="event.stopPropagation(); ${app.studyUrl && app.studyUrl.trim() ? `window.open('${app.studyUrl}', '_blank')` : `openAppDetails('${app._id}')`}">
                <i class="fas fa-book-open"></i>
                <span>Let's Study</span>
            </button>
        </div>
    `;

    card.addEventListener('click', () => {
        openAppDetails(app._id);
    });

    return card;
}

function openAppDetails(appId) {
    window.location.href = `details.html?id=${appId}`;
}

function scrollToApps() {
    document.getElementById('apps').scrollIntoView({
        behavior: 'smooth'
    });
}

function hideSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.style.animation = 'splashFadeOut 0.8s ease forwards';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchApps();
    hideSplashScreen();
});

const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

function toggleDrawer() {
    const drawer = document.getElementById('drawer');
    if (drawer.classList.contains('active')) {
        closeDrawer();
    } else {
        openDrawer();
    }
}

function openDrawer() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawer-overlay');
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawer-overlay');
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDrawer();
    }
});
