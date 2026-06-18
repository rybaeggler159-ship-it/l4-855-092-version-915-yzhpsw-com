(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-nav-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            menuButton.textContent = isOpen ? '×' : '☰';
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            setHero(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            window.clearInterval(timer);
            setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    startHero();

    document.querySelectorAll('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var grid = document.querySelector('[data-filter-grid]');
    var localInput = document.querySelector('.local-search-input');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var emptyState = document.querySelector('.empty-state');

    function normalize(text) {
        return String(text || '').toLowerCase();
    }

    function getCardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function applyFilter() {
        if (!grid) {
            return;
        }
        var query = localInput ? normalize(localInput.value.trim()) : '';
        var activeChip = document.querySelector('.filter-chip.is-active');
        var chipValue = activeChip ? activeChip.getAttribute('data-filter') : 'all';
        var visible = 0;

        grid.querySelectorAll('.movie-card').forEach(function (card) {
            var text = getCardText(card);
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchChip = chipValue === 'all' || text.indexOf(normalize(chipValue)) !== -1;
            var show = matchQuery && matchChip;
            card.classList.toggle('is-hidden', !show);
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (localInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            localInput.value = q;
        }
        localInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (item) {
                item.classList.remove('is-active');
            });
            chip.classList.add('is-active');
            applyFilter();
        });
    });

    applyFilter();
})();
