const fs = require('fs');
const path = require('path');

// Root files
const rootFiles = ['index.html', 'products.html', 'match-my-room.html', 'match-color.html', 'contact.html'];
rootFiles.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        content = content.replace('class="logo">UNIC <span>Furniture</span></a>', 'class="logo"><img src="Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>');
        fs.writeFileSync(f, content, 'utf8');
    }
});

// Categories files
const catDir = 'categories';
if (fs.existsSync(catDir)) {
    fs.readdirSync(catDir).forEach(f => {
        if (f.endsWith('.html')) {
            const filepath = path.join(catDir, f);
            let content = fs.readFileSync(filepath, 'utf8');
            content = content.replace('class="logo">UNIC <span>Furniture</span></a>', 'class="logo"><img src="../Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>');
            fs.writeFileSync(filepath, content, 'utf8');
        }
    });
}

// Admin files
const adminFiles = ['admin/dashboard.html', 'admin/login.html', 'admin/register.html'];
adminFiles.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        // For dashboard
        content = content.replace('class="logo">UNIC <span>Furniture</span></a>', 'class="logo"><img src="../Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>');
        // For login / register
        content = content.replace('class="logo" style="display:inline-block; font-family:\'Playfair Display\',serif; font-size: 2rem; color: #fff; text-decoration: none;">UNIC <span>Furniture</span></a>', 'class="logo" style="display:inline-flex; align-items: center; gap: 12px; font-family:\'Playfair Display\',serif; font-size: 2rem; color: #fff; text-decoration: none;"><img src="../Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>');
        fs.writeFileSync(f, content, 'utf8');
    }
});

console.log("All logos updated successfully via Node.js!");
