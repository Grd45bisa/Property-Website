import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');
const logoPath = path.join(PUBLIC_DIR, 'Logo/Logo_Ruang360.webp');
const newLogoPath = path.join(PUBLIC_DIR, 'Logo/Logo_Ruang360_small.webp');

async function createSmallLogo() {
    console.log('🚀 Creating small logo...');

    if (!fs.existsSync(logoPath)) {
        console.error('❌ Original logo not found');
        return;
    }

    try {
        await sharp(logoPath)
            .resize(112, 112, { fit: 'cover' })
            .webp({ quality: 90 })
            .toFile(newLogoPath);

        const stats = fs.statSync(newLogoPath);
        console.log(`✅ Created ${newLogoPath}`);
        console.log(` Size: ${(stats.size / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createSmallLogo();
