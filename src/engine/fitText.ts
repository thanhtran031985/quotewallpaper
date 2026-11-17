import { FontFamily } from '../domain/types';

export interface FitTextOptions {
  containerWidth: number;
  containerHeight: number;
  fontFamily: FontFamily;
  baseFontSize: number;
  minFontSize: number;
  lineHeightMultiplier?: number;
  uppercase?: boolean;
}

export interface FitTextResult {
  fontSize: number;
  lines: string[];
  overflow: boolean;
  truncatedText: string;
}

// Tỉ lệ độ rộng ký tự trung bình / cỡ chữ theo từng nhóm font
const FONT_CHAR_WIDTH_RATIOS: Record<FontFamily, number> = {
  Sans: 0.52,
  Serif: 0.55,
  Rounded: 0.53,
  Mono: 0.60,
  Handwriting: 0.48,
};

/**
 * Ngắt dòng văn bản theo số ký tự ước lượng trên một dòng.
 */
function wrapLines(text: string, charsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= charsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Hàm thuần tính cỡ chữ và ngắt dòng tối ưu (R14).
 * Giảm dần fontSize từ baseFontSize xuống minFontSize; nếu vẫn không vừa thì bật overflow và cắt bằng '…'.
 */
export function fitText(text: string, options: FitTextOptions): FitTextResult {
  const {
    containerWidth,
    containerHeight,
    fontFamily,
    baseFontSize,
    minFontSize,
    lineHeightMultiplier = 1.35,
    uppercase = false,
  } = options;

  const processedText = uppercase ? text.toUpperCase() : text;
  const ratio = (FONT_CHAR_WIDTH_RATIOS[fontFamily] || 0.52) * (uppercase ? 1.2 : 1.0);

  let currentFontSize = Math.max(minFontSize, baseFontSize);

  while (currentFontSize >= minFontSize) {
    const charWidth = currentFontSize * ratio;
    const charsPerLine = Math.max(1, Math.floor(containerWidth / charWidth));
    const lines = wrapLines(processedText, charsPerLine);
    const lineHeight = currentFontSize * lineHeightMultiplier;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= containerHeight || currentFontSize === minFontSize) {
      if (totalHeight <= containerHeight) {
        return {
          fontSize: currentFontSize,
          lines,
          overflow: false,
          truncatedText: processedText,
        };
      }
      break;
    }

    currentFontSize -= 1;
  }

  // Ở minFontSize vẫn tràn containerHeight -> cắt ngắn với '…'
  const finalFontSize = minFontSize;
  const lineHeight = finalFontSize * lineHeightMultiplier;
  const maxLines = Math.max(1, Math.floor(containerHeight / lineHeight));
  const charWidth = finalFontSize * ratio;
  const charsPerLine = Math.max(1, Math.floor(containerWidth / charWidth));
  const allLines = wrapLines(processedText, charsPerLine);

  const displayLines = allLines.slice(0, maxLines);
  const lastLineIndex = displayLines.length - 1;
  let lastLine = displayLines[lastLineIndex];

  if (lastLine.length > 3) {
    lastLine = lastLine.slice(0, Math.max(1, lastLine.length - 3)).trim() + '…';
  } else {
    lastLine = lastLine + '…';
  }
  displayLines[lastLineIndex] = lastLine;

  return {
    fontSize: finalFontSize,
    lines: displayLines,
    overflow: true,
    truncatedText: displayLines.join(' '),
  };
}
