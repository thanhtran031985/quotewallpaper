import { clampBoxPosition, CLOCK_ZONE } from '../../src/engine/layout';

describe('templateEditorLayout engine (09-template-editor)', () => {
  describe('clampBoxPosition (TC-LOG-01 / R13)', () => {
    it('TC-LOG-01: kéo chữ lên vùng đồng hồ bị chặn ở đáy vùng an toàn', () => {
      // Thử kéo lên 15% (nằm sâu trong vùng đồng hồ 8%–32%)
      const resTop = clampBoxPosition(15, 'top');
      expect(resTop.isClamped).toBe(true);
      expect(resTop.yPct).toBe(CLOCK_ZONE.bottomPct); // 32%

      // Anchor center cần thêm khoảng đệm
      const resCenter = clampBoxPosition(20, 'center');
      expect(resCenter.isClamped).toBe(true);
      expect(resCenter.yPct).toBe(CLOCK_ZONE.bottomPct + 4); // 36%
    });

    it('vị trí an toàn ngoài vùng đồng hồ giữ nguyên tọa độ và không bị chặn', () => {
      const res = clampBoxPosition(55, 'top');
      expect(res.isClamped).toBe(false);
      expect(res.yPct).toBe(55);

      const resBottom = clampBoxPosition(78, 'bottom');
      expect(resBottom.isClamped).toBe(false);
      expect(resBottom.yPct).toBe(78);
    });

    it('không cho kéo vượt quá biên đáy màn hình (max 90%)', () => {
      const res = clampBoxPosition(95, 'top');
      expect(res.isClamped).toBe(true);
      expect(res.yPct).toBe(90);
    });
  });
});
