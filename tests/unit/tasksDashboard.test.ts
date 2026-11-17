import { parseTaskTable, generateDashboardHtml } from '../../scripts/tasks-dashboard.mjs';

describe('tasks-dashboard', () => {
  const sampleMarkdown = `
# Danh sách task

| # | Task | Trạng thái | Phụ thuộc | Nhánh git |
|---|---|---|---|---|
| 00 | [00-repo-setup](00-repo-setup/task.md) — Khung dự án | 🔄 | — | feat/00-repo-setup |
| 01 | [01-domain-store-seed](01-domain-store-seed/task.md) — Kiểu dữ liệu | ⬜ | 00 | feat/01-domain-store-seed |
| 02 | [02-random-engine](02-random-engine/task.md) — Engine | ✅ | 01 | feat/02-random-engine |
`;

  it('TC-LOG-01: parses task table and counts task statuses accurately', () => {
    const tasks = parseTaskTable(sampleMarkdown);
    expect(tasks).toHaveLength(3);

    expect(tasks[0]).toEqual({
      id: '00',
      name: '[00-repo-setup](00-repo-setup/task.md) — Khung dự án',
      title: '00-repo-setup — Khung dự án',
      link: '00-repo-setup/task.md',
      status: '🔄',
      dependencies: '—',
      branch: 'feat/00-repo-setup',
      stage: 'GĐ0',
    });

    const statusCounts = tasks.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    expect(statusCounts['🔄']).toBe(1);
    expect(statusCounts['⬜']).toBe(1);
    expect(statusCounts['✅']).toBe(1);
  });

  it('generates valid standalone HTML string containing task list', () => {
    const tasks = parseTaskTable(sampleMarkdown);
    const html = generateDashboardHtml(tasks);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Quote Wallpaper — Bảng tiến độ Task');
    expect(html).toContain('00-repo-setup');
    expect(html).toContain('feat/00-repo-setup');
  });
});
