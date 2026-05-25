/**
 * UNIC Home Furniture — Image Generation Module
 * Uses Pollinations AI free API for room visualization
 * No API key required
 */

/**
 * Generate a room visualization image using Pollinations AI
 * @param {string} roomAnalysis - Room analysis text from Gemini
 * @param {Array} suggestions - Furniture suggestions array from Gemini
 * @returns {string} - URL of the generated image
 */
function generateRoomImageURL(roomAnalysis, suggestions) {
    // Build dynamic prompt from AI suggestions
    const furnitureDetails = suggestions.map(s => {
        const cleanColor = s.suggestedColor.replace(/#/g, '');
        return `a ${cleanColor.toLowerCase()} ${s.category.toLowerCase()} in ${s.material.toLowerCase()}`;
    }).join(', ');

    const prompt = `A beautiful modern Indian living room interior design photograph featuring ${furnitureDetails}. The room has warm lighting, elegant decor, premium furniture arrangement, photorealistic, interior design magazine quality, 4K resolution, no people, no text, no watermark`;

    const encodedPrompt = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`;
}

/**
 * Download an image to the user's device
 * Handles cross-origin restrictions with fallback for iOS Safari
 * @param {string} imageUrl - URL of the image to download
 * @param {string} filename - Desired filename for download
 */
function downloadImage(imageUrl, filename = 'UNIC-My-Room-Design.jpg') {
    // Try using fetch + blob for cross-origin download
    fetch(imageUrl, { mode: 'cors' })
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        })
        .catch(() => {
            // Fallback: try direct download link
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // If download attribute not supported (iOS Safari), open in new tab
            if (!('download' in document.createElement('a'))) {
                window.open(imageUrl, '_blank');
            }

            // Show tooltip
            const tooltip = document.getElementById('downloadTooltip');
            if (tooltip) {
                tooltip.style.display = 'block';
            }
        });
}

/**
 * Load generated image into a container with loading state
 * @param {string} imageUrl - URL of the generated image
 * @param {HTMLElement} container - Container element for the image
 * @param {HTMLElement} loadingText - Loading text element to hide when done
 * @returns {Promise} - Resolves when image is loaded
 */
function loadGeneratedImage(imageUrl, container, loadingText) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            if (loadingText) loadingText.style.display = 'none';
            // Remove any existing image
            const existingImg = container.querySelector('img');
            if (existingImg) existingImg.remove();
            container.appendChild(img);
            resolve(img);
        };
        img.onerror = () => {
            if (loadingText) loadingText.textContent = 'Could not generate image. Please try again.';
            reject(new Error('Failed to load generated image'));
        };
        img.src = imageUrl;
        img.alt = 'AI Generated Room Visualization by UNIC Furniture';
        img.style.width = '100%';
    });
}
