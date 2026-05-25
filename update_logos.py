import os

# Root files
root_files = ['index.html', 'products.html', 'match-my-room.html', 'match-color.html', 'contact.html']
for f in root_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        content = content.replace('class="logo">UNIC <span>Furniture</span></a>', 'class="logo"><img src="Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

# Categories files
cat_dir = 'categories'
if os.path.exists(cat_dir):
    for f in os.listdir(cat_dir):
        if f.endswith('.html'):
            filepath = os.path.join(cat_dir, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            content = content.replace('class="logo">UNIC <span>Furniture</span></a>', 'class="logo"><img src="../Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>')
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(content)

# Admin files
admin_files = ['admin/dashboard.html', 'admin/login.html', 'admin/register.html']
for f in admin_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        # For dashboard
        content = content.replace('class="logo">UNIC <span>Furniture</span></a>', 'class="logo"><img src="../Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>')
        # For login / register
        content = content.replace('class="logo" style="display:inline-block; font-family:\'Playfair Display\',serif; font-size: 2rem; color: #fff; text-decoration: none;">UNIC <span>Furniture</span></a>', 'class="logo" style="display:inline-flex; align-items: center; gap: 12px; font-family:\'Playfair Display\',serif; font-size: 2rem; color: #fff; text-decoration: none;"><img src="../Logo.png" alt="UNIC Logo" class="logo-img"> UNIC <span>Furniture</span></a>')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("All logos updated successfully!")
