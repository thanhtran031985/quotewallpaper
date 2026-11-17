# 12-eas-build — Development build và bản cài độc lập qua EAS

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ3
- Phụ thuộc: 08
- Nhánh git: feat/12-eas-build

## Mục tiêu
- Có app độc lập (icon, tên riêng) cài trên iPhone không cần Expo Go.

## Phạm vi
- `eas.json` profile development, preview (internal distribution).
- Icon, splash (người dùng cung cấp hoặc agent đề xuất), tên hiển thị.
- Hướng dẫn: đăng ký thiết bị (`eas device:create`), build, cài qua link.
- Ghi rõ yêu cầu tài khoản Apple Developer; agent không tự chạy build tốn quota.

## Ngoài phạm vi
- Phát hành App Store, TestFlight.

## Thiết kế
- designs/reference/prototype.html — —

## PRD liên quan
- docs/PRD.md mục A, G

## Các bước

### Bước 1 — Cấu hình EAS
- Làm: eas.json, app.json.
- Test viết trước: —
- Kiểm tra: `npx expo-doctor`.

### Bước 2 — Icon + splash
- Làm: Tài nguyên.
- Test viết trước: —
- Kiểm tra: Xem trong Expo Go.

### Bước 3 — Hướng dẫn build
- Làm: docs/BUILD.md.
- Test viết trước: —
- Kiểm tra: Người dùng chạy `eas build --profile preview --platform ios` và cài thử.

## Chấp nhận khi
- [ ] App cài trên iPhone, mở từ icon riêng, dữ liệu hoạt động như Expo Go.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.
