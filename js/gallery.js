(function () {
  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var closeButton = document.getElementById('lightboxClose');
  var prevButton = document.getElementById('lightboxPrev');
  var nextButton = document.getElementById('lightboxNext');
  var overlay = document.getElementById('lightboxOverlay');

  var currentIndex = -1;
  var lastFocusedElement = null;
  var touchStartX = null;
  var touchStartY = null;
  var SWIPE_THRESHOLD = 40;

  function picsumUrl(id, width, height) {
    return 'https://picsum.photos/id/' + id + '/' + width + '/' + height;
  }

  function renderGallery(photos) {
    var fragment = document.createDocumentFragment();

    photos.forEach(function (photo) {
      var li = document.createElement('li');
      li.className = 'gallery__item';

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery__button';
      button.setAttribute('data-full', picsumUrl(photo.id, photo.fullWidth, photo.fullHeight));

      var img = document.createElement('img');
      img.className = 'gallery__thumb';
      img.src = picsumUrl(photo.id, photo.thumbWidth, photo.thumbHeight);
      img.alt = photo.alt;
      img.loading = 'lazy';

      button.appendChild(img);
      li.appendChild(button);
      fragment.appendChild(li);
    });

    gallery.appendChild(fragment);
  }

  renderGallery(window.PHOTOS || []);

  var buttons = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__button'));

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

  lightbox.addEventListener('touchstart', function (event) {
    var touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (event) {
    if (touchStartX === null) {
      return;
    }

    var touch = event.changedTouches[0];
    var deltaX = touch.clientX - touchStartX;
    var deltaY = touch.clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      showNext();
    } else {
      showPrev();
    }
  }, { passive: true });
})();
