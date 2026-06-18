(function () {
    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var source = options.source;
        var hls = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            loadSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
