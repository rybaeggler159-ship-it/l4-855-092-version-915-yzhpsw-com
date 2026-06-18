(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.toggle('open');
            menuButton.classList.toggle('open', isOpen);
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    const localSearch = document.querySelector('[data-local-search]');
    const cardList = document.querySelector('[data-card-list]');
    const emptyState = document.querySelector('[data-empty-state]');

    if (localSearch && cardList) {
        const cards = Array.from(cardList.querySelectorAll('[data-card]'));
        const url = new URL(window.location.href);
        const query = url.searchParams.get('q') || '';

        if (query) {
            localSearch.value = query;
        }

        const applyFilter = function () {
            const value = localSearch.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const text = card.getAttribute('data-search') || '';
                const matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('visible', visible === 0);
            }
        };

        localSearch.addEventListener('input', applyFilter);
        applyFilter();
    }

    const playerShells = Array.from(document.querySelectorAll('.player-shell'));

    playerShells.forEach(function (shell) {
        const video = shell.querySelector('video');
        const overlay = shell.querySelector('.player-overlay');
        let hlsInstance = null;
        let prepared = false;

        if (!video) {
            return;
        }

        const prepare = function () {
            if (prepared) {
                return;
            }

            const playUrl = video.getAttribute('data-hls');

            if (!playUrl) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playUrl;
            }

            prepared = true;
        };

        const start = function () {
            prepare();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            const playing = video.play();
            if (playing && typeof playing.catch === 'function') {
                playing.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
