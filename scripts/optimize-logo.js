import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');
const logoPath = path.join(PUBLIC_DIR, 'Logo/Logo_Ruang360.webp');
const tempPath = path.join(PUBLIC_DIR, 'Logo/Logo_temp.webp');

async function optimizeLogo() {
    console.log('🚀 Optimizing Logo...');

    if (!fs.existsSync(logoPath)) {
        console.error('❌ Logo file not found');
        return;
    }

    try {
        // Generate to temp file first
        await sharp(logoPath)
            .resize(112, 112, { fit: 'cover' })
            .webp({ quality: 90 })
            .toFile(tempPath);

        console.log('✅ Generated temp file');

        // Introduce a small delay to ensure file handles are released
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Replace original
        try {
            fs.unlinkSync(logoPath);
            fs.renameSync(tempPath, logoPath);
            console.log('✅ Replaced original logo successfully');
        } catch (err) {
            // Fallback: fast copy if rename fails
            console.log('⚠️ Rename failed, trying copy...');
            fs.copyFileSync(tempPath, logoPath);
            fs.unlinkSync(tempPath);
            console.log('✅ Replaced original logo via copy');
        }

        // Check new size
        const stats = fs.statSync(logoPath);
        console.log(`📏 New Size: ${(stats.size / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

optimizeLogo();
