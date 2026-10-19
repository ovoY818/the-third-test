/* =========================================================
   Audio player for desktop-5.html
   - click .audio-btn  -> play its data-audio
   - one track at a time (new one pauses the old)
   - click the playing icon again -> pause
   - click anywhere on the blank page -> pause
   No layout / positioning logic lives here.
   ========================================================= */
(function () {
  'use strict';

  var currentBtn = null;
  var currentSrc = null;
  var audio = new Audio();
  audio.preload = 'none';

  function pauseCurrent() {
    if (!audio.paused) {
      audio.pause();
    }
    if (currentBtn) {
      currentBtn.classList.remove('is-playing');
      currentBtn.setAttribute('aria-pressed', 'false');
    }
    currentBtn = null;
    currentSrc = null;
  }

  function playBtn(btn) {
    var src = btn.getAttribute('data-audio');
    if (!src) return;

    // Same icon clicked while playing -> pause (toggle off)
    if (currentBtn === btn && !audio.paused) {
      pauseCurrent();
      return;
    }

    // Another track (or the same one after it ended) -> switch to it
    if (currentSrc !== src) {
      audio.pause();
      audio.src = src;
      currentSrc = src;
    }

    if (currentBtn && currentBtn !== btn) {
      currentBtn.classList.remove('is-playing');
      currentBtn.setAttribute('aria-pressed', 'false');
    }
    currentBtn = btn;
    btn.classList.add('is-playing');
    btn.setAttribute('aria-pressed', 'true');

    var p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function (err) {
        // Autoplay blocked or file missing: reset state quietly
        if (err && err.name !== 'AbortError') {
          console.warn('[audio] 播放失败:', src, err);
        }
        if (currentBtn === btn) {
          btn.classList.remove('is-playing');
          btn.setAttribute('aria-pressed', 'false');
          currentBtn = null;
          currentSrc = null;
        }
      });
    }
  }

  // One delegated listener: buttons play/toggle, everything else pauses.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.audio-btn') : null;
    if (btn) {
      e.preventDefault();
      playBtn(btn);
      return;
    }
    pauseCurrent();
  });

  // Track ended -> clear state so the next click starts fresh
  audio.addEventListener('ended', function () {
    if (currentBtn) {
      currentBtn.classList.remove('is-playing');
      currentBtn.setAttribute('aria-pressed', 'false');
    }
    currentBtn = null;
    currentSrc = null;
  });

  // Space bar toggles the current track, Esc pauses (keyboard friendly)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') pauseCurrent();
  });

  // Leaving the page stops playback
  window.addEventListener('pagehide', pauseCurrent);
})();
