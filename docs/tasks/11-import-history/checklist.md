# Checklist kiểm thử — 11-import-history

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | CSV có BOM và dấu phẩy trong nội dung | Parse đúng | ⬜ |

## 2. Giao diện (Sáng / Tối)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-UI-01** | Nhập file có 10 câu trùng | Báo 10 trùng, không nhập | ⬜ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Xuất sao lưu → Files | Có file JSON đọc được | ⬜ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ⬜ |
| **TC-REG-02** | npm run lint | Không lỗi | ⬜ |
| **TC-REG-03** | npm test | Tất cả pass | ⬜ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ⬜ |
