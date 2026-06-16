export type AvatarPreset = {
  id: string;
  label: string;
  style: string;
  backgroundColor: string;
};

export const avatarPresets: AvatarPreset[] = [
  { id: 'sunny-spark', label: 'Sunny', style: 'fun-emoji', backgroundColor: 'ffd670' },
  { id: 'moon-dream', label: 'Dreamy', style: 'lorelei', backgroundColor: 'd1bff0' },
  { id: 'space-buddy', label: 'Space', style: 'bottts', backgroundColor: '7ab8e8' },
  { id: 'forest-friend', label: 'Forest', style: 'adventurer', backgroundColor: '8ce8b5' },
  { id: 'peach-hero', label: 'Hero', style: 'thumbs', backgroundColor: 'ffbfa8' },
  { id: 'pixel-pal', label: 'Pixel', style: 'pixel-art', backgroundColor: 'c4b5fd' },
];

const fallbackPreset = avatarPresets[0];

export const getAvatarPreset = (avatar?: string) =>
  avatarPresets.find((preset) => preset.id === avatar) || fallbackPreset;

export const getDiceBearAvatarUrl = (avatar: string | undefined, seed: string) => {
  const preset = getAvatarPreset(avatar);
  const safeSeed = encodeURIComponent(`${preset.id}-${seed || 'CharmChime'}`);
  const background = encodeURIComponent(preset.backgroundColor);

  return `https://api.dicebear.com/9.x/${preset.style}/svg?seed=${safeSeed}&backgroundColor=${background}&radius=50`;
};
