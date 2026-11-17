import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STAGES = {
  GĐ0: { name: 'GĐ0 — Nền tảng', tasks: ['00', '01'] },
  GĐ1: { name: 'GĐ1 — Bản MVP', tasks: ['02', '03', '04', '05', '06', '07', '08'] },
  GĐ2: { name: 'GĐ2 — Mở rộng tính năng', tasks: ['09', '10', '11'] },
  GĐ3: { name: 'GĐ3 — Đóng gói & Hoàn thiện', tasks: ['12', '13'] },
};

export const STATUS_META = {
  '✅': { label: 'Hoàn thành', color: '#16a34a', bg: '#dcfce7', text: '#15803d' },
  '🔄': { label: 'Đang làm', color: '#2563eb', bg: '#dbeafe', text: '#1d4ed8' },
  '⬜': { label: 'Chưa làm', color: '#64748b', bg: '#f1f5f9', text: '#475569' },
  '❓': { label: 'Chưa rà soát', color: '#9333ea', bg: '#f3e8ff', text: '#7e22ce' },
  '⚠️': { label: 'Khác task.md', color: '#d97706', bg: '#fef3c7', text: '#b45309' },
  '❌': { label: 'Thiếu sót', color: '#dc2626', bg: '#fee2e2', text: '#b91c1c' },
};

export function getStageForTask(id) {
  for (const [stageKey, meta] of Object.entries(STAGES)) {
    if (meta.tasks.includes(id)) {
      return stageKey;
    }
  }
  return 'Khác';
}

export function parseTaskTable(markdown) {
  const lines = markdown.split('\n');
  const tasks = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || trimmed.includes('|---|') || trimmed.includes('| # |')) {
      continue;
    }

    const cols = trimmed
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

    if (cols.length >= 5) {
      const [id, rawName, status, dependencies, branch] = cols;
      if (/^\d{2}$/.test(id)) {
        const linkMatch = rawName.match(linkRegex);
        const link = linkMatch ? linkMatch[2] : '';
        const title = rawName.replace(linkRegex, '$1');

        tasks.push({
          id,
          name: rawName,
          title,
          link,
          status,
          dependencies,
          branch,
          stage: getStageForTask(id),
        });
      }
    }
  }

  return tasks;
}

export function generateDashboardHtml(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === '✅').length;
  const inProgress = tasks.filter((t) => t.status === '🔄').length;
  const pending = tasks.filter((t) => t.status === '⬜').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stageSections = Object.entries(STAGES).map(([key, info]) => {
    const stageTasks = tasks.filter((t) => t.stage === key);
    const stageDone = stageTasks.filter((t) => t.status === '✅').length;
    const stagePct = stageTasks.length > 0 ? Math.round((stageDone / stageTasks.length) * 100) : 0;
    return { key, ...info, total: stageTasks.length, done: stageDone, percent: stagePct };
  });

  const rowsHtml = tasks
    .map((task) => {
      const meta = STATUS_META[task.status] || {
        label: task.status,
        color: '#64748b',
        bg: '#f1f5f9',
        text: '#475569',
      };
      return `
      <tr>
        <td class="task-id">${task.id}</td>
        <td class="task-title">
          ${task.link ? `<a href="${task.link}">${task.title}</a>` : task.title}
        </td>
        <td>
          <span class="status-pill" style="background:${meta.bg}; color:${meta.text}; border:1px solid ${meta.color}40;">
            ${task.status} ${meta.label}
          </span>
        </td>
        <td class="task-dep">${task.dependencies}</td>
        <td class="task-branch"><code>${task.branch}</code></td>
      </tr>
    `;
    })
    .join('\n');

  const stageProgressHtml = stageSections
    .map(
      (s) => `
      <div class="stage-card">
        <div class="stage-header">
          <span class="stage-name">${s.name}</span>
          <span class="stage-stat">${s.done}/${s.total} (${s.percent}%)</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${s.percent}%;"></div>
        </div>
      </div>
    `,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Wallpaper — Bảng tiến độ Task</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --primary: #3b82f6;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --card-bg: #1e293b;
        --text: #f8fafc;
        --text-muted: #94a3b8;
        --border: #334155;
        --primary: #60a5fa;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 32px 16px;
    }
    .container { max-width: 960px; margin: 0 auto; }
    header { margin-bottom: 32px; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    p.subtitle { color: var(--text-muted); font-size: 15px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .stat-label { font-size: 13px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
    .stat-value { font-size: 32px; font-weight: 700; margin-top: 4px; }

    .stage-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stage-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }
    .stage-stat { color: var(--text-muted); font-size: 13px; }
    .progress-bar-bg {
      background: var(--border);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar-fill {
      background: var(--primary);
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow-x: auto;
    }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      padding: 14px 16px;
      font-weight: 600;
      color: var(--text-muted);
    }
    td { padding: 14px 16px; border-bottom: 1px solid var(--border); }
    tr:last-child td { border-bottom: none; }
    .task-id { font-weight: 700; color: var(--text-muted); width: 48px; }
    .task-title a { color: var(--primary); text-decoration: none; font-weight: 500; }
    .task-title a:hover { text-decoration: underline; }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .task-dep { color: var(--text-muted); }
    .task-branch code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      background: var(--bg);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }
    footer {
      margin-top: 32px;
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Quote Wallpaper — Bảng tiến độ Task</h1>
      <p class="subtitle">Theo dõi tiến độ phát triển các task qua các giai đoạn GĐ0–GĐ3</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Tổng số Task</div>
        <div class="stat-value">${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Hoàn thành</div>
        <div class="stat-value" style="color: #16a34a;">${completed}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Đang thực hiện</div>
        <div class="stat-value" style="color: #2563eb;">${inProgress}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tiến độ chung</div>
        <div class="stat-value">${percent}%</div>
      </div>
    </div>

    <div class="stage-grid">
      ${stageProgressHtml}
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Task</th>
            <th>Trạng thái</th>
            <th>Phụ thuộc</th>
            <th>Nhánh git</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <footer>
      Tự động sinh bởi <code>scripts/tasks-dashboard.mjs</code> từ <code>docs/tasks/README.md</code>
    </footer>
  </div>
</body>
</html>`;
}

export function main() {
  const rootDir = process.cwd();
  const readmePath = path.join(rootDir, 'docs', 'tasks', 'README.md');
  const outPath = path.join(rootDir, 'docs', 'tasks', 'dashboard.html');

  if (!fs.existsSync(readmePath)) {
    console.error(`Không tìm thấy file ${readmePath}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(readmePath, 'utf-8');
  const tasks = parseTaskTable(markdown);
  const html = generateDashboardHtml(tasks);

  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`Đã sinh dashboard thành công tại: ${outPath} (${tasks.length} tasks)`);
}

// Chạy trực tiếp nếu là script chính
if (typeof import.meta !== 'undefined' && import.meta?.url) {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
      main();
    }
  } catch {
    // Bỏ qua khi chạy trong môi trường test
  }
}
