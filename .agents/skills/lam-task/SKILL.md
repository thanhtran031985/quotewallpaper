---
name: lam-task
description: Làm một task trong docs/tasks theo quy trình từng bước (plan, test trước, kiểm tra, cập nhật progress, dừng chờ duyệt). Dùng khi người dùng nói "làm task NN", "tiếp tục task", "continue" hoặc gọi /lam-task.
---

# Làm một task

Đầu vào: NN-slug (nếu chỉ nói "tiếp tục", lấy task đang 🔄 trong docs/tasks/README.md).

## Đọc

- docs/tasks/README.md → docs/tasks/NN-slug/task.md → progress.md → decisions.md → checklist.md.
- Chỉ các mục PRD và thiết kế mà task.md liệt kê. Task có giao diện: đọc rule ui-rn và phần tương ứng trong designs/reference/prototype.html.
- Trước khi dùng API của thư viện Expo, đọc tài liệu đúng phiên bản SDK đang dùng (docs.expo.dev, mục của package đó).
- Bước đã ✅ không làm lại.

## Lập kế hoạch (khi chưa có plan.md)

Implementation Plan: mỗi bước ghi file tạo/sửa, test viết trước, lệnh kiểm tra, rủi ro; chỗ tự suy ra; câu hỏi; package cần cài thêm (phải hỏi). Ghi rõ bước nào cần người dùng thử trên iPhone. DỪNG chờ duyệt.

## Bắt đầu (sau khi duyệt)

- Chép nguyên văn kế hoạch vào plan.md; `git checkout -b feat/NN-slug`; đổi trạng thái 🔄 trong README và progress.

## Mỗi bước

- Viết test hành vi trước (Jest), chạy thấy đỏ. Logic engine test thuần; component test bằng @testing-library/react-native.
- Code cho xanh, chỉ trong phạm vi bước.
- Chạy đúng lệnh ở "Kiểm tra". Phần không test tự động được (quyền Ảnh, lưu ảnh, hiển thị trên máy thật): ghi vào báo cáo mục "Người dùng kiểm tra trên iPhone" với các thao tác cụ thể.
- Cập nhật progress.md (dòng của bước + nhật ký: đã làm, lệnh + kết quả, suy ra gì, việc người dùng làm tay) và trạng thái các test case trong checklist.md.
- Chạy `npm run tasks-dashboard`.
- Báo cáo ngắn + đề xuất commit `NN-slug: step N — <mô tả>`; bước có giao diện đính ảnh chụp (Sáng và Tối) hoặc nhờ người dùng chụp.
- **DỪNG** chờ "continue". Chỉ commit khi được đồng ý.

## Khi có vấn đề

- Khác task.md/PRD/thiết kế: ghi decisions.md (ngày, quyết định, lý do, ảnh hưởng PRD).
- Mơ hồ hoặc mâu thuẫn: DỪNG và hỏi.
- Module không chạy được trong Expo Go: DỪNG, giải thích, đề xuất development build; không tự đổi sang thư viện khác.

## Kết thúc task

Chạy skill dong-task.
