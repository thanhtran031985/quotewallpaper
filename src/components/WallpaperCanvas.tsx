import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Quote, WallpaperImage, Template } from '../domain/types';
import { resolveBoxLayout } from '../engine/layout';
import { fitText } from '../engine/fitText';
import { resolveImageSource } from '../services/imageResolver';
import { resolveFontFamily } from '../theme/fontResolver';

export interface WallpaperCanvasProps {
  image: WallpaperImage;
  quote: Quote;
  template: Template;
  width?: number;
  height?: number;
  showAuthor?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function WallpaperCanvas({
  image,
  quote,
  template,
  width: customWidth,
  height: customHeight,
  showAuthor = true,
  style,
  testID = 'wallpaper-canvas',
}: WallpaperCanvasProps) {
  const windowDims = Dimensions.get('window');
  const width = customWidth || windowDims.width;
  const height = customHeight || windowDims.height;

  const { style: tStyle } = template;
  const imageUri = resolveImageSource(image);
  const focalPoint = image.focalPoint || { x: 0.5, y: 0.5 };

  // 1. Box Layout
  const boxLayout = resolveBoxLayout(tStyle.box, width, height);

  // 2. Fit Text
  const baseFontSize = (tStyle.text.sizePct / 100) * width;
  const minFontSize = (tStyle.text.minSizePct / 100) * width;
  const padding = tStyle.box.padding;
  const borderLeftWidth = tStyle.box.borderLeft ? 4 : 0;
  const availableTextWidth = Math.max(10, boxLayout.width - padding * 2 - borderLeftWidth);
  const availableTextHeight = Math.max(20, height * 0.45);

  const fitted = fitText(quote.text, {
    containerWidth: availableTextWidth,
    containerHeight: availableTextHeight,
    fontFamily: tStyle.text.fontFamily,
    baseFontSize,
    minFontSize,
    lineHeightMultiplier: tStyle.text.lineHeight,
    uppercase: tStyle.text.uppercase,
  });

  const fontFam = resolveFontFamily(
    tStyle.text.fontFamily,
    tStyle.text.fontWeight,
    tStyle.text.italic,
  );

  const canShowAuthor = showAuthor && tStyle.author.show && !!quote.author;
  const authorFontSize = fitted.fontSize * tStyle.author.sizeRatio;

  // 3. Frame
  const frameBorderWidth = tStyle.frame.show ? (tStyle.frame.widthPct / 100) * width : 0;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          width,
          height,
          borderWidth: frameBorderWidth,
          borderColor: tStyle.frame.show ? tStyle.frame.color : 'transparent',
        },
        style,
      ]}
    >
      {/* 1. Nền ảnh (expo-image) */}
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={{
          left: `${focalPoint.x * 100}%`,
          top: `${focalPoint.y * 100}%`,
        }}
        blurRadius={tStyle.image.blur}
        transition={200}
      />

      {/* 2. Bộ lọc độ sáng (Brightness) */}
      {tStyle.image.brightness !== 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: tStyle.image.brightness < 0 ? '#000' : '#fff',
              opacity: Math.min(1, Math.abs(tStyle.image.brightness)),
            },
          ]}
        />
      )}

      {/* 3. Phủ màu / Gradient Overlay */}
      {tStyle.overlay.type === 'solid' && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: tStyle.overlay.color,
              opacity: tStyle.overlay.opacity,
            },
          ]}
        />
      )}
      {tStyle.overlay.type === 'gradient-bottom' && (
        <LinearGradient
          colors={['transparent', tStyle.overlay.color]}
          style={[StyleSheet.absoluteFill, { opacity: tStyle.overlay.opacity }]}
        />
      )}
      {tStyle.overlay.type === 'gradient-left' && (
        <LinearGradient
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          colors={[tStyle.overlay.color, 'transparent']}
          style={[StyleSheet.absoluteFill, { opacity: tStyle.overlay.opacity }]}
        />
      )}
      {tStyle.overlay.type === 'vignette' && (
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={[StyleSheet.absoluteFill, { opacity: tStyle.overlay.opacity }]}
        />
      )}

      {/* 4. Hộp chứa câu danh ngôn (Box) */}
      <View
        style={[
          styles.box,
          {
            left: boxLayout.left,
            width: boxLayout.width,
            padding,
            borderRadius: tStyle.box.radius,
            borderLeftWidth: tStyle.box.borderLeft ? 4 : 0,
            borderLeftColor: tStyle.box.borderLeft ? tStyle.text.color : 'transparent',
            ...(boxLayout.anchor === 'bottom'
              ? { bottom: boxLayout.bottom }
              : { top: boxLayout.top }),
          },
        ]}
      >
        {/* Nền của hộp: blur, solid, paper */}
        {tStyle.box.background === 'blur' && (
          <BlurView
            intensity={Math.round(tStyle.box.backgroundOpacity * 100)}
            tint="light"
            style={[StyleSheet.absoluteFill, { borderRadius: tStyle.box.radius }]}
          />
        )}
        {tStyle.box.background === 'solid' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: tStyle.box.backgroundColor,
                opacity: tStyle.box.backgroundOpacity,
                borderRadius: tStyle.box.radius,
              },
            ]}
          />
        )}
        {tStyle.box.background === 'paper' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: tStyle.box.backgroundColor || '#FAF7F0',
                opacity: tStyle.box.backgroundOpacity || 1,
                borderRadius: tStyle.box.radius,
              },
            ]}
          />
        )}

        {/* Nội dung danh ngôn */}
        <Text
          style={[
            styles.quoteText,
            {
              fontFamily: fontFam,
              fontSize: fitted.fontSize,
              lineHeight: fitted.fontSize * tStyle.text.lineHeight,
              letterSpacing: tStyle.text.letterSpacing,
              fontWeight: tStyle.text.fontWeight,
              fontStyle: tStyle.text.italic ? 'italic' : 'normal',
              color: tStyle.text.color,
              textAlign: tStyle.text.align,
              textTransform: tStyle.text.uppercase ? 'uppercase' : 'none',
              ...(tStyle.text.shadow
                ? {
                    textShadowColor: 'rgba(0, 0, 0, 0.45)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                  }
                : {}),
            },
          ]}
        >
          {fitted.truncatedText}
        </Text>

        {/* Tác giả */}
        {canShowAuthor && (
          <Text
            style={[
              styles.authorText,
              {
                fontFamily: fontFam,
                fontSize: authorFontSize,
                color: tStyle.text.color,
                textAlign: tStyle.text.align,
                marginTop: authorFontSize * 0.5,
              },
            ]}
          >
            {tStyle.author.prefix ? `${tStyle.author.prefix} ` : ''}
            {quote.author}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  box: {
    position: 'absolute',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  quoteText: {
    padding: 0,
    margin: 0,
  },
  authorText: {
    opacity: 0.85,
    letterSpacing: 0.2,
  },
});
