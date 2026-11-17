# Kế hoạch thực hiện: Task 02 — 02-random-engine

- **Mục tiêu:** Xây dựng engine thuần chọn ngẫu nhiên hình nền theo các quy tắc R1–R7, tích hợp action shuffle vào store, quản lý lịch sử 50 lựa chọn gần nhất (R17) và hook `useShuffleOnOpen` tự động đổi hình khi mở app hoặc foreground (R6).
- **Nhánh git:** feat/02-random-engine

---

### Bước 1 — pickSelection (Hàm thuần engine)
- **Mô tả:** Xây dựng `src/engine/randomPick.ts`:
  - `pickSelection(lib, settings, prev, pinned, rng)` trả về `Result<Selection>`.
  - Hỗ trợ tiêm `rng: () => number` để viết unit test kiểm thử tất cả các trường hợp biên.
  - Kiểm tra R5: trả mã lỗi `EMPTY_IMAGES`, `EMPTY_QUOTES`, `EMPTY_TEMPLATES` kèm danh sách loại thiếu.
  - Kiểm tra R2: Chế độ Cố định luôn lấy `fixedTemplateId`.
  - Kiểm tra R3: `noRepeat` loại trừ mục vừa chọn khi kho có ≥ 2 mục bật; vẫn chọn được khi chỉ có 1 mục.
  - Kiểm tra R4: Giữ nguyên mục được ghim.
  - Kiểm tra R7: `favoritesBoost` nhân đôi trọng số câu yêu thích.
  - `calculateCombinationsCount(lib, settings)` tính số tổ hợp cho dòng thống kê.
- **File tạo/sửa:**
  - `src/engine/randomPick.ts`
  - `tests/unit/randomPick.test.ts`
- **Test viết trước:** `tests/unit/randomPick.test.ts` (TC-LOG-01, TC-LOG-02, TC-LOG-03, TC-LOG-04, TC-LOG-05, TC-LOG-06).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 2 — Tích hợp store + action shuffle
- **Mô tả:** Bổ sung action `shuffle()` vào `useLibraryStore`:
  - Gọi `pickSelection()`, cập nhật `current`, đẩy vào đầu `history` (cắt tối đa 50 phần tử theo R17).
  - Tự động reset ghim khi mục đang ghim bị tắt hoặc xóa (R4).
- **File tạo/sửa:**
  - `src/store/useLibraryStore.ts`
  - `tests/unit/shuffleStore.test.ts`
- **Test viết trước:** `tests/unit/shuffleStore.test.ts` (kiểm tra shuffle thành công, history cắt ở 50, reset pin khi item disabled/deleted).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 3 — Hook useShuffleOnOpen
- **Mô tả:** Viết hook `src/engine/useShuffleOnOpen.ts`:
  - Lắng nghe sự kiện `AppState.addEventListener('change', ...)`
  - Khi khởi động hoặc khi app chuyển từ `background` sang `active`: nếu `settings.shuffleOnOpen` bật thì gọi `shuffle()`.
- **File tạo/sửa:**
  - `src/engine/useShuffleOnOpen.ts`
  - `tests/unit/useShuffleOnOpen.test.ts`
- **Test viết trước:** `tests/unit/useShuffleOnOpen.test.ts` (TC-LOG-07: mock AppState chuyển sang active gọi shuffle 1 lần, tắt cài đặt không shuffle).
- **Lệnh kiểm tra:** `npm test`, `npm run typecheck`, `npm run lint`.
