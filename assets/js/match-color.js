// ============================================================
// UNIC Furnitures — AI Color Match Logic
// ============================================================

const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewImg = document.getElementById('previewImg');
const loader = document.getElementById('loader');
const resultsArea = document.getElementById('resultsArea');
const colorPaletteContainer = document.getElementById('colorPalette');
const recommendationsGrid = document.getElementById('recommendationsGrid');
const noResultsMsg = document.getElementById('noResultsMsg');

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImageUpload(file);
});

// File input handler
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleImageUpload(file);
});

function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    
    uploadArea.style.display = 'none';
    loader.style.display = 'flex';
    
    // Wait for image to load to extract colors
    previewImg.onload = () => {
      setTimeout(analyzeColors, 500); // slight delay for smooth UI transition
    };
  };
  reader.readAsDataURL(file);
}

function resetApp() {
  uploadArea.style.display = 'block';
  resultsArea.style.display = 'none';
  imageInput.value = '';
  previewImg.src = '';
  recommendationsGrid.innerHTML = '';
}

async function analyzeColors() {
  try {
    const colorThief = new ColorThief();
    
    // Get dominant color and palette (returns [R, G, B])
    const dominantRgb = colorThief.getColor(previewImg);
    const paletteRgb = colorThief.getPalette(previewImg, 4);
    
    const allExtractedColors = [dominantRgb, ...paletteRgb];
    
    // Display Swatches
    colorPaletteContainer.innerHTML = '';
    allExtractedColors.forEach((rgb, index) => {
      const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch-box';
      swatch.style.backgroundColor = hex;
      swatch.title = index === 0 ? `Dominant Color: ${hex}` : `Palette Color: ${hex}`;
      if (index === 0) {
        swatch.style.transform = 'scale(1.2)';
        swatch.style.border = '2px solid var(--primary-color, #c19a6b)';
      }
      colorPaletteContainer.appendChild(swatch);
    });

    // Fetch products and match
    await findMatchingProducts(allExtractedColors);

  } catch (error) {
    console.error("Color analysis failed:", error);
    alert("Could not analyze image. Please ensure the image is valid and try again.");
    resetApp();
  } finally {
    loader.style.display = 'none';
    resultsArea.style.display = 'block';
  }
}

// ── Color Math Helpers ──
function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

// Euclidean distance in RGB space (0 to ~441.67)
function colorDistance(rgb1, rgb2) {
  const rDiff = rgb1[0] - rgb2[0];
  const gDiff = rgb1[1] - rgb2[1];
  const bDiff = rgb1[2] - rgb2[2];
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// ── Matching Engine ──
async function findMatchingProducts(extractedColorsRgb) {
  try {
    const snapshot = await productsRef.get();
    let matches = [];

    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      
      // If product has no colors, we can't match it
      if (!product.colors || !Array.isArray(product.colors) || product.colors.length === 0) {
        return;
      }

      let bestScoreForProduct = 0;

      // Compare each product color against extracted colors
      product.colors.forEach(hexColor => {
        const prodRgb = hexToRgb(hexColor);
        
        extractedColorsRgb.forEach((extRgb, index) => {
          const dist = colorDistance(prodRgb, extRgb);
          
          // Max distance is ~441.67. Score = 100 - (dist / 4.4167)
          let matchPercent = 100 - (dist / 4.4167);
          if (matchPercent < 0) matchPercent = 0;
          
          // Weight: Dominant color matches get a boost
          if (index === 0) {
            matchPercent = Math.min(100, matchPercent * 1.15); 
          }

          if (matchPercent > bestScoreForProduct) {
            bestScoreForProduct = matchPercent;
          }
        });
      });

      // Only keep reasonably decent matches (e.g. > 65%)
      if (bestScoreForProduct > 65) {
        product.matchScore = Math.round(bestScoreForProduct);
        
        // Add badges logic
        if (product.matchScore >= 90) product.matchLabel = "Best Match";
        else if (product.matchScore >= 80) product.matchLabel = "Recommended";
        else if (product.trending) product.matchLabel = "Trending Match";
        else product.matchLabel = "Good Match";

        matches.push(product);
      }
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    renderRecommendations(matches);
  } catch (err) {
    console.error("Error fetching products for matching:", err);
    noResultsMsg.style.display = 'block';
    noResultsMsg.textContent = 'Error connecting to database. Please try again.';
  }
}

function renderRecommendations(matches) {
  recommendationsGrid.innerHTML = '';
  
  if (matches.length === 0) {
    noResultsMsg.style.display = 'block';
    noResultsMsg.textContent = 'No highly matching products found in this color range. Try a different photo or browse our collection!';
    return;
  }

  noResultsMsg.style.display = 'none';

  matches.forEach(product => {
    const colorsHtml = product.colors.map(c => 
      `<span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:${c}; border:1px solid #e5e7eb; margin-right:4px;"></span>`
    ).join('');

    const img = product.image || 'assets/placeholder.svg';

    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
      <div class="match-badge">⭐ ${product.matchScore}% ${product.matchLabel}</div>
      <img src="${img}" alt="${product.name}" class="match-card-img" onerror="this.src='assets/placeholder.svg'">
      <div class="match-card-body">
        <h4 style="font-size: 1.25rem; font-family: 'Playfair Display', serif; color: #111827; margin-bottom: 4px;">${product.name}</h4>
        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 12px;">${product.category}</p>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <strong style="color: var(--primary-color, #c19a6b); font-size: 1.25rem;">₹${product.price}</strong>
          <div style="display: flex;">${colorsHtml}</div>
        </div>
        
        <a href="products.html?id=${product.id}" style="display: block; text-align: center; background: #111827; color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 500; transition: background 0.2s;">View Details</a>
      </div>
    `;
    recommendationsGrid.appendChild(card);
  });
}
