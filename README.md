# UNIC Home Furniture

A premium, zero-backend furniture website with an AI-powered "Match My Room" feature built with pure HTML, CSS, and Vanilla JavaScript.

## Architecture & Tech Stack

This project uses **no backend, no database, and no server**. Everything runs directly in the customer's browser.

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), Vanilla JavaScript
- **AI Analysis**: Gemini API (gemini-2.0-flash model via Google AI Studio)
- **Image Generation**: Pollinations AI (Free text-to-image API)
- **Color Extraction**: color-thief.js (via CDN)
- **Hosting**: Cloudflare Pages (Recommended)
- **Image Storage**: Cloudflare Images (Recommended)

## File Structure

```text
UNIC Furnitures/
├── index.html                  # Homepage
├── products.html               # All products grid with filtering
├── match-my-room.html          # AI Color Match feature
├── contact.html                # Contact and Enquiry
├── categories/                 # Individual category pages
│   ├── l-type-sofas.html
│   ├── recliners.html
│   ├── boss-chair.html
│   ├── lounger.html
│   ├── sofa-cum-bed.html
│   └── designer-cots.html
└── assets/
    ├── css/
    │   └── style.css           # Complete design system & responsive layout
    ├── js/
    │   ├── color-extractor.js  # Wrapper for color-thief.js
    │   ├── gemini-api.js       # Handles communication with Google Gemini
    │   └── image-gen.js        # Handles Pollinations AI and download logic
    └── images/                 # Local image assets
```

## Setup & Pre-Launch Checklist

Before launching the website, you must complete the following steps by searching for the `TODO` comments in the codebase.

### 1. Configure the Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com) and sign in with a Google account.
2. Click **Get API Key** and create a new free API key.
3. Open `assets/js/gemini-api.js`.
4. Paste the API key into the `GEMINI_API_KEY` variable on line 2.

### 2. Update Contact Information
Search for `+91XXXXXXXXXX` in all HTML files (press Ctrl+Shift+F in your code editor) and replace it with your actual WhatsApp Business number. Make sure to include the country code without the `+` in the URL links (e.g., `919876543210`).

Search for `[Your Street Address]` to update the shop address in `contact.html` and the footer of every page.

### 3. Replace Placeholder Images with Real Product Photos
1. Upload your actual furniture photos to **Cloudflare Images** (or any image hosting service).
2. Get the public delivery URLs (format: `https://imagedelivery.net/YOUR-ACCOUNT-ID/IMAGE-ID/public`).
3. Search for `https://placehold.co/` in all HTML files.
4. Replace the placeholder URLs in the `<img>` tags with your real Cloudflare Image URLs.

## Deployment to Cloudflare Pages (Free)

1. Create a free account on [Cloudflare](https://dash.cloudflare.com/sign-up).
2. Go to **Workers & Pages** > **Create application** > **Pages** > **Upload assets**.
3. Name your project (e.g., `unic-furniture`).
4. Drag and drop the entire `UNIC Furnitures` folder into the upload box.
5. Click **Deploy site**.
6. Cloudflare will give you a free URL like `unic-furniture.pages.dev`. You can also connect a custom domain (like `unicfurniture.in`) in the Custom Domains tab.

## Free Tier Limits

| Service | Limit | Expected Usage | Status |
|---------|-------|----------------|--------|
| Gemini API | 1,500 requests / day | ~40-100 per day | ✅ Extremely Safe |
| Pollinations AI | Unlimited | ~40-100 per day | ✅ Safe |
| Cloudflare Pages | Unlimited bandwidth | - | ✅ Safe |
| Cloudflare Images | 100,000 images | ~50-100 product photos | ✅ Safe |

## How the AI "Match My Room" Feature Works

1. Customer uploads a room photo or takes a live picture using the device camera.
2. `color-thief.js` runs purely in the browser to extract the top 5 dominant HEX colors from the image.
3. The image (base64) and the colors are sent to the **Gemini 2.0 Flash API**.
4. The API is given a strict prompt to act as an interior designer and return only a JSON object containing a room analysis and 6 matching furniture suggestions from the catalog.
5. The JSON response is parsed and displayed to the user.
6. A dynamic prompt is constructed based on the AI's suggestions and sent to the **Pollinations AI Image API**.
7. Pollinations generates a photorealistic 4K visualization of the room with the suggested furniture.
8. The customer can download the design directly to their device or enquire on WhatsApp.
# UNIC-Furitures
