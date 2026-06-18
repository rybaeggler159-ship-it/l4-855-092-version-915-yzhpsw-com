(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var currentSlide = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentSlide);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentSlide);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }

        function applyFilters(scope) {
            var input = scope.querySelector("[data-filter-input]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var activeButton = scope.querySelector("[data-filter-button].is-active");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-no-result]");
            var query = input ? input.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var tag = activeButton ? activeButton.getAttribute("data-filter-button") : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var cardTags = card.getAttribute("data-tags") || "";
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (region && cardRegion.indexOf(region) === -1) {
                    matched = false;
                }
                if (tag && cardTags.indexOf(tag) === -1) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            scope.querySelectorAll("[data-filter-input], [data-filter-year], [data-filter-region]").forEach(function (control) {
                control.addEventListener("input", function () {
                    applyFilters(scope);
                });
                control.addEventListener("change", function () {
                    applyFilters(scope);
                });
            });
            scope.querySelectorAll("[data-filter-button]").forEach(function (button) {
                button.addEventListener("click", function () {
                    scope.querySelectorAll("[data-filter-button]").forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    applyFilters(scope);
                });
            });
        });
    });

    function playVideo(video, mask, url) {
        if (!video || !url) {
            return;
        }

        if (mask) {
            mask.classList.add("is-hidden");
        }

        video.controls = true;

        if (video.getAttribute("data-ready") === "1") {
            video.play().catch(function () {});
            return;
        }

        video.setAttribute("data-ready", "1");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {});
            }, { once: true });
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            video._hlsInstance = hls;
            return;
        }

        video.src = url;
        video.play().catch(function () {});
    }

    window.initMoviePlayer = function (videoId, maskId, url) {
        var video = document.getElementById(videoId);
        var mask = document.getElementById(maskId);
        if (!video) {
            return;
        }
        if (mask) {
            mask.addEventListener("click", function () {
                playVideo(video, mask, url);
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo(video, mask, url);
            }
        });
    };
}());
