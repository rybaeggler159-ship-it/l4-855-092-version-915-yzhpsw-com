(function(){
  var menu=document.querySelector('[data-menu-toggle]');
  var panel=document.querySelector('[data-mobile-panel]');
  if(menu&&panel){menu.addEventListener('click',function(){panel.classList.toggle('hidden')})}
  var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
  var dots=[].slice.call(document.querySelectorAll('[data-hero-dot]'));
  if(slides.length){var current=0;function show(i){slides[current].classList.remove('active');if(dots[current])dots[current].classList.remove('active');current=(i+slides.length)%slides.length;slides[current].classList.add('active');if(dots[current])dots[current].classList.add('active')}dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});setInterval(function(){show(current+1)},5200)}
  var input=document.querySelector('[data-filter-input]');
  var cards=[].slice.call(document.querySelectorAll('.searchable-card'));
  var empty=document.querySelector('[data-empty]');
  if(input&&cards.length){var params=new URLSearchParams(location.search);var q=params.get('q');if(q){input.value=q}var filter=function(){var v=input.value.trim().toLowerCase();var visible=false;cards.forEach(function(card){var text=(card.getAttribute('data-search-text')||'').toLowerCase();var ok=!v||text.indexOf(v)>-1;card.hidden=!ok;if(ok)visible=true});if(empty){empty.style.display=visible?'none':'block'}};input.addEventListener('input',filter);filter()}
  document.querySelectorAll('[data-chip]').forEach(function(btn){btn.addEventListener('click',function(){if(!input)return;input.value=btn.getAttribute('data-chip')||'';input.dispatchEvent(new Event('input'))})});
  document.querySelectorAll('[data-player]').forEach(function(box){var video=box.querySelector('video');var button=box.querySelector('.play-cover');var stream=box.getAttribute('data-hls');var ready=false;function start(){if(!ready){ready=true;if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=stream}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(stream);hls.attachMedia(video);video._hls=hls}else{video.src=stream}}box.classList.add('is-playing');var p=video.play();if(p&&p.catch){p.catch(function(){})}}if(button){button.addEventListener('click',start)}video.addEventListener('click',function(){if(!box.classList.contains('is-playing'))start()})})
})();