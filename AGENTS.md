# Quote Wallpaper — Hướng dẫn cho agent (Antigravity)

File này luôn được nạp. Quy tắc theo vùng code ở `.agents/rules/` (tự nạp theo glob), quy trình lặp lại ở `.agents/skills/`.

## Dự án

Quote Wallpaper là ứng dụng **iOS** (chỉ iPhone, màn hình dọc) tạo hình nền từ **ảnh + danh ngôn + template**. Người dùng quản lý ba kho: **Ảnh** (ảnh tự chọn từ Photos + bộ ảnh mặc định), **Danh ngôn** (bộ mặc định + tự nhập), **Template** (mẫu có sẵn + mẫu tự tạo). Mỗi lần mở app, hệ thống **chọn ngẫu nhiên** 1 ảnh, 1 câu, 1 template trong các mục **đang bật** và hiển thị hình nền. Chế độ template: **Cố định** (luôn dùng 1 template) hoặc **Ngẫu nhiên**. Người dùng xem trước trên khung màn hình khóa rồi **lưu vào Ảnh**; có thể xuất nhiều hình vào album "Quote Wallpaper" để Phím tắt (Shortcuts) tự đặt hình nền.

- Không có đăng nhập, không có server, không có cloud. Toàn bộ dữ liệu nằm trên máy.
- Tài liệu: `docs/PRD.md` (nguồn yêu cầu), `designs/reference/prototype.html` (CHỈ ĐỌC — mẫu giao diện đối chiếu).

## Giới hạn iOS (không được hứa sai)

- App **không thể** tự đổi hình nền hệ thống. Không viết code, chữ hay task giả định điều này.
- Tự động đổi hình nền chỉ qua **Phím tắt**: app xuất ảnh vào album, người dùng tạo Tự động hóa "Tìm ảnh trong album → Lấy ngẫu nhiên → Đặt hình nền". App chỉ cung cấp hướng dẫn.
- Random chạy khi app **mở** hoặc **quay lại foreground** (AppState `active`), không chạy nền.

## Môi trường

- Máy dev **Windows**, Node LTS (≥ 20), không cần Mac trong giai đoạn phát triển.
- Chạy thử bằng **Expo Go** trên iPhone thật (cùng Wi-Fi, hoặc `npx expo start --tunnel`).
- Khi cần module không có trong Expo Go: dùng **development build** qua EAS (task 12), phải hỏi trước.
- Bản cài độc lập: **EAS Build** profile `preview` (internal distribution). Không phát hành App Store trong phạm vi hiện tại.
- Lệnh shell viết dạng PowerShell-compatible; đường dẫn dùng `expo-file-system` API, không hardcode.

## Stack

- Expo SDK (bản ổn định mới nhất lúc task 00), React Native, **TypeScript strict**.
- Điều hướng: `expo-router` (Tabs + Stack modal).
- State: `zustand` + middleware `persist` lưu vào `@react-native-async-storage/async-storage`.
- Ảnh: `expo-image-picker` (chọn), `expo-file-system` (chép vào thư mục app), `expo-image` (hiển thị), `expo-image-manipulator` (resize khi nhập).
- Xuất: `react-native-view-shot` (chụp canvas), `expo-media-library` (lưu vào Ảnh / album).
- Hiệu ứng: `expo-blur`, `expo-linear-gradient`, `react-native-reanimated`, `react-native-gesture-handler`.
- Font: `expo-font` (font đóng gói trong `assets/fonts/`).
- Khác: `expo-haptics`, `expo-crypto` (sinh id).
- Test: Jest (`jest-expo`) + `@testing-library/react-native`. Lint/type: ESLint (`eslint-config-expo`), Prettier, `tsc --noEmit`.
- Dùng `npx expo install <pkg>` để cài đúng version tương thích SDK.

## Cấu trúc mã

```
app/                 expo-router
  _layout.tsx        root: theme, font, gesture handler
  (tabs)/            index (Hôm nay), quotes, images, templates, settings
  preview.tsx        xem toàn màn hình + khung màn hình khóa + lưu
  quote-edit.tsx     sheet thêm/sửa danh ngôn
  template-edit/[id].tsx  trình tạo/sửa template
src/
  domain/            types.ts (Quote, WallpaperImage, Template, Settings), validate.ts
  engine/            hàm thuần: randomPick.ts, layout.ts (vị trí chữ, vùng an toàn), fitText.ts
  store/             useLibraryStore.ts, useSettingsStore.ts, migrations.ts
  services/          imageLibrary.ts, exportWallpaper.ts, seed.ts
  components/        WallpaperCanvas/, LockScreenOverlay, ListRow, Switch, EmptyState, ...
  templates/         builtin.ts (template có sẵn)
  theme/             tokens.ts, useTheme.ts
assets/              images/defaults/, fonts/, icon, splash
data/                quotes.default.json
designs/reference/   prototype.html (CHỈ ĐỌC)
docs/                PRD.md, tasks/
scripts/             tasks-dashboard.mjs
tests/               unit/, components/
```

## Cấu trúc task

`docs/tasks/README.md` là bảng tổng (cột #, Task, Trạng thái, Phụ thuộc, Nhánh git). Mỗi task `docs/tasks/NN-slug/` có `task.md` (yêu cầu, KHÔNG tự sửa), `progress.md` (agent cập nhật sau mỗi bước), `plan.md` (kế hoạch đã duyệt), `decisions.md`, `checklist.md` (test case, cập nhật trạng thái), `_archive/`. Nhánh `feat/NN-slug`. `docs/tasks/dashboard.html` sinh bởi `npm run tasks-dashboard`, không sửa tay.
Trạng thái: ⬜ chưa làm · 🔄 đang làm · ❓ có code chưa rà soát · ⚠️ khác task.md · ❌ thiếu · ✅ xong.

## Quy trình khi làm một task (chi tiết: skill lam-task)

- Mở phiên mới hoặc sau khi ngữ cảnh bị nén: đọc `docs/tasks/README.md` → `task.md` → `progress.md` → `decisions.md`, tiếp tục từ bước dở, không làm lại bước ✅.
- Luôn lập **Implementation Plan** trước. Khi được duyệt: chép nguyên văn vào `plan.md`, tạo nhánh `feat/NN-slug`, đổi trạng thái 🔄.
- Làm đúng thứ tự các bước trong task.md. Viết test hành vi trước (thấy đỏ) rồi code cho xanh.
- Sau MỖI bước: chạy phần "Kiểm tra"; cập nhật progress.md và checklist.md; chạy `npm run tasks-dashboard`; báo cáo ngắn; đề xuất commit `NN-slug: step N — <mô tả>`; **DỪNG** chờ "continue". Chỉ commit khi được đồng ý.
- Khác task.md/PRD/thiết kế: ghi decisions.md. Mơ hồ hoặc mâu thuẫn: DỪNG và hỏi. Chi tiết nhỏ: tự suy ra từ PRD, báo đã suy ra gì.
- Không cài package ngoài danh sách Stack khi chưa hỏi.
- Xong task: chạy skill dong-task.

## Quy tắc code (mọi task)

- Logic nghiệp vụ chỉ ở `src/engine` (hàm thuần, không import React/Expo) và `src/services`. Component chỉ đọc store, gọi action/service, render.
- Kiểu dữ liệu chỉ khai báo ở `src/domain/types.ts`. Không dùng `any`. Dữ liệu từ AsyncStorage/JSON phải qua `validate.ts` trước khi dùng.
- Đổi cấu trúc dữ liệu đã persist: tăng `version` của store và viết hàm migrate trong `src/store/migrations.ts`, có test. Không làm mất dữ liệu người dùng.
- Ảnh người dùng chọn phải **chép vào `documentDirectory/images/`** và lưu đường dẫn tương đối; không lưu URI tạm của picker.
- Xóa ảnh khỏi kho: xóa cả file trong thư mục app. Không bao giờ xóa ảnh trong thư viện Ảnh của iPhone.
- Template có sẵn (`builtin`) chỉ đọc: không sửa, không xóa; được **Nhân bản** để tạo template riêng.
- Lỗi không được làm crash app: service trả `Result<T> = { ok: true, data } | { ok: false, code, message }`, message tiếng Việt có dấu.
- Chỉ dùng token trong `src/theme/tokens.ts`; không viết mã màu/khoảng cách trực tiếp trong màn hình. Ngoại lệ: style của **template hình nền** (màu chữ, nền chữ) là dữ liệu của template.
- Chỉ sửa trong phạm vi task. Không thêm tính năng ngoài task.md.
- Trước khi báo xong: `npm run typecheck`, `npm run lint`, `npm test` xanh; task có giao diện thêm ảnh chụp màn hình từ Expo Go (sáng và tối).

## Quy tắc nghiệp vụ cốt lõi

- **Random:** chỉ chọn trong mục `enabled`. Thiếu ảnh/câu/template đang bật → không random, hiện EmptyState chỉ rõ thiếu gì và nút đi tới tab tương ứng.
- **Không lặp liên tiếp** (mặc định bật): loại id vừa hiển thị của từng loại, trừ khi loại đó chỉ có 1 mục bật.
- **Chế độ Cố định:** luôn dùng `fixedTemplateId`; nếu template đó bị xóa → chuyển về template có sẵn đầu tiên và báo cho người dùng.
- **Khi nào random:** mở app và mỗi lần AppState chuyển sang `active` (nếu bật "Đổi khi mở ứng dụng"); nút "Đổi ngẫu nhiên"; lần chọn hiện tại được lưu để mở lại vẫn thấy khi tắt cài đặt.
- **Ghim (khóa):** người dùng có thể ghim ảnh, câu hoặc template hiện tại; mục đã ghim giữ nguyên khi random.
- **Danh ngôn:** 1–220 ký tự sau khi trim; tác giả tùy chọn ≤ 60 ký tự; chặn trùng nội dung (so sánh sau chuẩn hóa khoảng trắng, không phân biệt hoa thường). Bộ mặc định gắn `source: 'default'`, được tắt nhưng không bị xóa vĩnh viễn (có "Khôi phục mặc định").
- **Xuất ảnh:** kích thước = kích thước màn hình theo pixel (`width × height × scale`), JPEG chất lượng 0.92. Ảnh xuất **không** chứa đồng hồ, khung vùng đồng hồ, viền chọn hay bất kỳ control nào.
- **Vùng đồng hồ:** chữ không được đặt trong vùng đồng hồ màn hình khóa (`engine/layout.ts`). Template tự tạo bị kéo chữ vào vùng này thì tự đẩy ra và báo nhẹ.
- **Chữ dài:** tự giảm cỡ chữ (fitText) tới cỡ tối thiểu của template; vẫn không vừa thì cắt bằng dấu "…" trong preview và cảnh báo trước khi lưu.
- Quyền Ảnh: chỉ xin khi người dùng bấm hành động cần quyền; bị từ chối thì hiện hướng dẫn mở Cài đặt, không xin lặp.

## Giao diện (chi tiết: rule ui-rn)

Chuẩn Apple HIG cho iPhone dọc: Large Title, tab bar nổi kính mờ, nhóm danh sách dạng inset grouped, sheet có grabber, vùng chạm ≥ 44pt, tôn trọng safe area và Dynamic Island. Hỗ trợ **Sáng / Tối / Theo hệ thống**. Tiếng Việt có dấu; giữ thuật ngữ Template. Không emoji, không dấu chấm than. Mỗi danh sách có 4 trạng thái: đang tải, trống, lỗi (giữ dữ liệu cũ + Thử lại), có dữ liệu. Mẫu đối chiếu: `designs/reference/prototype.html`.

## Bảo mật và quyền riêng tư

Không gửi dữ liệu ra ngoài máy, không analytics, không quảng cáo. Không thêm SDK theo dõi. Chuỗi mô tả quyền (`NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`) khai báo trong `app.json` bằng tiếng Việt.

## Lệnh

- `npm install`, `npx expo start` (dev, quét QR bằng Expo Go), `npx expo start --tunnel`.
- `npm test`, `npm run test:watch`, `npm run typecheck`, `npm run lint`, `npm run format`.
- `npm run tasks-dashboard` (sinh `docs/tasks/dashboard.html`).
- `npx expo-doctor` (kiểm tra phụ thuộc).
- Build: `eas build --profile preview --platform ios` (task 12, cần tài khoản Apple Developer).
