import type { StudioId } from '../types';
import alongsideLogo from '../assets/svg/studios/Received/Alongside_vA_logo_black [Converted].svg?raw';
import bonfireLogo from '../assets/svg/studios/Received/Bonfire.svg?raw';
import heroNextDoorLogo from '../assets/svg/studios/Received/HND.svg?raw';
import organsLogo from '../assets/svg/studios/Received/AlongSide_All Brands_Organs.svg?raw';
import saddingtonBaynesLogo from '../assets/svg/studios/Received/Saddington.svg?raw';
import sombraLabsLogo from '../assets/svg/studios/Received/AlongSide_All Brands_Sombra Labs.svg?raw';

type StudioLogoProps = {
  id: StudioId | 'alongside';
  title?: string;
  className?: string;
};

const logoText: Record<StudioLogoProps['id'], string> = {
  alongside: 'ALONGSIDE',
  bonfire: 'BONFIRE',
  'saddington-baynes': 'S+B',
  'sombra-labs': 'SOMBRA',
  'hero-next-door': 'HND',
  organs: 'ORGANS',
};

const logoSrc: Record<StudioLogoProps['id'], string> = {
  alongside: alongsideLogo,
  bonfire: bonfireLogo,
  'saddington-baynes': saddingtonBaynesLogo,
  'sombra-labs': sombraLabsLogo,
  'hero-next-door': heroNextDoorLogo,
  organs: organsLogo,
};

const normalizedViewBoxes: Partial<Record<StudioLogoProps['id'], string>> = {
  'sombra-labs': '39 136 422 229',
};

const sanitizeLogo = (svg: string, id: StudioLogoProps['id']) => {
  const viewBox = normalizedViewBoxes[id];

  return svg
    .replace(/<\?xml[^>]*>\s*/i, '')
    .replace(/<svg\b/i, '<svg aria-hidden="true" focusable="false"')
    .replace(/viewBox="[^"]*"/i, (match) => (viewBox ? `viewBox="${viewBox}"` : match))
    .replace(/fill:\s*#[0-9a-fA-F]+;?/g, 'fill: currentColor;')
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"');
};

export function StudioLogo({ id, title, className }: StudioLogoProps) {
  return (
    <span
      aria-label={title ?? logoText[id]}
      className={className}
      data-logo={id}
      dangerouslySetInnerHTML={{ __html: sanitizeLogo(logoSrc[id], id) }}
      role="img"
    />
  );
}
