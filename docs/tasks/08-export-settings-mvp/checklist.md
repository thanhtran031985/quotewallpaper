# Checklist kiểm thử — 08-export-settings-mvp

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | Kích thước xuất | Bằng kích thước pixel màn hình | ✅ |

## 2. Giao diện (Sáng / Tối)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-UI-01** | Lưu câu overflow | Hỏi xác nhận trước | ✅ |
| **TC-UI-02** | Giao diện Tối | Mọi tab đúng màu, chữ đọc rõ | ✅ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Lưu → mở Ảnh | Ảnh có trong album Quote Wallpaper, không có đồng hồ | ✅ |
| **TC-IOS-02** | Đặt làm hình nền màn hình khóa | Chữ không bị đồng hồ che | ✅ |
| **TC-IOS-03** | Từ chối quyền thêm ảnh | Thông báo + nút mở Cài đặt | ✅ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ✅ |
| **TC-REG-02** | npm run lint | Không lỗi | ✅ |
| **TC-REG-03** | npm test | Tất cả pass | ✅ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ✅ |
