---
name: dong-task
description: Đóng một task đã làm xong (rà soát chấp nhận, checklist, chạy kiểm tra cuối, cập nhật bảng tổng). Dùng khi lam-task kết thúc bước cuối hoặc người dùng nói "đóng task NN".
---

# Đóng task

1. Đọc task.md mục "Chấp nhận khi" và checklist.md; đối chiếu từng mục với code và kết quả test. Mục chưa đạt: báo cáo, KHÔNG đóng.
2. Chạy `npm run typecheck`, `npm run lint`, `npm test` — phải xanh. Ghi kết quả vào checklist mục Hồi quy.
3. Task có giao diện: xác nhận đã có ảnh chụp Sáng/Tối và người dùng đã thử trên iPhone (hỏi nếu chưa).
4. Task đổi dữ liệu persist: xác nhận đã tăng version store, có migrate và test migrate.
5. Cập nhật progress.md (Trạng thái ✅), trạng thái ✅ trong docs/tasks/README.md, chạy `npm run tasks-dashboard`.
6. Rà decisions.md: quyết định nào ảnh hưởng PRD thì đề xuất cập nhật PRD (hỏi trước khi sửa).
7. Báo cáo tổng kết + đề xuất commit `NN-slug: done` và merge về main. Chỉ làm khi được đồng ý.
