/**
 * UNIC Home Furniture — Gemini API Module
 * Analyzes room photos using Google Gemini 2.5 Flash
 * Free tier: 1500 requests/day
 */

// IMPORTANT: Paste your free Gemini API key below. Get it free from https://aistudio.google.com — Click Get API Key — No billing required for free tier — 1500 requests per day free
const GEMINI_API_KEY = localStorage.getItem('GEMINI_API_KEY') || 'AIzaSyAYGKFGFmmE6Q0gUvKPU0fdx1Hy9J5blwc'; // <-- Paste your API key here
console.log('Active Gemini API Key:', GEMINI_API_KEY);

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Analyze a room image using Gemini API
 * @param {string} base64Image - Base64 encoded image (without data URI prefix)
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @param {Array} extractedColors - Array of {hex, rgb} color objects
 * @returns {Promise<Object>} - { roomAnalysis: string, suggestions: Array }
 */
async function analyzeRoom(base64Image, mimeType, extractedColors) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not set. Please add your API key in gemini-api.js');
    }

    const colorList = extractedColors.map(c => c.hex).join(', ');

    const prompt = `You are an interior design expert and furniture consultant for UNIC Home Furniture store. Look at this room photo carefully. Identify the dominant wall colors and the overall room mood. The extracted dominant colors from this room are: ${colorList}.

Then suggest the best matching furniture from exactly these 6 categories: L Type Sofas, Recliners, Boss Chair, Lounger, Sofa Cum Bed, Designer Cots.

For each category give one specific suggestion with: suggested color for the furniture (always return descriptive, human-readable color names like 'Cream', 'Charcoal Grey', 'Olive Green', etc. — never return raw hex codes or '#' characters), suggested material or fabric type, reason why it matches this room, and a match score out of 10.

Also write one overall room analysis paragraph at the top describing the room's color palette, mood, and design style.

Return your response strictly as a JSON object with this exact structure:
{"roomAnalysis": "string", "suggestions": [{"category": "string", "suggestedColor": "string", "material": "string", "reason": "string", "matchScore": number}]}

Return ONLY the raw JSON object. No markdown formatting, no code blocks, no backticks, no extra text before or after. Just the pure JSON.`;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            thinkingConfig: {
                thinkingBudget: 0
            }
        }
    };

    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1500; // Start with 1.5 seconds delay

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || `API error: ${response.status}`;
                
                // Retry on rate limits (429) or temporary server overload (503/500)
                if ((response.status === 429 || response.status === 503 || response.status === 500) && attempts < maxAttempts - 1) {
                    attempts++;
                    console.warn(`Gemini API busy (Status ${response.status}). Retrying in ${delay}ms... (Attempt ${attempts} of ${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                    continue;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                throw new Error('No response content from Gemini API');
            }

            // Clean response — strip any accidental markdown/code blocks
            let cleanedText = textContent.trim();
            // Remove markdown code block wrappers if present
            cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '');
            cleanedText = cleanedText.replace(/\s*```$/i, '');
            // Remove any leading/trailing backticks
            cleanedText = cleanedText.replace(/^`+|`+$/g, '');
            cleanedText = cleanedText.trim();

            const result = JSON.parse(cleanedText);

            // Validate structure
            if (!result.roomAnalysis || !Array.isArray(result.suggestions)) {
                throw new Error('Invalid response structure from Gemini');
            }

            return result;
        } catch (error) {
            // Retry on network errors
            if (attempts < maxAttempts - 1 && !(error instanceof SyntaxError)) {
                attempts++;
                console.warn(`Request failed: ${error.message}. Retrying in ${delay}ms... (Attempt ${attempts} of ${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            if (error instanceof SyntaxError) {
                throw new Error('Could not parse AI response. Please try again with a clearer photo.');
            }
            throw error;
        }
    }
}
