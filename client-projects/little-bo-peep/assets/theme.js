// Little Bo Peep Theme JS
// Core functionality for product interactions, cart, and navigation

(function() {
  'use strict';

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Add to Cart functionality
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.button--add-to-cart');
    if (!button) return;

    const productId = button.dataset.productId;
    if (!productId) return;

    button.disabled = true;
    button.textContent = 'Adding...';

    // Fetch add to cart endpoint
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{
          id: productId,
          quantity: 1,
        }],
      }),
    })
    .then(response => response.json())
    .then(() => {
      // Show success feedback
      button.textContent = 'Added to Bag ✓';
      setTimeout(() => {
        button.disabled = false;
        button.textContent = 'Add to Bag';
      }, 2000);

      // Update cart count (simple approach, can be enhanced)
      updateCartCount();
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      button.disabled = false;
      button.textContent = 'Try Again';
    });
  });

  // Cart toggle
  const cartToggle = document.getElementById('cart-toggle');
  if (cartToggle) {
    cartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      // In a full implementation, this would open the cart drawer
      window.location.href = '/cart';
    });
  }

  // Update cart count
  function updateCartCount() {
    fetch('/cart.json')
      .then(response => response.json())
      .then(cart => {
        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle && cart.item_count > 0) {
          let badge = cartToggle.querySelector('.header__cart-count');
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'header__cart-count';
            cartToggle.appendChild(badge);
          }
          badge.textContent = cart.item_count;
        }
      });
  }

  // Lazy load images on scroll
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Image is already loading via native lazy loading
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // Smooth scroll for anchor links (if not prefers-reduced-motion)
  if (!prefersReducedMotion) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link && link.hash && document.querySelector(link.hash)) {
        e.preventDefault();
        document.querySelector(link.hash).scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Newsletter form handler
  const newsletterForm = document.querySelector('.newsletter__form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = newsletterForm.querySelector('.newsletter__input').value;
      const button = newsletterForm.querySelector('button');

      button.disabled = true;
      button.textContent = 'Subscribing...';

      // In a real implementation, this would send to a newsletter service
      setTimeout(() => {
        button.textContent = 'Subscribed ✓';
        button.disabled = false;
        newsletterForm.reset();
      }, 1000);
    });
  }

  console.log('Theme JS loaded');
})();
