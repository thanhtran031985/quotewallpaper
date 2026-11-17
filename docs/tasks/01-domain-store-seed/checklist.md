# Checklist kiểm thử — 01-domain-store-seed

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | Thêm danh ngôn 0 / 221 ký tự | Bị từ chối, message tiếng Việt | ✅ |
| **TC-LOG-02** | Thêm câu trùng khác hoa thường/khoảng trắng | Bị từ chối | ✅ |
| **TC-LOG-03** | Xóa danh ngôn default | Không cho xóa, chỉ tắt | ✅ |
| **TC-LOG-04** | Xóa template builtin | Không cho xóa | ✅ |
| **TC-LOG-05** | Xóa template bật cuối cùng (chế độ Ngẫu nhiên) | Bị từ chối (R12) | ✅ |
| **TC-LOG-06** | Seed chạy 2 lần | Không nhân đôi | ✅ |
| **TC-LOG-07** | Storage chứa JSON hỏng | Reset mặc định, có bản backup, không crash | ⬜ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Tắt app, mở lại | Dữ liệu giữ nguyên | ⬜ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ⬜ |
| **TC-REG-02** | npm run lint | Không lỗi | ⬜ |
| **TC-REG-03** | npm test | Tất cả pass | ⬜ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ⬜ |
