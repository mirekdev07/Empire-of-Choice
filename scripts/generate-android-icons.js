const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const inputIcon = path.join(__dirname, '..', 'src', 'icon.png');
const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

async function generateIcons() {
  console.log('Generating Android icons from:', inputIcon);

  for (const [folder, size] of Object.entries(sizes)) {
    const outputDir = path.join(androidResDir, folder);

    // Generate square icon (ic_launcher.png)
    const launcherPath = path.join(outputDir, 'ic_launcher.png');
    await sharp(inputIcon)
      .resize(size, size)
      .png()
      .toFile(launcherPath);
    console.log(`Created: ${launcherPath} (${size}x${size})`);

    // Generate round icon (ic_launcher_round.png)
    const roundPath = path.join(outputDir, 'ic_launcher_round.png');

    // Create circular mask
    const circleMask = Buffer.from(
      `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
    );

    await sharp(inputIcon)
      .resize(size, size)
      .composite([{
        input: circleMask,
        blend: 'dest-in'
      }])
      .png()
      .toFile(roundPath);
    console.log(`Created: ${roundPath} (${size}x${size} round)`);

    // Generate foreground icon (ic_launcher_foreground.png) - slightly larger for adaptive icons
    const foregroundPath = path.join(outputDir, 'ic_launcher_foreground.png');
    const foregroundSize = Math.round(size * 1.5); // Foreground needs padding for adaptive icon

    // Create image with padding for adaptive icon safe zone
    const padding = Math.round(size * 0.25);
    await sharp(inputIcon)
      .resize(size, size)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(foregroundPath);
    console.log(`Created: ${foregroundPath} (foreground)`);
  }

  console.log('\nDone! Android icons generated successfully.');
  console.log('Now rebuild the APK with: npx cap sync android && cd android && ./gradlew assembleDebug');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
