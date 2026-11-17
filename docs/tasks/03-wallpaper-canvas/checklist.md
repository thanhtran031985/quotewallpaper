# Checklist kiểm thử — 03-wallpaper-canvas

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | Câu 220 ký tự, template Đậm nét | Cỡ chữ giảm, không tràn hoặc overflow=true | ✅ |
| **TC-LOG-02** | Template có yPct trong vùng đồng hồ | Khối bị đẩy xuống dưới vùng | ✅ |

## 2. Giao diện (Sáng / Tối)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-UI-01** | 8 template trên màn dev | Đúng đặc điểm PRD mục E | ✅ |
| **TC-UI-02** | Dấu tiếng Việt (ệ, ữ, ỗ) | Không lỗi glyph ở 5 font | ✅ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Mở màn dev trên iPhone | Không giật khi cuộn | ✅ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ✅ |
| **TC-REG-02** | npm run lint | Không lỗi | ✅ |
| **TC-REG-03** | npm test | Tất cả pass | ✅ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ✅ |
