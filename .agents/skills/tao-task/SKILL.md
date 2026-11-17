---
name: tao-task
description: Tạo task mới trong docs/tasks từ yêu cầu của người dùng (task.md, progress.md, decisions.md, checklist.md) và thêm dòng vào bảng tổng. Dùng khi người dùng nói "tạo task", "thêm task", hoặc gọi /tao-task.
---

# Tạo task

1. Đọc docs/tasks/README.md lấy số tiếp theo (NN) và các task liên quan để xác định Phụ thuộc. Đọc docs/PRD.md mục liên quan.
2. Đặt slug ngắn, chữ thường, gạch nối, không dấu. Thư mục `docs/tasks/NN-slug/`.
3. Chép từ `docs/tasks/_template/`: task.md, progress.md, decisions.md, checklist.md, tạo `_archive/`. Không tạo plan.md (sinh khi lam-task được duyệt).
4. Điền task.md: Mục tiêu, Phạm vi, Ngoài phạm vi, Thiết kế, PRD liên quan, Quyết định kiến trúc, Các bước (mỗi bước có Làm / Test viết trước / Kiểm tra), Chấp nhận khi, Ảnh hưởng dữ liệu (store version / migrate).
5. Điền checklist.md: test case theo nhóm (Logic, Giao diện, Sáng/Tối, Trên iPhone, Hồi quy), mã `TC-<NHÓM>-NN`, trạng thái ⬜.
6. Thêm dòng vào bảng docs/tasks/README.md với trạng thái ⬜, nhánh `feat/NN-slug`.
7. Chạy `npm run tasks-dashboard`.
8. Báo cáo: đường dẫn task, tóm tắt bước, câu hỏi còn mở. Yêu cầu chưa rõ: hỏi trước khi tạo.
