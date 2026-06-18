(function () {
  function closestCardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function fillSelect(select, cards, attr) {
    if (!select) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var raw = card.getAttribute('data-' + attr) || '';
      raw.split(/[\/／,，、]/).forEach(function (item) {
        var value = item.trim();
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
    });
    values.sort(function (a, b) {
      return a.localeCompare(b, 'zh-Hans-CN');
    });
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
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
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var searchInput = document.querySelector('[data-page-search]');
  var yearSelect = document.querySelector('[data-filter-field="year"]');
  var regionSelect = document.querySelector('[data-filter-field="region"]');
  var genreSelect = document.querySelector('[data-filter-field="genre"]');

  if (cards.length && (searchInput || yearSelect || regionSelect || genreSelect)) {
    fillSelect(yearSelect, cards, 'year');
    fillSelect(regionSelect, cards, 'region');
    fillSelect(genreSelect, cards, 'genre');

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var genre = normalize(genreSelect ? genreSelect.value : '');
      cards.forEach(function (card) {
        var cardText = closestCardText(card);
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var matched = true;
        if (keyword && cardText.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
      });
    }

    [searchInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var streamUrl = player.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function loadVideo() {
      if (!video || !streamUrl || loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      loadVideo();
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video) {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    player.addEventListener('click', function (event) {
      if (event.target === video && loaded) {
        return;
      }
      startPlayback(event);
    });
    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('emptied', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        loaded = false;
      });
    }
  });
}());
