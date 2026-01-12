import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Define the base path for public assets
const PUBLIC_DIR = path.resolve('public');

const images = [
    // Hero Image (Priority 1)
    {
        input: 'Hero/photo_hero.avif',
        width: 1920,
        height: 1080,
        quality: 70, // Start higher, user said 70-75%
        format: 'avif',
        targetSize: 150 * 1024
    },

    // Portfolio Photo 1 (Big reduction needed)
    {
        input: 'portofolio/photo1.avif',
        width: 1680,
        height: 1120,
        quality: 70,
        format: 'avif',
        targetSize: 100 * 1024
    },

    // Portfolio Photo 2
    {
        input: 'portofolio/photo2.avif',
        width: 1054,
        height: 784,
        quality: 65,
        format: 'avif',
        targetSize: 45 * 1024
    },

    // Portfolio Photo 3
    {
        input: 'portofolio/photo3.avif',
        width: 800,
        height: 600,
        quality: 65,
        format: 'avif',
        targetSize: 40 * 1024
    },

    // Portfolio Photo 4
    {
        input: 'portofolio/photo4.avif',
        width: 1152,
        height: 784,
        quality: 65,
        format: 'avif',
        targetSize: 40 * 1024
    },

    // Portfolio Photo 5
    {
        input: 'portofolio/photo5.avif',
        width: 1144,
        height: 784,
        quality: 65,
        format: 'avif',
        targetSize: 40 * 1024
    },

    // Logo (Resize)
    {
        input: 'Logo/Logo_Ruang360.webp',
        width: 112,
        height: 112,
        quality: 90,
        format: 'webp',
        targetSize: 3 * 1024
    }
];

async function optimizeImages() {
    console.log('🚀 Starting Image Optimization...\n');
    let totalSaved = 0;

    for (const img of images) {
        const inputPath = path.join(PUBLIC_DIR, img.input);
        const outputPath = inputPath.replace(/\.(avif|webp|png|jpg)$/, `-optimized.${img.format}`);

        try {
            if (!fs.existsSync(inputPath)) {
                console.error(`❌ File not found: ${img.input}`);
                continue;
            }

            const originalStats = fs.statSync(inputPath);
            const originalSize = originalStats.size;

            // Optimize
            await sharp(inputPath)
                .resize(img.width, img.height, {
                    fit: 'cover',
                    withoutEnlargement: true
                })
            [img.format]({
                quality: img.quality,
                effort: 6 // Max compression effort
            })
                .toFile(outputPath);

            const newStats = fs.statSync(outputPath);
            const newSize = newStats.size;
            const saved = originalSize - newSize;
            totalSaved += saved;

            const savedPercent = ((saved / originalSize) * 100).toFixed(1);

            console.log(`✅ Optimized: ${img.input}`);
            console.log(`   Dimensions: ${img.width}x${img.height}`);
            console.log(`   Size: ${(originalSize / 1024).toFixed(2)} KB → ${(newSize / 1024).toFixed(2)} KB`);
            console.log(`   Saved: ${(saved / 1024).toFixed(2)} KB (${savedPercent}%)`);
            console.log(`   Target: < ${(img.targetSize / 1024).toFixed(2)} KB [${newSize <= img.targetSize ? 'PASS' : 'FAIL'}]\n`);

            // Replace original file if optimization was successful and file is smaller
            if (saved > 0) {
                fs.unlinkSync(inputPath);
                fs.renameSync(outputPath, inputPath);
                console.log(`   🔄 Replaced original file\n`);
            } else {
                // If optimized file is bigger (unlikely with resize), keep original
                fs.unlinkSync(outputPath);
                console.log(`   ⚠️ Optimized file was larger, kept original\n`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${img.input}:`, error);
        }
    }

    // Favicon conversion (ico -> webp)
    // Note: Browsers support webp icons, but .ico is still good for compatibility. 
    // User requested conversion to webp 32x32 < 1KB
    try {
        const icoPath = path.join(PUBLIC_DIR, 'Logo/Logo_Ruang360.ico');
        const webpIconPath = path.join(PUBLIC_DIR, 'Logo/favicon-32x32.webp');

        if (fs.existsSync(icoPath)) {
            // Sharp might not handle multi-size ico well, but often can read proper caching
            // If sharp fails on ICO, we might skip. But usually it works for reading.
            // Or we can generate from the WebP source if available.
            // Let's use the big webp logo as source for better quality downscaling
            const sourceForIcon = path.join(PUBLIC_DIR, 'Logo/Logo_Ruang360.webp');

            await sharp(sourceForIcon)
                .resize(32, 32)
                .webp({ quality: 80 })
                .toFile(webpIconPath);

            const iconStats = fs.statSync(webpIconPath);
            console.log(`✅ Generated Favicon: favicon-32x32.webp`);
            console.log(`   Size: ${(iconStats.size / 1024).toFixed(2)} KB`);
            // We don't replace the .ico as it might be needed for legacy, but we successfully created the requested asset.
        }
    } catch (err) {
        console.error("Error generating favicon:", err);
    }

    console.log(`🎉 Optimization Complete!`);
    console.log(`💰 Total Space Saved: ${(totalSaved / 1024).toFixed(2)} KiB`);
}

optimizeImages();
