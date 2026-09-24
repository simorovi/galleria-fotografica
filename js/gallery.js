(function () {
  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var lightboxContent = lightbox.querySelector('.lightbox__content');
  var closeButton = document.getElementById('lightboxClose');
  var prevButton = document.getElementById('lightboxPrev');
  var nextButton = document.getElementById('lightboxNext');
  var overlay = document.getElementById('lightboxOverlay');

  var lightboxError = document.createElement('p');
  lightboxError.className = 'lightbox__error';
  lightboxError.textContent = 'Immagine non disponibile';
  lightboxError.hidden = true;
  lightboxContent.appendChild(lightboxError);

  var currentIndex = -1;
  var lastFocusedElement = null;
  var touchStartX = null;
  var touchStartY = null;
  var SWIPE_THRESHOLD = 40;

  function picsumUrl(id, width, height) {
    return 'https://picsum.photos/id/' + id + '/' + width + '/' + height;
  }

  function showImageError() {
    lightboxError.hidden = false;
  }

  function hideImageError() {
    lightboxError.hidden = true;
  }

  function handleImageLoad() {
    lightboxImage.classList.add('is-loaded');
    hideImageError();
  }

  function handleImageError() {
    lightboxImage.classList.remove('is-loaded');
    showImageError();
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
      img.width = photo.thumbWidth;
      img.height = photo.thumbHeight;

      button.appendChild(img);
      li.appendChild(button);
      fragment.appendChild(li);
    });

    gallery.appendChild(fragment);
  }

  renderGallery(window.PHOTOS || []);

  var buttons = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__button'));

  function getFocusableLightboxElements() {
    // Gruppo di elementi focusabili dentro il lightbox, nell'ordine in cui
    // devono ricevere il focus con Tab/Shift+Tab.
    return [closeButton, prevButton, nextButton].filter(function (el) {
      return el && !el.hidden && !el.disabled;
    });
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') {
      return;
    }

    var focusable = getFocusableLightboxElements();
    if (focusable.length === 0) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !lightboxContent.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !lightboxContent.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function openLightbox(index) {
    currentIndex = index;
    var button = buttons[currentIndex];
    var img = button.querySelector('img');
    var targetSrc = button.getAttribute('data-full');

    // Se il src richiesto è già quello attualmente assegnato all'immagine
    // del lightbox, riassegnarlo non genera un nuovo evento 'load'/'error'
    // (il browser non ripete una richiesta per un URL già risolto): lo
    // stato di visibilità/errore va quindi aggiornato subito "a mano".
    var isSameImageAlreadySet = lightboxImage.getAttribute('src') === targetSrc;

    lastFocusedElement = document.activeElement;

    hideImageError();
    lightboxImage.classList.remove('is-loaded');
    lightboxImage.src = targetSrc;
    lightboxImage.alt = img.getAttribute('alt');

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    // Rende il resto della pagina (in particolare la griglia sottostante,
    // coperta ma altrimenti ancora raggiungibile) inaccessibile a tastiera
    // e screen reader finché il lightbox è aperto.
    gallery.setAttribute('inert', '');

    closeButton.focus();

    if (isSameImageAlreadySet && lightboxImage.complete) {
      if (lightboxImage.naturalWidth > 0) {
        handleImageLoad();
      } else {
        handleImageError();
      }
    }
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightboxImage.src = '';
    hideImageError();

    // L'attributo inert va rimosso PRIMA di spostare il focus sull'elemento
    // salvato: un elemento reso inert non può ricevere focus.
    gallery.removeAttribute('inert');

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

  lightboxImage.addEventListener('load', handleImageLoad);
  lightboxImage.addEventListener('error', handleImageError);

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
    } else if (event.key === 'Tab') {
      trapFocus(event);
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
