import { useTheme } from '@/contexts/ThemeContext';
import { JDMCinemaBackground } from './JDMCinemaBackground';
import { BlueprintBackground } from './BlueprintBackground';
import { JapaneseLofiBackground } from './JapaneseLofiBackground';
import { JDMStickerBombBackground } from './JDMStickerBombBackground';

export const ThemeBackground = () => {
  const { currentTheme } = useTheme();

  switch (currentTheme) {
    case 'cinema':
      return <JDMCinemaBackground />;
    case 'blueprint':
      return <BlueprintBackground />;
    case 'lofi':
      return <JapaneseLofiBackground />;
    case 'sticker':
      return <JDMStickerBombBackground />;
    default:
      return <JDMCinemaBackground />;
  }
};
