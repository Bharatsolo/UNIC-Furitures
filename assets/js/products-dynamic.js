// ============================================================
// UNIC Furnitures — Dynamic Products Rendering
// ============================================================

window.loadedDynamicProducts = {};

document.addEventListener('DOMContentLoaded', () => {
  // We need to wait for firebase to be ready
  if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
    fetchAndRenderProducts();
  } else {
    console.error("Firebase is not initialized.");
  }
});

async function fetchAndRenderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  try {
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
    
    // We'll create a container for dynamic products
    const dynamicContainer = document.createElement('div');
    dynamicContainer.style.display = 'contents'; // So grid styles apply to children
    
    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      window.loadedDynamicProducts[product.id] = product;
      
      let colorsHtml = '';
      if (product.colors && Array.isArray(product.colors)) {
        colorsHtml = product.colors.map(c => 
          `<span class="color-swatch" style="background:${c}" title="${c}"></span>`
        ).join('');
      }

      const img = product.image || 'assets/placeholder.svg';
      const formattedPrice = product.price ? '₹' + product.price.toLocaleString('en-IN') : 'Contact for Price';
      
      const badgeHtml = product.trending ? `<span class="product-card-badge" style="background:var(--accent); color:var(--text); right: 12px; left: auto;">Trending</span>` : 
                        product.featured ? `<span class="product-card-badge" style="background:var(--secondary); right: 12px; left: auto;">Featured</span>` : '';

      const card = document.createElement('div');
      card.className = 'product-card fade-in visible';
      card.setAttribute('data-category', (product.category || '').toLowerCase().replace(/\s+/g, '-'));
      
      card.innerHTML = `
          <div class="product-card-image">
              <img src="${img}" alt="${product.name}" loading="lazy" onerror="this.src='assets/placeholder.svg'">
              <span class="product-card-badge">${product.category || 'Product'}</span>
              ${badgeHtml}
          </div>
          <div class="product-card-body">
              <h3>${product.name}</h3>
              <p class="description">${product.description || ''}</p>
              <p class="price">${formattedPrice}</p>
              <div class="product-colors">
                  <span class="label">Colors:</span>
                  ${colorsHtml}
              </div>
              <div class="product-meta">
                  <span>✨ Premium Quality</span>
              </div>
              <div class="product-card-actions">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="showProductDetails('${product.id}')">View Details</button>
                  <a href="https://wa.me/919966033929?text=Hi%20UNIC%20Home%20Furniture%2C%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}.%20Please%20share%20more%20details." class="btn btn-whatsapp btn-sm" target="_blank">💬 Enquire</a>
              </div>
          </div>
      `;
      
      dynamicContainer.appendChild(card);
    });

    // Prepend the dynamic products before the static ones
    grid.prepend(dynamicContainer);

    // Re-initialize filter logic to include new dynamic elements
    initProductFilters();

  } catch (error) {
    console.error("Error fetching dynamic products:", error);
  }
}

function initProductFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const allCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    // Prevent multiple listeners if called multiple times
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', () => {
      // Remove active class from all
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      newBtn.classList.add('active');

      const filter = newBtn.getAttribute('data-category');

      allCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
          // trigger reflow for animation
          card.classList.remove('visible');
          void card.offsetWidth;
          card.classList.add('visible');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

window.showProductDetails = function(id) {
  const product = window.loadedDynamicProducts[id];
  if (!product) return;
  
  document.getElementById('detailModalImage').src = product.image || 'assets/placeholder.svg';
  document.getElementById('detailModalName').textContent = product.name;
  document.getElementById('detailModalCategory').textContent = product.category || 'Product';
  document.getElementById('detailModalPrice').textContent = product.price ? '₹' + product.price.toLocaleString('en-IN') : 'Contact for Price';
  document.getElementById('detailModalDescription').textContent = product.description || '';
  
  let colorsHtml = '';
  if (product.colors && Array.isArray(product.colors)) {
    colorsHtml = product.colors.map(c => 
      `<span class="color-swatch" style="background:${c}; width:24px; height:24px; display:inline-block; border-radius:50%; border:1px solid #e5e7eb; margin-right:8px;" title="${c}"></span>`
    ).join('');
  }
  document.getElementById('detailModalColors').innerHTML = colorsHtml;
  
  const whatsappUrl = `https://wa.me/919966033929?text=Hi%20UNIC%20Home%20Furniture%2C%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}.%20Please%20share%20more%20details.`;
  document.getElementById('detailModalWhatsapp').href = whatsappUrl;

  document.getElementById('productDetailModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeProductDetails = function() {
  document.getElementById('productDetailModal').style.display = 'none';
  document.body.style.overflow = '';
};

    window.showStaticProductDetails = function(btn) {
        const card = btn.closest('.product-card');
        if (!card) return;
        
        const img = card.querySelector('.product-card-image img').src;
        const badgeEl = card.querySelector('.product-card-badge');
        const category = badgeEl ? badgeEl.textContent : 'Product';
        const name = card.querySelector('.product-card-body h3').textContent;
        const desc = card.querySelector('.description').textContent;
        const price = card.querySelector('.price').textContent;
        
        const colors = [];
        card.querySelectorAll('.product-colors .color-swatch').forEach(span => {
            colors.push(span.style.backgroundColor || span.style.background);
        });
        
        document.getElementById('detailModalImage').src = img;
        document.getElementById('detailModalCategory').textContent = category;
        document.getElementById('detailModalName').textContent = name;
        document.getElementById('detailModalPrice').textContent = price;
        
        let fullDesc = desc;
        const metaSpans = card.querySelectorAll('.product-meta span');
        if (metaSpans.length > 0) {
            const metaText = Array.from(metaSpans).map(s => s.textContent).join(' | ');
            fullDesc += '\n\n' + metaText;
        }
        document.getElementById('detailModalDescription').textContent = fullDesc;
        
        let colorsHtml = '';
        colors.forEach(c => {
            colorsHtml += `<span class="color-swatch" style="background:${c}; width:24px; height:24px; display:inline-block; border-radius:50%; border:1px solid #e5e7eb; margin-right:8px;" title="${c}"></span>`;
        });
        document.getElementById('detailModalColors').innerHTML = colorsHtml;
        
        const whatsappUrl = `https://wa.me/919966033929?text=Hi%20UNIC%20Home%20Furniture%2C%20I%20am%20interested%20in%20${encodeURIComponent(name)}.%20Please%20share%20more%20details.`;
        document.getElementById('detailModalWhatsapp').href = whatsappUrl;
        
        document.getElementById('productDetailModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeProductDetails = function() {
        document.getElementById('productDetailModal').style.display = 'none';
        document.body.style.overflow = '';
    };
