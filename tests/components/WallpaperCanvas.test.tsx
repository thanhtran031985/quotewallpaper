import React from 'react';
import { render } from '@testing-library/react-native';
import { WallpaperCanvas } from '@/components/WallpaperCanvas';
import { BUILTIN_TEMPLATES } from '@/templates/builtin';
import { Quote, WallpaperImage } from '@/domain/types';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image" {...props} />,
  };
});

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => <View testID="blur-view" {...props} />,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View testID="linear-gradient" {...props} />,
  };
});

const mockImage: WallpaperImage = {
  id: 'img-1',
  name: 'Bình minh',
  source: 'default',
  uri: 'default-1',
  width: 1080,
  height: 1920,
  focalPoint: { x: 0.5, y: 0.3 },
  enabled: true,
  createdAt: '2026-01-01',
};

const mockQuote: Quote = {
  id: 'q-1',
  text: 'Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc.',
  author: 'Ngạn ngữ phương Đông',
  enabled: true,
  favorite: false,
  source: 'default',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('WallpaperCanvas Component', () => {
  it.each(BUILTIN_TEMPLATES)('TC-UI-01: render thành công template $id ($name)', async (tpl) => {
    const { getByTestId } = await render(
      <WallpaperCanvas
        image={mockImage}
        quote={mockQuote}
        template={tpl}
        width={390}
        height={844}
        showAuthor={true}
        testID={`canvas-${tpl.id}`}
      />,
    );

    expect(getByTestId(`canvas-${tpl.id}`)).toBeTruthy();
  });

  it('TC-UI-02: hiển thị tiếng Việt có dấu (ệ, ữ, ỗ) không lỗi', async () => {
    const vnQuote: Quote = {
      ...mockQuote,
      text: 'Những điều kỳ diệu sẽ xảy đến khi bạn kiên trì và nỗ lực hết mình.',
      author: 'Nguyễn Du',
    };

    const { getByText } = await render(
      <WallpaperCanvas
        image={mockImage}
        quote={vnQuote}
        template={BUILTIN_TEMPLATES[0]}
        width={390}
        height={844}
        showAuthor={true}
        testID="canvas-vn"
      />,
    );

    expect(getByText(/kỳ diệu.*kiên trì.*nỗ lực/)).toBeTruthy();
    expect(getByText(/Nguyễn Du/)).toBeTruthy();
  });

  it('ẩn tác giả khi showAuthor = false', async () => {
    const { queryByText } = await render(
      <WallpaperCanvas
        image={mockImage}
        quote={mockQuote}
        template={BUILTIN_TEMPLATES[0]}
        width={390}
        height={844}
        showAuthor={false}
        testID="canvas-no-author"
      />,
    );

    expect(queryByText(/Ngạn ngữ phương Đông/)).toBeNull();
  });

  it('ẩn tác giả khi template.style.author.show = false', async () => {
    const noAuthorTemplate = {
      ...BUILTIN_TEMPLATES[0],
      style: {
        ...BUILTIN_TEMPLATES[0].style,
        author: {
          ...BUILTIN_TEMPLATES[0].style.author,
          show: false,
        },
      },
    };

    const { queryByText } = await render(
      <WallpaperCanvas
        image={mockImage}
        quote={mockQuote}
        template={noAuthorTemplate}
        width={390}
        height={844}
        showAuthor={true}
        testID="canvas-tpl-no-author"
      />,
    );

    expect(queryByText(/Ngạn ngữ phương Đông/)).toBeNull();
  });
});
