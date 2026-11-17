# Checklist kiểm thử — 07-templates-ui

## 2. Giao diện (Sáng / Tối)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-UI-01** | Chọn Cố định → Kính mờ, đổi ngẫu nhiên 10 lần | Luôn Kính mờ | ✅ |
| **TC-UI-02** | Ngẫu nhiên, tắt hết trừ 1 | Không tắt được mục cuối | ✅ |
| **TC-UI-03** | Nhân bản Trung tâm | Có "Trung tâm (bản sao)" ở section Của tôi | ✅ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Cuộn lưới | Không giật | ✅ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ✅ |
| **TC-REG-02** | npm run lint | Không lỗi | ✅ |
| **TC-REG-03** | npm test | Tất cả pass | ✅ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ✅ |
