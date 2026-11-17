import { TemplateStyle, BoxAnchor } from '../domain/types';

export const CLOCK_ZONE = {
  topPct: 8,
  bottomPct: 32,
  leftPct: 8,
  rightPct: 92,
};

export interface ResolvedBoxLayout {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  yPct: number;
  anchor: BoxAnchor;
  pushedOutOfClockZone: boolean;
}

/**
 * Tính toán tọa độ pixel thực tế của khung chữ từ thông số % và kiểm tra vùng an toàn đồng hồ (R13).
 */
export function resolveBoxLayout(
  box: TemplateStyle['box'],
  containerWidth: number,
  containerHeight: number,
): ResolvedBoxLayout {
  let yPct = box.yPct;
  let pushedOutOfClockZone = false;

  // R13: Tự động đẩy khỏi vùng đồng hồ nếu box nằm trong vùng 8%–32%
  if (box.anchor === 'top' && yPct < CLOCK_ZONE.bottomPct) {
    yPct = CLOCK_ZONE.bottomPct;
    pushedOutOfClockZone = true;
  } else if (box.anchor === 'center' && yPct < CLOCK_ZONE.bottomPct + 4) {
    yPct = CLOCK_ZONE.bottomPct + 4;
    pushedOutOfClockZone = true;
  }

  const left = (box.xPct / 100) * containerWidth;
  const width = (box.widthPct / 100) * containerWidth;

  if (box.anchor === 'bottom') {
    // Vị trí anchor từ đáy = (100 - yPct)%
    const bottom = ((100 - yPct) / 100) * containerHeight;
    return {
      left,
      width,
      bottom,
      yPct,
      anchor: box.anchor,
      pushedOutOfClockZone,
    };
  }

  const top = (yPct / 100) * containerHeight;
  return {
    left,
    width,
    top,
    yPct,
    anchor: box.anchor,
    pushedOutOfClockZone,
  };
}

/**
 * Giới hạn vị trí khối chữ khi kéo thả trong trình tạo template (TC-LOG-01 / R13).
 * Không cho khối chữ xâm phạm vùng đồng hồ (8% - 32% chiều cao màn hình).
 */
export function clampBoxPosition(
  yPct: number,
  anchor: BoxAnchor = 'top',
): { yPct: number; isClamped: boolean } {
  let minPct = CLOCK_ZONE.bottomPct;
  if (anchor === 'center') {
    minPct = CLOCK_ZONE.bottomPct + 4;
  } else if (anchor === 'bottom') {
    minPct = CLOCK_ZONE.bottomPct + 10;
  }

  const maxPct = 90;
  if (yPct < minPct) {
    return { yPct: minPct, isClamped: true };
  }
  if (yPct > maxPct) {
    return { yPct: maxPct, isClamped: true };
  }
  return { yPct, isClamped: false };
}
