(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            stopHero();
            showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            stopHero();
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            stopHero();
            showSlide(current + 1);
            startHero();
        });
    }

    showSlide(0);
    startHero();

    var searchInput = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-category-select]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var activeCategory = "all";

    if (searchInput) {
        try {
            var params = new URLSearchParams(window.location.search);
            var requested = params.get("q");

            if (requested) {
                searchInput.value = requested;
            }
        } catch (error) {}
    }

    function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var selected = select ? select.value : activeCategory;
        var shown = 0;

        cards.forEach(function (card) {
            var text = card.getAttribute("data-search") || "";
            var cardCategory = card.getAttribute("data-category") || "";
            var matchText = !query || text.indexOf(query) !== -1;
            var matchCategory = selected === "all" || selected === cardCategory;

            if (matchText && matchCategory) {
                card.classList.remove("card-hidden");
                shown += 1;
            } else {
                card.classList.add("card-hidden");
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", shown === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (select) {
        select.addEventListener("change", function () {
            activeCategory = select.value;
            chips.forEach(function (chip) {
                chip.classList.toggle("is-active", chip.getAttribute("data-filter-chip") === activeCategory);
            });
            applyFilters();
        });
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeCategory = chip.getAttribute("data-filter-chip") || "all";

            chips.forEach(function (item) {
                item.classList.toggle("is-active", item === chip);
            });

            if (select) {
                select.value = activeCategory;
            }

            applyFilters();
        });
    });

    applyFilters();

    window.initVideo = function (videoId, url) {
        var video = document.getElementById(videoId);
        var veil = document.querySelector('[data-play-layer="' + videoId + '"]');
        var button = document.querySelector('[data-play-button="' + videoId + '"]');
        var ready = false;
        var mediaController = null;

        if (!video) {
            return;
        }

        function begin() {
            if (!ready) {
                ready = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    mediaController = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    mediaController.loadSource(url);
                    mediaController.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            video.controls = true;

            if (veil) {
                veil.classList.add("is-hidden");
            }

            var playPromise = video.play();

            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        if (veil) {
            veil.addEventListener("click", begin);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                begin();
            });
        }

        video.addEventListener("click", function () {
            if (!ready) {
                begin();
            }
        }, { once: true });

        window.addEventListener("beforeunload", function () {
            if (mediaController && mediaController.destroy) {
                mediaController.destroy();
            }
        });
    };
})();
