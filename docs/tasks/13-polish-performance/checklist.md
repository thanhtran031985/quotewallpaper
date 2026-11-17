# Checklist kiểm thử — 13-polish-performance

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | Pick 10.000 lần | < 200ms | ✅ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Mở app với 200 ảnh, 1.000 câu | ≤ 1.5 giây | ✅ |
| **TC-IOS-02** | VoiceOver | Đọc đúng nhãn mọi nút | ✅ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ✅ |
| **TC-REG-02** | npm run lint | Không lỗi | ✅ |
| **TC-REG-03** | npm test | Tất cả pass | ✅ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ✅ |
