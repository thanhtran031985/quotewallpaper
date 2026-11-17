# Checklist kiểm thử — 02-random-engine

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | noRepeat với 2 câu, shuffle 100 lần | Không bao giờ trùng câu liên tiếp | ⬜ |
| **TC-LOG-02** | noRepeat với 1 câu | Vẫn chọn được câu đó | ⬜ |
| **TC-LOG-03** | Chế độ Cố định | Template luôn = fixedTemplateId | ⬜ |
| **TC-LOG-04** | Ghim ảnh | Ảnh không đổi qua các lần shuffle | ⬜ |
| **TC-LOG-05** | Tắt hết ảnh | Trả EMPTY_IMAGES | ⬜ |
| **TC-LOG-06** | favoritesBoost | Câu yêu thích xuất hiện ~2 lần câu thường | ⬜ |
| **TC-LOG-07** | AppState background → active | Shuffle đúng 1 lần | ⬜ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ⬜ |
| **TC-REG-02** | npm run lint | Không lỗi | ⬜ |
| **TC-REG-03** | npm test | Tất cả pass | ⬜ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ⬜ |
