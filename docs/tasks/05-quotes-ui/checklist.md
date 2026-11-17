# Checklist kiểm thử — 05-quotes-ui

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | Tìm không dấu | Ra kết quả có dấu | ✅ |

## 2. Giao diện (Sáng / Tối)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-UI-01** | Thêm câu 221 ký tự | Báo lỗi, không lưu | ✅ |
| **TC-UI-02** | Vuốt câu default | Chỉ có Yêu thích | ⬜ |
| **TC-UI-03** | Tắt tất cả | Tab Hôm nay báo thiếu câu | ⬜ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Bàn phím mở trong sheet | Không che ô nhập | ⬜ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ⬜ |
| **TC-REG-02** | npm run lint | Không lỗi | ⬜ |
| **TC-REG-03** | npm test | Tất cả pass | ⬜ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ⬜ |
