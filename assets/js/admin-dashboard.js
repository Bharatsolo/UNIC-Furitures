// ============================================================
// UNIC Furnitures — Admin Dashboard Logic
// ============================================================

let adminProducts = [];
let editingProductId = null;
let currentColors = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});

function checkAdminAuth() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const adminDoc = await db.collection('admins').doc(user.uid).get();
      if (!adminDoc.exists) {
        window.location.href = '../index.html';
        return;
      }

      document.getElementById('adminUserEmail').textContent = user.email;
      document.getElementById('adminUserAvatar').textContent = user.email.charAt(0).toUpperCase();

      initEvents();
      loadProducts();
    } catch (e) {
      console.error("Error verifying admin state", e);
      window.location.href = 'login.html';
    }
  });
}

function showToast(type, title, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Load Products ──
async function loadProducts() {
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">Loading...</td></tr>`;

  try {
    const snapshot = await productsRef.orderBy('createdAt', 'desc').get();

    adminProducts = [];
    snapshot.forEach(doc => {
      adminProducts.push({ id: doc.id, ...doc.data() });
    });

    renderProducts();
    updateStats();
  } catch (error) {
    console.error('Error loading products:', error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">Failed to load products.</td></tr>`;
    showToast('error', 'Error', 'Failed to load products.');
  }
}

function renderProducts(filter = '') {
  const tbody = document.getElementById('productsTableBody');
  let products = adminProducts;

  if (filter) {
    const q = filter.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(product => {
    let colorsHtml = '';
    if (product.colors && Array.isArray(product.colors)) {
      colorsHtml = product.colors.map(c => `<span class="admin-color-swatch" style="background-color: ${c};" title="${c}"></span>`).join('');
    } else {
      colorsHtml = '<span style="color: #9ca3af; font-size: 0.75rem;">None</span>';
    }

    const featuredBadge = product.featured ? '<span style="background: #f3e8ff; color: #9333ea; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-right: 4px;">Featured</span>' : '';
    const trendingBadge = product.trending ? '<span style="background: #ffedd5; color: #ea580c; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Trending</span>' : '';

    let displayImg = product.image || '../assets/placeholder.svg';

    const dateStr = product.createdAt ? new Date(product.createdAt.toMillis()).toLocaleDateString() : 'N/A';

    return `
      <tr>
        <td>
          <div class="admin-table-product">
            <img src="${displayImg}" alt="${product.name}" class="admin-table-image" onerror="this.src='../assets/placeholder.svg'">
            <div class="admin-table-product-info">
              <h4>${product.name}</h4>
              <span>${product.category}</span>
            </div>
          </div>
        </td>
        <td><strong style="color: var(--primary-color, #c19a6b);">₹${product.price}</strong></td>
        <td>
          <div class="color-swatch-list" style="gap: 0;">${colorsHtml}</div>
        </td>
        <td>${featuredBadge} ${trendingBadge}</td>
        <td style="color: #6b7280; font-size: 0.75rem;">${dateStr}</td>
        <td>
          <div class="admin-table-actions">
            <button class="btn-edit" title="Edit" onclick="openEditModal('${product.id}')">✏️</button>
            <button class="btn-delete" title="Delete" onclick="confirmDelete('${product.id}', '${product.name.replace(/'/g, "\\'")}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updateStats() {
  document.getElementById('statTotal').textContent = adminProducts.length;

  const sofas = adminProducts.filter(p => p.category === 'L Type Sofas' || p.category === 'Recliners' || p.category === 'Lounger');
  document.getElementById('statSofas').textContent = sofas.length;

  const beds = adminProducts.filter(p => p.category === 'Designer Cots' || p.category === 'Sofa Cum Bed');
  document.getElementById('statBeds').textContent = beds.length;

  const featured = adminProducts.filter(p => p.featured);
  document.getElementById('statFeatured').textContent = featured.length;
}

// ── Events ──
function initEvents() {
  document.getElementById('addProductBtn').addEventListener('click', openAddModal);

  const searchInput = document.getElementById('adminSearch');
  searchInput.addEventListener('input', (e) => {
    renderProducts(e.target.value.trim());
  });

  document.querySelectorAll('.modal-close, .modal-backdrop, #modalCancelBtn, #confirmCancelBtn').forEach(el => {
    el.addEventListener('click', closeModals);
  });

  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => { window.location.href = 'login.html'; });
  });

  document.getElementById('addColorBtn').addEventListener('click', () => {
    const colorVal = document.getElementById('newColorPicker').value;
    if (colorVal && !currentColors.includes(colorVal)) {
      currentColors.push(colorVal);
      renderColorSwatches();
    }
  });

  document.getElementById('productImage').addEventListener('input', (e) => {
    let url = formatImageUrl(e.target.value.trim());
    const img = document.getElementById('imagePreview');
    const ph = document.getElementById('imagePreviewPlaceholder');
    if (url) {
      img.src = url;
      img.style.display = 'block';
      ph.style.display = 'none';
    } else {
      img.style.display = 'none';
      ph.style.display = 'block';
    }
  });

  const imageUpload = document.getElementById('imageUpload');
  if (imageUpload) {
    imageUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const progressContainer = document.getElementById('uploadProgressContainer');
      const progressBar = document.getElementById('uploadProgressBar');
      const urlInput = document.getElementById('productImage');

      progressContainer.style.display = 'block';
      progressBar.style.width = '30%';
      urlInput.disabled = true;

      try {
        // Compress and convert to Base64
        const compressedBase64 = await compressAndConvertImage(file);
        progressBar.style.width = '100%';

        urlInput.value = compressedBase64;
        urlInput.dispatchEvent(new Event('input'));

        setTimeout(() => {
          progressContainer.style.display = 'none';
          urlInput.disabled = false;
          showToast('success', 'Upload Complete', 'Image processed successfully.');
        }, 300);
      } catch (err) {
        console.error("Image processing failed", err);
        showToast('error', 'Upload Failed', 'Could not process image.');
        progressContainer.style.display = 'none';
        urlInput.disabled = false;
      }
    });
  }
}

// Client-side image compression to bypass Firebase Storage billing limit
function compressAndConvertImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG format with 0.7 quality (generates a light ~50KB string)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function renderColorSwatches() {
  const container = document.getElementById('colorSwatchesContainer');
  container.innerHTML = '';

  currentColors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-swatch-item';
    div.style.backgroundColor = color;
    div.title = color;

    const btn = document.createElement('button');
    btn.className = 'remove-color';
    btn.innerHTML = '✕';
    btn.type = 'button';
    btn.onclick = () => {
      currentColors = currentColors.filter(c => c !== color);
      renderColorSwatches();
    };

    div.appendChild(btn);
    container.appendChild(div);
  });

  document.getElementById('colorError').style.display = currentColors.length === 0 ? 'block' : 'none';
}

function openModal(modalId) {
  document.getElementById('modalBackdrop').classList.add('active');
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModals() {
  document.getElementById('modalBackdrop').classList.remove('active');
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  document.body.style.overflow = '';
}

function openAddModal() {
  editingProductId = null;
  document.getElementById('productForm').reset();
  document.getElementById('modalTitle').textContent = 'Add New Product';
  document.getElementById('modalSubmitText').textContent = 'Add Product';

  currentColors = [];
  renderColorSwatches();

  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('imagePreviewPlaceholder').style.display = 'block';

  document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));

  openModal('productModal');
}

function openEditModal(id) {
  const product = adminProducts.find(p => p.id === id);
  if (!product) return;

  editingProductId = id;
  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('modalSubmitText').textContent = 'Save Changes';

  document.getElementById('productName').value = product.name || '';
  document.getElementById('productPrice').value = product.price || '';
  document.getElementById('productCategory').value = product.category || '';
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productImage').value = product.image || '';
  document.getElementById('productFeatured').checked = !!product.featured;
  document.getElementById('productTrending').checked = !!product.trending;

  currentColors = Array.isArray(product.colors) ? [...product.colors] : [];
  renderColorSwatches();

  if (product.image) {
    document.getElementById('imagePreview').src = formatImageUrl(product.image);
    document.getElementById('imagePreview').style.display = 'block';
    document.getElementById('imagePreviewPlaceholder').style.display = 'none';
  } else {
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreviewPlaceholder').style.display = 'block';
  }

  document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
  openModal('productModal');
}

function validateForm() {
  let isValid = true;

  const requiredIds = ['productName', 'productPrice', 'productCategory', 'productImage'];
  requiredIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.closest('.form-group').classList.add('error');
      isValid = false;
    } else {
      el.closest('.form-group').classList.remove('error');
    }
  });

  if (currentColors.length === 0) {
    document.getElementById('colorError').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('colorError').style.display = 'none';
  }

  return isValid;
}

async function handleProductSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    showToast('warning', 'Validation Error', 'Please fill all required fields, including at least one color.');
    return;
  }

  const btn = document.getElementById('modalSubmitBtn');
  const txt = document.getElementById('modalSubmitText');
  const originalText = txt.textContent;

  btn.disabled = true;
  txt.innerHTML = 'Saving...';

  try {
    const data = {
      name: document.getElementById('productName').value.trim(),
      price: Number(document.getElementById('productPrice').value),
      category: document.getElementById('productCategory').value,
      description: document.getElementById('productDescription').value.trim(),
      image: formatImageUrl(document.getElementById('productImage').value.trim()),
      colors: currentColors,
      featured: document.getElementById('productFeatured').checked,
      trending: document.getElementById('productTrending').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (editingProductId) {
      await productsRef.doc(editingProductId).update(data);
      showToast('success', 'Product Updated', `"${data.name}" has been updated.`);
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await productsRef.add(data);
      showToast('success', 'Product Added', `"${data.name}" has been added.`);
    }

    closeModals();
    loadProducts();
  } catch (err) {
    console.error('Save error', err);
    showToast('error', 'Error', 'Failed to save product.');
  } finally {
    btn.disabled = false;
    txt.innerHTML = originalText;
  }
}

// ── Delete ──
function confirmDelete(id, name) {
  document.getElementById('confirmText').textContent = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
  document.getElementById('confirmDeleteBtn').onclick = () => executeDelete(id, name);
  openModal('confirmModal');
}

async function executeDelete(id, name) {
  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    await productsRef.doc(id).delete();
    showToast('success', 'Deleted', `"${name}" removed successfully.`);
    closeModals();
    loadProducts();
  } catch (err) {
    console.error('Delete err', err);
    showToast('error', 'Error', 'Failed to delete product.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete';
  }
}

function formatImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:')) return url; // Don't format Base64 Data URLs
  if (url.startsWith('http') || url.startsWith('/')) return url;
  if (url.startsWith('../')) return url.substring(2);
  return '/' + url;
}
