# Kế hoạch thực hiện — 12-eas-build

## Mục tiêu
Cung cấp cấu hình EAS (`eas.json`), xác thực cấu hình `app.json` và tài nguyên icon/splash, cùng tài liệu hướng dẫn `docs/BUILD.md` để người dùng có thể tạo bản build độc lập (Ad Hoc / Internal Distribution) cài trực tiếp lên iPhone không phụ thuộc vào Expo Go.

## Các bước thực hiện

### Bước 1 — Cấu hình EAS (`eas.json`)
- Tạo file `eas.json` với các build profiles:
  - `development`: cho development client (`developmentClient: true`, `distribution: internal`).
  - `preview`: cho bản cài độc lập ad-hoc/internal distribution (`distribution: internal`, `ios: { simulator: false }`).
  - `preview-simulator`: hỗ trợ chạy trên iOS Simulator nếu cần (`ios: { simulator: true }`).
  - `production`: sẵn sàng khi phát hành.
- Kiểm tra phụ thuộc và tính hợp lệ với `npx expo-doctor`.

### Bước 2 — Kiểm tra và tối ưu tài nguyên Icon + Splash (`app.json`)
- Đảm bảo `app.json` có đầy đủ:
  - `bundleIdentifier`: "com.thanhtran.quotewallpaper"
  - `userInterfaceStyle`: "automatic"
  - `infoPlist`: các thông điệp quyền ảnh bằng tiếng Việt chuẩn
  - Các plugin bắt buộc: `expo-router`, `expo-splash-screen`, `expo-image`, `expo-sharing`
- Viết unit test xác thực cấu hình `tests/unit/easBuildConfig.test.ts`.

### Bước 3 — Hướng dẫn build (`docs/BUILD.md`)
- Soạn thảo tài liệu `docs/BUILD.md` chi tiết bằng tiếng Việt:
  - Điều kiện tiên quyết: tài khoản Apple Developer, Expo account, iPhone thật.
  - Cài đặt EAS CLI: `npm install -g eas-cli`
  - Đăng ký thiết bị (UDID): `eas device:create`
  - Khởi tạo và liên kết: `eas init`
  - Lệnh build preview: `eas build --profile preview --platform ios`
  - Cài đặt app lên iPhone qua link/QR code của EAS.
  - Hướng dẫn tin cậy chứng chỉ trên iOS (Cài đặt > Cài đặt chung > Quản lý VPN & Thiết bị).
- Chạy toàn bộ test, typecheck, lint, cập nhật dashboard và đóng task.
