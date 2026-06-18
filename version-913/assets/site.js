/* Static interaction script: mobile navigation, hero carousel, filtering and HLS playback. */

(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            button.classList.toggle('is-open');
            menu.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var searchInput = scope.querySelector('[data-search-input]');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
            var countNode = scope.querySelector('[data-result-count]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-page-row'));

            if (!cards.length) {
                cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card, .filter-grid .rank-page-row'));
            }

            if (!cards.length) {
                return;
            }

            function cardText(card) {
                return [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.category
                ].join(' ').toLowerCase();
            }

            function apply() {
                var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matched = !query || text.indexOf(query) !== -1;

                    selects.forEach(function (select) {
                        var key = select.getAttribute('data-filter-select');
                        var selected = select.value.trim().toLowerCase();
                        if (selected && (card.dataset[key] || '').toLowerCase() !== selected) {
                            matched = false;
                        }
                    });

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (countNode) {
                    countNode.textContent = String(visible);
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', apply);
            }

            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

        players.forEach(function (player) {
            var video = player.querySelector('video[data-src]');
            var playButton = player.querySelector('[data-play-button]');

            if (!video || !playButton) {
                return;
            }

            function attachAndPlay() {
                var source = video.getAttribute('data-src');

                if (!source) {
                    return;
                }

                player.classList.add('is-playing');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    if (!video.getAttribute('src')) {
                        video.setAttribute('src', source);
                    }
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!video._hlsInstance) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        video._hlsInstance = hls;
                    }
                    video.play().catch(function () {});
                    return;
                }

                if (!video.getAttribute('src')) {
                    video.setAttribute('src', source);
                }
                video.play().catch(function () {});
            }

            playButton.addEventListener('click', attachAndPlay);
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
        setupPlayers();
    });
})();
