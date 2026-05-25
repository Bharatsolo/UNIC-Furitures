/**
 * UNIC Home Furniture — Color Extractor Module
 * Uses color-thief library to extract dominant colors from room photos
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js
 */

// RGB to HEX conversion
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Extract dominant colors from an image element
function extractColors(imgElement, count = 5) {
    return new Promise((resolve, reject) => {
        try {
            const colorThief = new ColorThief();

            // Ensure image is loaded
            if (imgElement.complete && imgElement.naturalHeight !== 0) {
                const palette = colorThief.getPalette(imgElement, count);
                const colors = palette.map(rgb => ({
                    rgb: rgb,
                    hex: rgbToHex(rgb[0], rgb[1], rgb[2])
                }));
                resolve(colors);
            } else {
                imgElement.addEventListener('load', () => {
                    const palette = colorThief.getPalette(imgElement, count);
                    const colors = palette.map(rgb => ({
                        rgb: rgb,
                        hex: rgbToHex(rgb[0], rgb[1], rgb[2])
                    }));
                    resolve(colors);
                });
                imgElement.addEventListener('error', () => {
                    reject(new Error('Failed to load image for color extraction'));
                });
            }
        } catch (err) {
            reject(err);
        }
    });
}

// Render color swatches to a container element
function renderColorSwatches(colors, containerElement) {
    containerElement.innerHTML = '';
    colors.forEach(color => {
        const item = document.createElement('div');
        item.className = 'color-item';
        item.innerHTML = `
            <div class="color-dot" style="background-color: ${color.hex}"></div>
            <span class="color-hex">${color.hex.toUpperCase()}</span>
        `;
        containerElement.appendChild(item);
    });
}
