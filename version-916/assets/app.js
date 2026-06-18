(function () {
    var doc = document;

    function ready(fn) {
        if (doc.readyState !== "loading") {
            fn();
            return;
        }
        doc.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = doc.querySelector(".menu-button");
        var panel = doc.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
            } else {
                panel.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
            }
        });
    }

    function setupHero() {
        var hero = doc.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
                show(next);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(doc.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || doc;
            var grid = scope.querySelector("[data-filter-grid]");
            if (!grid) {
                grid = doc.querySelector("[data-filter-grid]");
            }
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var input = panel.querySelector("[data-filter-search]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var reset = panel.querySelector("[data-filter-reset]");
            var empty = doc.createElement("div");
            empty.className = "filter-empty";
            empty.textContent = "没有找到匹配内容";
            empty.hidden = true;
            grid.appendChild(empty);

            function fill(select, attr) {
                if (!select) {
                    return;
                }
                var values = [];
                cards.forEach(function (card) {
                    var value = card.getAttribute(attr) || "";
                    if (value && values.indexOf(value) === -1) {
                        values.push(value);
                    }
                });
                values.sort().forEach(function (value) {
                    var option = doc.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
                    var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
                    var visible = matchKeyword && matchRegion && matchType;
                    card.hidden = !visible;
                    if (visible) {
                        shown += 1;
                    }
                });
                empty.hidden = shown !== 0;
            }

            fill(region, "data-region");
            fill(type, "data-type");

            if (input) {
                input.addEventListener("input", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            if (type) {
                type.addEventListener("change", apply);
            }
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }
        });
    }

    function setupHeaderSearch() {
        var forms = Array.prototype.slice.call(doc.querySelectorAll(".header-search, .mobile-search"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input");
                if (!input || !input.value.trim()) {
                    return;
                }
                if (doc.body.getAttribute("data-page") === "home") {
                    event.preventDefault();
                    var target = doc.querySelector("[data-filter-search]");
                    if (target) {
                        target.value = input.value.trim();
                        target.dispatchEvent(new Event("input", { bubbles: true }));
                        target.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            });
        });
    }

    function setupPlayer() {
        var shell = doc.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = doc.getElementById("movie-player");
        var layer = doc.getElementById("movie-poster-layer");
        var error = shell.querySelector(".player-error");
        var stream = shell.getAttribute("data-stream");
        var hls = null;

        function fail() {
            if (error) {
                error.hidden = false;
            }
        }

        function attach() {
            if (!video || !stream || video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.setAttribute("data-ready", "1");
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        fail();
                    }
                });
                video.setAttribute("data-ready", "1");
                return;
            }
            video.src = stream;
            video.setAttribute("data-ready", "1");
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("error", fail);
        }
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupHeaderSearch();
        setupPlayer();
    });
}());
