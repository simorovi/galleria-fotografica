(function () {
  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var closeButton = document.getElementById('lightboxClose');
  var prevButton = document.getElementById('lightboxPrev');
  var nextButton = document.getElementById('lightboxNext');
  var overlay = document.getElementById('lightboxOverlay');

  var buttons = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__button'));
  var currentIndex = -1;
  var lastFocusedElement = null;

  function openLightbox(index) {
    currentIndex = index;
    var button = buttons[currentIndex];
    var img = button.querySelector('img');

    lastFocusedElement = document.activeElement;

    lightboxImage.classList.remove('is-loaded');
    lightboxImage.src = button.getAttribute('data-full');
    lightboxImage.alt = img.getAttribute('alt');

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightboxImage.src = '';

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function showNext() {
    openLightbox((currentIndex + 1) % buttons.length);
  }

  function showPrev() {
    openLightbox((currentIndex - 1 + buttons.length) % buttons.length);
  }

  gallery.addEventListener('click', function (event) {
    var button = event.target.closest('.gallery__button');
    if (!button) {
      return;
    }
    var index = buttons.indexOf(button);
    openLightbox(index);
  });

  lightboxImage.addEventListener('load', function () {
    lightboxImage.classList.add('is-loaded');
  });

  closeButton.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  nextButton.addEventListener('click', showNext);
  prevButton.addEventListener('click', showPrev);

  document.addEventListener('keydown', function (event) {
    if (lightbox.hidden) {
      return;
    }
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowRight') {
      showNext();
    } else if (event.key === 'ArrowLeft') {
      showPrev();
    }
  });
})();
