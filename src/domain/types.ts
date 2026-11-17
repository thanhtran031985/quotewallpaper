export type Id = string;

export interface Quote {
  id: Id;
  text: string;
  author?: string;
  enabled: boolean;
  favorite: boolean;
  source: 'default' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface WallpaperImage {
  id: Id;
  name: string;
  source: 'default' | 'user';
  uri: string; // default: require asset key; user: đường dẫn tương đối trong documentDirectory/images/
  width: number;
  height: number;
  focalPoint: { x: number; y: number }; // 0–1, vùng ưu tiên khi cắt ảnh theo tỉ lệ màn hình
  enabled: boolean;
  createdAt: string;
}

export type FontFamily = 'Serif' | 'Sans' | 'Rounded' | 'Mono' | 'Handwriting';
export type FontWeight = '400' | '500' | '600' | '700' | '800';
export type TextAlign = 'left' | 'center' | 'right';
export type BoxAnchor = 'top' | 'center' | 'bottom';
export type BoxBackground = 'none' | 'solid' | 'blur' | 'paper';
export type OverlayType = 'none' | 'solid' | 'gradient-bottom' | 'gradient-left' | 'vignette';

export interface TemplateStyle {
  text: {
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    italic: boolean;
    uppercase: boolean;
    sizePct: number; // cỡ chữ theo % chiều rộng màn hình
    minSizePct: number; // cỡ tối thiểu khi fitText
    lineHeight: number;
    letterSpacing: number;
    color: string;
    align: TextAlign;
    shadow: boolean;
  };
  author: {
    show: boolean;
    sizeRatio: number;
    prefix: '—' | '–' | '';
  };
  box: {
    xPct: number;
    yPct: number;
    widthPct: number;
    anchor: BoxAnchor;
    background: BoxBackground;
    backgroundColor: string;
    backgroundOpacity: number;
    radius: number;
    padding: number;
    borderLeft: boolean;
  };
  overlay: {
    type: OverlayType;
    color: string;
    opacity: number;
  };
  image: {
    blur: number; // 0–20
    brightness: number; // -0.5–0.5
  };
  frame: {
    show: boolean;
    color: string;
    widthPct: number;
  };
}

export interface Template {
  id: Id;
  name: string;
  source: 'builtin' | 'user';
  style: TemplateStyle;
  enabled: boolean; // tham gia random khi templateMode = 'random'
  createdAt: string;
  updatedAt: string;
}

export interface Selection {
  imageId: Id;
  quoteId: Id;
  templateId: Id;
  pickedAt: string;
}

export interface Settings {
  templateMode: 'fixed' | 'random';
  fixedTemplateId: Id;
  shuffleOnOpen: boolean; // mặc định true
  noRepeat: boolean; // mặc định true
  showAuthor: boolean; // mặc định true
  favoritesBoost: boolean; // mặc định false: câu yêu thích có trọng số x2
  appearance: 'system' | 'light' | 'dark';
  exportAlbumName: string; // mặc định "Quote Wallpaper"
}

export interface AppLibraryState {
  version: number;
  quotes: Quote[];
  images: WallpaperImage[];
  templates: Template[];
  current: Selection | null;
  pinned: {
    image: boolean;
    quote: boolean;
    template: boolean;
  };
  history: Selection[]; // tối đa 50 mục gần nhất
}

export type Result<T> = { ok: true; data: T } | { ok: false; code: string; message: string };
