declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

describe('EAS Build & App Configuration (12-eas-build)', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('file app.json có đầy đủ cấu hình iOS, bundleIdentifier và quyền ảnh bằng tiếng Việt', () => {
    const appJsonPath = path.join(rootDir, 'app.json');
    expect(fs.existsSync(appJsonPath)).toBe(true);

    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const expo = appJson.expo;

    expect(expo.name).toBe('Quote Wallpaper');
    expect(expo.orientation).toBe('portrait');
    expect(expo.ios?.supportsTablet).toBe(false);
    expect(expo.ios?.bundleIdentifier).toBe('com.thanhtran.quotewallpaper');
    expect(expo.ios?.infoPlist?.NSPhotoLibraryUsageDescription).toBeTruthy();
    expect(expo.ios?.infoPlist?.NSPhotoLibraryAddUsageDescription).toBeTruthy();

    // Kiểm tra icon và splash file tồn tại
    const iconPath = path.join(rootDir, expo.icon);
    expect(fs.existsSync(iconPath)).toBe(true);

    const splashPlugin = expo.plugins?.find(
      (p: any) => Array.isArray(p) && p[0] === 'expo-splash-screen',
    );
    expect(splashPlugin).toBeTruthy();
    const splashImagePath = path.join(rootDir, splashPlugin[1].image);
    expect(fs.existsSync(splashImagePath)).toBe(true);
  });

  it('file eas.json tồn tại và có các build profiles preview (internal distribution) và development', () => {
    const easJsonPath = path.join(rootDir, 'eas.json');
    expect(fs.existsSync(easJsonPath)).toBe(true);

    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
    expect(easJson.cli?.version).toBeTruthy();
    expect(easJson.build?.preview).toBeDefined();
    expect(easJson.build?.preview?.distribution).toBe('internal');
    expect(easJson.build?.development).toBeDefined();
    expect(easJson.build?.development?.developmentClient).toBe(true);
  });

  it('file docs/BUILD.md tồn tại và hướng dẫn các lệnh build EAS độc lập', () => {
    const buildMdPath = path.join(rootDir, 'docs/BUILD.md');
    expect(fs.existsSync(buildMdPath)).toBe(true);

    const content = fs.readFileSync(buildMdPath, 'utf8');
    expect(content).toContain('eas build --profile preview --platform ios');
    expect(content).toContain('eas device:create');
    expect(content).toContain('Apple Developer');
  });
});
