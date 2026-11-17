# Hướng dẫn tạo bản build độc lập (EAS Build) cho Quote Wallpaper

Tài liệu này hướng dẫn cách tạo bản cài đặt độc lập (Internal Distribution / Ad Hoc build) cho ứng dụng **Quote Wallpaper** để cài trực tiếp lên iPhone bằng tệp IPA / link tải trực tiếp mà không cần chạy thông qua ứng dụng Expo Go.

---

## 1. Yêu cầu chuẩn bị (Prerequisites)

1. **Tài khoản Apple Developer**:
   - Để cài đặt ứng dụng độc lập lên iPhone cá nhân thông qua phương thức Ad Hoc / Internal Distribution, bạn cần có tài khoản **Apple Developer** (cá nhân hoặc tổ chức, $99/năm).
   - Nếu không có tài khoản Apple Developer trả phí, bạn chỉ có thể chạy thử trên máy thật qua **Expo Go** (như các bước hiện tại).
2. **Tài khoản Expo**:
   - Đăng ký miễn phí tại [expo.dev](https://expo.dev).
3. **EAS CLI**:
   - Cài đặt công cụ dòng lệnh EAS trên máy:
     ```bash
     npm install -g eas-cli
     ```
   - Đăng nhập vào tài khoản Expo:
     ```bash
     eas login
     ```

---

## 2. Cấu hình dự án (Project Setup)

1. **Kiểm tra thông tin ứng dụng trong `app.json`**:
   - Tên ứng dụng: `Quote Wallpaper`
   - Bundle Identifier: `com.thanhtran.quotewallpaper`
   - Hướng màn hình: Chỉ dọc (`portrait`)
   - Quyền truy cập thư viện ảnh: Đã cấu hình đầy đủ bằng tiếng Việt trong `infoPlist`.

2. **Cấu hình hồ sơ build trong `eas.json`**:
   - `preview`: Hồ sơ dành cho cài đặt thử nghiệm nội bộ (`distribution: "internal"`).
   - `development`: Hồ sơ dành cho development client có thể debug native code.

3. **Liên kết dự án với tài khoản Expo (chỉ cần chạy lần đầu)**:
   ```bash
   eas init
   ```

---

## 3. Đăng ký thiết bị iPhone (Register Device UDID)

Để Apple cho phép cài file IPA lên iPhone của bạn, UDID của máy phải được thêm vào tài khoản Apple Developer.

Chạy lệnh sau trên terminal:
```bash
eas device:create
```

Làm theo hướng dẫn trên màn hình:
1. EAS CLI sẽ hiển thị một mã QR và đường link URL.
2. Dùng camera iPhone quét mã QR, mở link trên trình duyệt Safari của iPhone.
3. Safari sẽ tải về một cấu hình hồ sơ (Configuration Profile) đăng ký UDID an toàn.
4. Vào **Cài đặt (Settings)** trên iPhone > nhấn vào **Đã tải về hồ sơ (Profile Downloaded)** > nhấn **Cài đặt (Install)**.
5. Thiết bị của bạn sẽ tự động được thêm vào tài khoản Apple Developer thông qua Expo.

---

## 4. Chạy Build ứng dụng (Run EAS Build)

Chạy lệnh tạo bản build iOS độc lập:
```bash
eas build --profile preview --platform ios
```

- EAS CLI sẽ hỏi bạn có muốn tự động quản lý chứng chỉ (Apple Credentials - Distribution Certificate và Provisioning Profile) hay không. Chọn **Yes** (Expo sẽ tự động tạo và quản lý).
- Tiến trình build sẽ diễn ra trên đám mây của Expo (Expo Cloud Build), không tiêu tốn tài nguyên CPU của máy tính.
- Khi hoàn tất (khoảng 10–15 phút), terminal sẽ cung cấp:
  - Một đường link tải file cài đặt.
  - Một mã QR code để quét trực tiếp từ iPhone.

---

## 5. Cài đặt và kích hoạt ứng dụng trên iPhone

1. Dùng iPhone quét mã QR hoặc mở link kết quả của EAS trên Safari.
2. Nhấn nút **Install** để tải và cài đặt Quote Wallpaper vào màn hình chính của iPhone.
3. Khi mở ứng dụng lần đầu, nếu hệ thống hiển thị thông báo "Nhà phát triển doanh nghiệp chưa được tin cậy" (Untrusted Developer):
   - Mở **Cài đặt (Settings)** trên iPhone.
   - Chọn **Cài đặt chung (General)** > **Quản lý VPN & Thiết bị (VPN & Device Management)**.
   - Nhấn vào tên chứng chỉ tài khoản Apple Developer của bạn và chọn **Tin cậy (Trust)**.
4. Mở app **Quote Wallpaper** từ màn hình chính. Ứng dụng sẽ chạy hoàn toàn độc lập với biểu tượng icon riêng, hình nền khởi động (splash screen) riêng và hoạt động đầy đủ dữ liệu offline không cần máy tính.

---

## 6. Lưu ý về chi phí và tài nguyên

> [!NOTE]
> Agent và CI không tự động kích hoạt lệnh `eas build` để tránh tiêu hao quota build miễn phí hàng tháng của tài khoản Expo. Người dùng có thể tự thực hiện lệnh này bất cứ khi nào sẵn sàng.
