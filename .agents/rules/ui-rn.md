---
trigger: glob
globs: app/**, src/components/**, src/theme/**, src/templates/**
description: Quy tắc giao diện React Native theo Apple HIG (iPhone dọc), Sáng/Tối, chuyển thiết kế từ designs/reference/prototype.html.
---

# Giao diện React Native — chuẩn iOS

- `designs/` CHỈ ĐỌC. Đối chiếu `designs/reference/prototype.html` về bố cục, thứ tự thành phần, chữ hiển thị.
- Màu, khoảng cách, bo góc, cỡ chữ lấy từ `src/theme/tokens.ts` qua `useTheme()`. Thiếu token: thêm vào tokens.ts (cả `light` và `dark`), báo cáo. Không viết mã màu/px trong màn hình.
- Thứ tự ưu tiên khi mâu thuẫn: tokens.ts / rule này > task.md > hướng dẫn trong skill.

## Khung màn hình

- `expo-router` Tabs, 5 tab theo thứ tự: **Hôm nay, Danh ngôn, Ảnh, Mẫu, Cài đặt**. Tab bar nổi, bo tròn, nền `BlurView` (kính mờ), icon SF-style (`@expo/vector-icons` Ionicons, chỉ bộ này) + nhãn.
- Header: **Large Title** (34pt, đậm) ở tab gốc, thu thành tiêu đề nhỏ khi cuộn (`headerLargeTitle` của native stack). Nút hành động ở góc phải header (+, Sửa).
- Luôn bọc nội dung bằng safe area (`useSafeAreaInsets`), chừa khoảng dưới cho tab bar nổi.
- Màn **Xem trước** là modal toàn màn hình (`presentation: 'fullScreenModal'`), status bar chữ sáng, thanh nút kính mờ ở đáy.
- Form thêm/sửa danh ngôn: **sheet** (`presentation: 'formSheet'` hoặc `'modal'`) có grabber, nút Hủy (trái) / Lưu (phải) trên thanh tiêu đề.

## Thành phần

- Danh sách: kiểu **inset grouped** (nhóm bo 12pt, nền phụ, đường phân cách 0.5pt thụt lề trái 16pt), dòng cao ≥ 44pt. Dùng `FlatList`/`SectionList`, không render danh sách dài bằng `map` trong ScrollView.
- Bật/tắt: `Switch` của React Native (màu bật = token `success`).
- Chọn chế độ: segmented control (component riêng `Segmented`, giống prototype).
- Xóa trong danh sách: vuốt trái (`Swipeable` của gesture-handler) + xác nhận `ActionSheet`/`Alert` kiểu destructive. Template có sẵn và danh ngôn mặc định không có nút xóa (chỉ tắt).
- Lưới ảnh: 3 cột, tỉ lệ 9:16, khoảng cách 2–4pt, dấu chọn tròn góc dưới phải.
- Lưới template: 2 cột, thẻ xem trước tỉ lệ 9:19.5 render bằng chính `WallpaperCanvas` (scale nhỏ), viền token `accent` khi đang chọn.
- Nút chính: cao 50pt, bo 14pt, nền `accent`; nút phụ dạng tinted (nền accent 12%).
- Thông báo ngắn: toast trên cùng tự ẩn sau 2 giây + `expo-haptics` (success/warning).

## WallpaperCanvas

- Một component duy nhất `src/components/WallpaperCanvas` render hình nền cho: thẻ Hôm nay, lưới template, màn Xem trước, và ảnh xuất. Không tạo bản render thứ hai.
- Nhận `{ image, quote, template, size, showAuthor }`; vẽ theo đơn vị **tương đối** (phần trăm chiều rộng/cao) để mọi kích thước ra cùng bố cục.
- `LockScreenOverlay` (ngày, giờ, khung vùng đồng hồ) là component tách riêng, đặt **ngoài** view được chụp.
- Màu chữ/nền chữ của template là dữ liệu template, KHÔNG đổi theo Sáng/Tối của app.

## Sáng / Tối

- `useColorScheme()` + cài đặt `appearance: 'system' | 'light' | 'dark'`. Mọi màn hình kiểm tra ở cả hai chế độ.
- Nền app: systemGroupedBackground (sáng `#F2F2F7`, tối `#000000`); nhóm: sáng `#FFFFFF`, tối `#1C1C1E` (khai báo trong tokens.ts).

## Bốn trạng thái

Đang tải (skeleton/ActivityIndicator), Trống (`EmptyState`: biểu tượng, lý do, một nút hành động), Lỗi (giữ dữ liệu cũ + Thử lại), Có dữ liệu.

## Văn phong

Tiếng Việt có dấu, ngắn gọn. Không emoji, không dấu chấm than. Nút dùng động từ: "Lưu vào Ảnh", "Đổi ngẫu nhiên", "Thêm danh ngôn".

## Tương tác và truy cập

- Mọi control có `accessibilityLabel` và `accessibilityRole`. Hỗ trợ Dynamic Type cho chữ giao diện (không áp cho chữ trên hình nền).
- Vùng chạm ≥ 44×44pt (`hitSlop` nếu icon nhỏ).
- Animation dùng reanimated, ngắn (≤ 250ms); tôn trọng `AccessibilityInfo.isReduceMotionEnabled`.

## Nghiệm thu giao diện

- Chụp ảnh màn hình trong Expo Go, chế độ Sáng và Tối, đính vào báo cáo bước.
- Kiểm tra trên kích thước nhỏ (iPhone SE/mini) và lớn (Pro Max) nếu có; tối thiểu không bị che bởi Dynamic Island, home indicator, tab bar.
- Đối chiếu prototype: thứ tự thành phần, chữ hiển thị, vị trí nút.
- Báo cáo bước liệt kê ngắn phần giao diện đã đổi; không đổi gì ngoài phạm vi task.
