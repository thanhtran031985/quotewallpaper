# PRD — Quote Wallpaper (iOS)

Phiên bản 1.0 · Nền tảng: iPhone (iOS, dọc) · Code: Expo + React Native + TypeScript · Agent: Antigravity

## A. Tổng quan

### A1. Mục tiêu
Mỗi lần mở app, người dùng thấy một hình nền mới ghép từ **ảnh + danh ngôn + template** chọn ngẫu nhiên trong kho của mình, xem trước trên khung màn hình khóa và lưu vào Ảnh trong vài giây. Có thể xuất hàng loạt để Phím tắt tự đổi hình nền mỗi ngày.

### A2. Người dùng
Một người dùng cá nhân trên một iPhone. Không đăng nhập, không đồng bộ.

### A3. Giới hạn nền tảng
- App không tự đặt hình nền hệ thống; người dùng đặt thủ công từ Ảnh hoặc qua Phím tắt.
- Random chỉ chạy khi app mở/quay lại foreground.

### A4. Ngoài phạm vi phiên bản này
Android, iPad, Apple Watch, widget, iCloud sync, đăng nhập, AI sinh danh ngôn/ảnh, chia sẻ cộng đồng, mua trong app, phát hành App Store.

## B. Khái niệm dữ liệu

```ts
type Id = string;

interface Quote {
  id: Id; text: string; author?: string;
  enabled: boolean; favorite: boolean;
  source: 'default' | 'user';
  createdAt: string; updatedAt: string;
}

interface WallpaperImage {
  id: Id; name: string;
  source: 'default' | 'user';
  uri: string;            // default: require asset key; user: đường dẫn tương đối trong documentDirectory/images/
  width: number; height: number;
  focalPoint: { x: number; y: number }; // 0–1, vùng ưu tiên khi cắt ảnh theo tỉ lệ màn hình
  enabled: boolean; createdAt: string;
}

interface TemplateStyle {
  text: {
    fontFamily: 'Serif' | 'Sans' | 'Rounded' | 'Mono' | 'Handwriting';
    fontWeight: '400' | '500' | '600' | '700' | '800';
    italic: boolean; uppercase: boolean;
    sizePct: number;      // cỡ chữ theo % chiều rộng màn hình
    minSizePct: number;   // cỡ tối thiểu khi fitText
    lineHeight: number; letterSpacing: number;
    color: string; align: 'left' | 'center' | 'right';
    shadow: boolean;
  };
  author: { show: boolean; sizeRatio: number; prefix: '—' | '–' | '' };
  box: {                  // khối chứa chữ
    xPct: number; yPct: number; widthPct: number;   // vị trí tâm theo % màn hình
    anchor: 'top' | 'center' | 'bottom';
    background: 'none' | 'solid' | 'blur' | 'paper';
    backgroundColor: string; backgroundOpacity: number;
    radius: number; padding: number; borderLeft: boolean;
  };
  overlay: {              // lớp phủ lên ảnh
    type: 'none' | 'solid' | 'gradient-bottom' | 'gradient-left' | 'vignette';
    color: string; opacity: number;
  };
  image: { blur: number; brightness: number }; // blur 0–20, brightness -0.5–0.5
  frame: { show: boolean; color: string; widthPct: number };
}

interface Template {
  id: Id; name: string;
  source: 'builtin' | 'user';
  style: TemplateStyle;
  enabled: boolean;       // tham gia random khi templateMode = 'random'
  createdAt: string; updatedAt: string;
}

interface Selection { imageId: Id; quoteId: Id; templateId: Id; pickedAt: string }

interface Settings {
  templateMode: 'fixed' | 'random';
  fixedTemplateId: Id;
  shuffleOnOpen: boolean;   // mặc định true
  noRepeat: boolean;        // mặc định true
  showAuthor: boolean;      // mặc định true
  favoritesBoost: boolean;  // mặc định false: câu yêu thích có trọng số x2
  appearance: 'system' | 'light' | 'dark';
  exportAlbumName: string;  // mặc định "Quote Wallpaper"
}

interface AppState {
  version: number;
  current: Selection | null;
  pinned: { image: boolean; quote: boolean; template: boolean };
  history: Selection[];     // tối đa 50 mục gần nhất
}
```

## C. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|---|---|
| R1 | Random chọn độc lập 1 ảnh, 1 câu, 1 template trong các mục `enabled`. |
| R2 | Chế độ Cố định: template = `fixedTemplateId` (bất kể `enabled`). |
| R3 | `noRepeat`: loại id vừa dùng của từng loại khi loại đó có ≥ 2 mục bật. |
| R4 | Mục đang ghim giữ nguyên khi random. Ghim reset khi mục đó bị tắt hoặc xóa. |
| R5 | Thiếu mục bật ở loại nào → không random, EmptyState nêu rõ loại thiếu, nút tới tab tương ứng. |
| R6 | `shuffleOnOpen`: random khi khởi động và khi AppState chuyển `background → active`. Tắt thì hiển thị `current` đã lưu. |
| R7 | `favoritesBoost`: câu `favorite` có trọng số 2. |
| R8 | Danh ngôn: trim, gộp khoảng trắng; 1–220 ký tự; tác giả ≤ 60; chặn trùng (không phân biệt hoa thường). |
| R9 | Danh ngôn/ảnh mặc định không xóa được, chỉ tắt; "Khôi phục mặc định" bật lại toàn bộ mục mặc định và thêm lại mục mặc định thiếu. |
| R10 | Ảnh người dùng: chép vào `documentDirectory/images/`, resize cạnh dài tối đa 3000px, JPEG 0.9. Xóa ảnh = xóa file; không chạm ảnh gốc trong Photos. |
| R11 | Template builtin chỉ đọc; "Nhân bản" tạo template user tên "<Tên> (bản sao)". Xóa template đang là `fixedTemplateId` → đổi về builtin đầu tiên + thông báo. |
| R12 | Không được xóa template cuối cùng đang bật ở chế độ Ngẫu nhiên (giữ ≥ 1). |
| R13 | Vùng đồng hồ: khối chữ không giao vùng đồng hồ (mặc định y 6%–30% chiều cao). Engine tự đẩy khối xuống dưới. |
| R14 | fitText: giảm cỡ từ `sizePct` tới `minSizePct`; vẫn tràn thì cắt "…" và đánh dấu `overflow=true` (cảnh báo trước khi lưu). |
| R15 | Xuất: kích thước pixel màn hình, JPEG 0.92, không có overlay màn hình khóa. Lưu vào Ảnh và album `exportAlbumName`. |
| R16 | Xuất hàng loạt N hình (5–50): mỗi hình một lần random theo R1–R3; hiển thị tiến độ, hủy được; lỗi từng hình không dừng cả lô. |
| R17 | Lịch sử giữ 50 lựa chọn gần nhất; chạm để mở lại tổ hợp đó. |

## D. Màn hình

### D1. Hôm nay (tab 1)
- Header: ngày hiện tại (nhỏ, trái), nút Cài đặt nhanh (phải). Large Title "Hôm nay".
- Thẻ hình nền lớn (WallpaperCanvas, bo 26pt, bóng) — chạm mở **Xem trước**. Chip góc trên: tên template + "cố định"/"ngẫu nhiên".
- Hàng ghim: 3 nút nhỏ Ảnh / Câu / Mẫu (biểu tượng ghim, trạng thái bật/tắt).
- Nút: **Đổi ngẫu nhiên** (tinted, haptic) và **Xem & lưu** (primary).
- Dòng thống kê: "X ảnh · Y câu · Z mẫu → N kết hợp".
- Trạng thái trống theo R5.

### D2. Xem trước (modal toàn màn hình)
- WallpaperCanvas toàn màn hình + LockScreenOverlay (ngày, giờ lớn, khung "Vùng đồng hồ").
- Thanh đáy kính mờ: Đóng · Ẩn/hiện đồng hồ · Đổi ngẫu nhiên · **Lưu**.
- Vuốt ngang: đổi ngẫu nhiên. Cảnh báo R14 trước khi lưu.
- Lưu xong: toast "Đã lưu vào Ảnh" + nút "Cách đặt hình nền" (sheet 3 bước).

### D3. Danh ngôn (tab 2)
- Large Title "Danh ngôn", nút + (thêm). Ô tìm kiếm. Segmented: Tất cả / Đang dùng / Yêu thích / Của tôi.
- Dòng: nội dung (2 dòng), tác giả, công tắc bật/tắt; vuốt trái: Yêu thích, Xóa (chỉ câu user).
- Chạm dòng: sheet sửa. Footer: "Tắt công tắc để loại câu khỏi ngẫu nhiên."
- Menu (…): Bật tất cả, Tắt tất cả, Khôi phục mặc định.

### D4. Ảnh (tab 3)
- Large Title "Ảnh nền", nút + (mở picker, chọn nhiều tối đa 20).
- Lưới 3 cột 9:16, dấu chọn = đang bật. Chạm: bật/tắt. Nhấn giữ: menu ngữ cảnh (Xem, Đặt điểm lấy nét, Xóa — chỉ ảnh user).
- Mục "Mặc định" và "Của tôi" tách section.

### D5. Mẫu (tab 4)
- Large Title "Mẫu", nút + (tạo mới). Segmented **Cố định / Ngẫu nhiên** + chú thích.
- Lưới 2 cột: thẻ xem trước dùng ảnh và câu hiện tại. Cố định: chạm = chọn (pill "Đang dùng"). Ngẫu nhiên: chạm = bật/tắt (pill "Bật").
- Nhấn giữ: Sửa (user), Nhân bản, Xóa (user).
- Section "Có sẵn" và "Của tôi".

### D6. Trình tạo/sửa template (stack)
- Trên: canvas xem trước (≈ 60% chiều cao) có LockScreenOverlay mờ; kéo khối chữ để đổi vị trí (bị chặn bởi R13).
- Dưới: tab công cụ **Chữ · Khối · Phủ · Ảnh · Khung**, mỗi tab là danh sách control gọn (slider, segmented, color swatches 12 màu + tùy chỉnh).
- Header: Hủy / tên template (chạm để đổi) / Lưu. Có "Hoàn tác" 1 bước. Thoát khi chưa lưu → hỏi xác nhận.

### D7. Cài đặt (tab 5)
- **Ngẫu nhiên:** Đổi khi mở ứng dụng, Không lặp lại liên tiếp, Ưu tiên câu yêu thích, Hiển thị tác giả.
- **Giao diện:** Theo hệ thống / Sáng / Tối.
- **Xuất & Tự động hóa:** Tên album, Xuất hàng loạt vào album (chọn số lượng), Hướng dẫn Phím tắt (màn hình hướng dẫn có ảnh minh họa từng bước).
- **Dữ liệu:** Nhập danh ngôn (JSON/CSV qua expo-document-picker — task 11), Xuất sao lưu danh ngôn, Lịch sử hình nền, Đặt lại dữ liệu (xác nhận 2 lần).
- **Giới thiệu:** phiên bản, quyền riêng tư (dữ liệu chỉ trên máy).

## E. Template có sẵn (builtin)

| id | Tên | Đặc điểm |
|---|---|---|
| tpl-center | Trung tâm | Serif, giữa màn hình (y 55%), phủ gradient dưới, bóng chữ |
| tpl-glass | Kính mờ | Sans, khối kính mờ bo 20 ở đáy (y 78%) |
| tpl-minimal | Tối giản | Sans 600, căn trái, viền trái, phủ gradient trái |
| tpl-bold | Đậm nét | Sans 800 IN HOA, phủ đen 38% |
| tpl-frame | Khung viền | Serif nghiêng, khung trắng 14pt |
| tpl-paper | Giấy | Nửa dưới nền giấy kem, chữ tối |
| tpl-dark | Đêm | Ảnh làm mờ 12, chữ Rounded, phủ đen 50% |
| tpl-mono | Máy chữ | Mono, khối nền đen 70% căn trái |

## F. Dữ liệu mặc định
- 50 danh ngôn tiếng Việt (`data/quotes.default.json`), tác giả rõ hoặc "Khuyết danh"; người dùng cung cấp danh sách hoặc agent đề xuất để người dùng duyệt.
- 12 ảnh mặc định (`assets/images/defaults/`), ảnh tự chụp hoặc có giấy phép tự do (ghi nguồn trong `assets/images/defaults/CREDITS.md`).

## G. Lộ trình

| GĐ | Task | Kết quả |
|---|---|---|
| GĐ0 | 00–01 | Khung repo, store, dữ liệu mặc định |
| GĐ1 (MVP) | 02–08 | Random, canvas + template builtin, 5 tab, xem trước, lưu ảnh, Sáng/Tối |
| GĐ2 | 09–11 | Trình tạo template, xuất hàng loạt + Phím tắt, nhập/xuất danh ngôn, lịch sử |
| GĐ3 | 12–13 | Development build/EAS preview, hoàn thiện (icon, splash, hiệu năng, a11y) |

## H. Tiêu chí chất lượng
- Mở app đến khi thấy hình nền ≤ 1.5 giây với 200 ảnh, 1.000 câu.
- Đổi ngẫu nhiên phản hồi ≤ 150ms (ảnh đã cache).
- Xuất một hình ≤ 2 giây.
- Không crash khi: kho trống, ảnh bị xóa file, dữ liệu persist hỏng (khôi phục mặc định + thông báo).
