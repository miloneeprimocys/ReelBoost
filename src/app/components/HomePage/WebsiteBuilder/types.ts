export interface HeroContent {
  title: string;

  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
  layout: 'left' | 'right' | 'center';
  titleColor: string;

  descriptionColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
  animation: 'fade' | 'slide' | 'bounce' | 'none';
  tags: string[];
  activeTag: string;
  appStoreImage: string;
  googlePlayImage: string;
  dotText: string;
  topAccentColor: string;
  bottomAccentColor: string;
}

export interface Section {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  ready: boolean;
  content: HeroContent | any;
}