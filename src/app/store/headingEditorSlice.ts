import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
export type Alignment = 'left' | 'center' | 'right' | 'justify';
export type FontFamily = 'Primary' | 'Secondary' | 'Text' | 'Accent';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type FontStyle = 'normal' | 'italic' | 'oblique';
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
export type Position = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
export type WidthType = 'default' | 'full' | 'inline' | 'custom';
export type SizeType = 'default' | 'fit-content' | 'custom';

export interface HeadingContent {
  title: string;
  link: string;
  htmlTag: HTMLTag;
  animatedHeadline: boolean;
}

export interface TypographyStyles {
  fontFamily: FontFamily;
  fontSize: number;
  fontSizeUnit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh';
  fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  textTransform: TextTransform;
  fontStyle: FontStyle;
  textDecoration: TextDecoration;
  lineHeight: number;
  lineHeightUnit: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh' | 'normal';
  letterSpacing: number;
  letterSpacingUnit: 'px' | 'em' | 'rem';
  wordSpacing: number;
  wordSpacingUnit: 'px' | 'em' | 'rem';
}

export interface TextStroke {
  enabled: boolean;
  width: number;
  widthUnit: 'px' | 'em' | 'rem';
  color: string;
}

export interface TextShadow {
  enabled: boolean;
  color: string;
  blur: number;
  blurUnit: 'px';
  horizontal: number;
  horizontalUnit: 'px';
  vertical: number;
  verticalUnit: 'px';
}

export interface Margin {
  top: number | '';
  right: number | '';
  bottom: number | '';
  left: number | '';
  unit: 'px' | '%' | 'em' | 'rem';
  linked: boolean;
}

export interface Padding {
  top: number | '';
  right: number | '';
  bottom: number | '';
  left: number | '';
  unit: 'px' | '%' | 'em' | 'rem';
  linked: boolean;
}

export interface BackgroundSettings {
  type: 'none' | 'color' | 'gradient' | 'image';
  color: string;
  gradient: {
    type: 'linear' | 'radial';
    direction: string;
    colors: string[];
  };
  image: {
    url: string;
  };
}

export interface TransformSettings {
  rotate: number;
  rotateUnit: 'deg';
  scale: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewXUnit: 'deg';
  skewY: number;
  skewYUnit: 'deg';
  translateX: number;
  translateXUnit: 'px' | '%' | 'vw' | 'vh';
  translateY: number;
  translateYUnit: 'px' | '%' | 'vw' | 'vh';
  transformOrigin: 'top left' | 'top center' | 'top right' | 'center left' | 'center center' | 'center right' | 'bottom left' | 'bottom center' | 'bottom right';
}

export interface BorderSettings {
  type: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  width: number;
  widthUnit: 'px';
  color: string;
  radius: number;
  radiusUnit: 'px' | '%';
  radiusTop: number;
  radiusRight: number;
  radiusBottom: number;
  radiusLeft: number;
  radiusLinked: boolean;
}

export interface ResponsiveSettings {
  hideOnDesktop: boolean;
  hideOnTabletPortrait: boolean;
  hideOnMobilePortrait: boolean;
}

export interface AdvancedSettings {
  margin: Margin;
  padding: Padding;
  width: WidthType;
  widthValue: number;
  widthUnit: 'px' | '%' | 'vw' | 'vw';
  alignSelf: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  order: number | '';
  size: SizeType;
  minWidth: number | '';
  minWidthUnit: 'px' | '%' | 'vw';
  maxWidth: number | '';
  maxWidthUnit: 'px' | '%' | 'vw';
  minHeight: number | '';
  minHeightUnit: 'px' | '%' | 'vh';
  maxHeight: number | '';
  maxHeightUnit: 'px' | '%' | 'vh';
  position: Position;
  zIndex: number | '';
  cssId: string;
  cssClasses: string;
  background: {
    normal: BackgroundSettings;
    hover: BackgroundSettings;
  };
  transform: {
    normal: TransformSettings;
    hover: TransformSettings;
  };
  border: {
    normal: BorderSettings;
    hover: BorderSettings;
  };
  responsive: ResponsiveSettings;
}

export interface HeadingStyles {
  alignment: Alignment;
  typography: TypographyStyles;
  textStroke: TextStroke;
  textShadow: TextShadow;
  blendMode: BlendMode;
  textColor: string;
}

export interface HeadingComponentState {
  id: string;
  content: HeadingContent;
  styles: HeadingStyles;
  advanced: AdvancedSettings;
}

export interface HeadingEditorState {
  isOpen: boolean;
  activeTab: 'content' | 'style' | 'advanced';
  activeComponentId: string | null;
  components: Record<string, HeadingComponentState>;
}

const defaultTypography: TypographyStyles = {
  fontFamily: 'Primary',
  fontSize: 32,
  fontSizeUnit: 'px',
  fontWeight: '600',
  textTransform: 'none',
  fontStyle: 'normal',
  textDecoration: 'none',
  lineHeight: 1.2,
  lineHeightUnit: 'normal',
  letterSpacing: 0,
  letterSpacingUnit: 'px',
  wordSpacing: 0,
  wordSpacingUnit: 'px',
};

const defaultTextStroke: TextStroke = {
  enabled: false,
  width: 0,
  widthUnit: 'px',
  color: '#000000',
};

const defaultTextShadow: TextShadow = {
  enabled: false,
  color: '#000000',
  blur: 0,
  blurUnit: 'px',
  horizontal: 0,
  horizontalUnit: 'px',
  vertical: 0,
  verticalUnit: 'px',
};

const defaultMargin: Margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
};

const defaultPadding: Padding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  unit: 'px',
  linked: true,
};

const defaultBackground: BackgroundSettings = {
  type: 'none',
  color: '#ffffff',
  gradient: {
    type: 'linear',
    direction: 'to right',
    colors: ['#ffffff', '#000000'],
  },
  image: {
    url: '',
  },
};

const defaultTransform: TransformSettings = {
  rotate: 0,
  rotateUnit: 'deg',
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewXUnit: 'deg',
  skewY: 0,
  skewYUnit: 'deg',
  translateX: 0,
  translateXUnit: 'px',
  translateY: 0,
  translateYUnit: 'px',
  transformOrigin: 'center center',
};

const defaultBorder: BorderSettings = {
  type: 'none',
  width: 0,
  widthUnit: 'px',
  color: '#000000',
  radius: 0,
  radiusUnit: 'px',
  radiusTop: 0,
  radiusRight: 0,
  radiusBottom: 0,
  radiusLeft: 0,
  radiusLinked: true,
};

const defaultResponsive: ResponsiveSettings = {
  hideOnDesktop: false,
  hideOnTabletPortrait: false,
  hideOnMobilePortrait: false,
};

const defaultAdvanced: AdvancedSettings = {
  margin: defaultMargin,
  padding: defaultPadding,
  width: 'default',
  widthValue: 100,
  widthUnit: '%',
  alignSelf: 'auto',
  order: '',
  size: 'default',
  minWidth: '',
  minWidthUnit: 'px',
  maxWidth: '',
  maxWidthUnit: 'px',
  minHeight: '',
  minHeightUnit: 'px',
  maxHeight: '',
  maxHeightUnit: 'px',
  position: 'static',
  zIndex: '',
  cssId: '',
  cssClasses: '',
  background: {
    normal: { ...defaultBackground },
    hover: { ...defaultBackground },
  },
  transform: {
    normal: { ...defaultTransform },
    hover: { ...defaultTransform },
  },
  border: {
    normal: { ...defaultBorder },
    hover: { ...defaultBorder },
  },
  responsive: defaultResponsive,
};

const createDefaultComponent = (id: string): HeadingComponentState => ({
  id,
  content: {
    title: 'Heading Text',
    link: '',
    htmlTag: 'h2',
    animatedHeadline: false,
  },
  styles: {
    alignment: 'left',
    typography: { ...defaultTypography },
    textStroke: { ...defaultTextStroke },
    textShadow: { ...defaultTextShadow },
    blendMode: 'normal',
    textColor: '#000000',
  },
  advanced: { ...defaultAdvanced },
});

const initialState: HeadingEditorState = {
  isOpen: false,
  activeTab: 'content',
  activeComponentId: null,
  components: {},
};

const headingEditorSlice = createSlice({
  name: 'headingEditor',
  initialState,
  reducers: {
    openHeadingEditor: (state, action: PayloadAction<{ componentId: string }>) => {
      const { componentId } = action.payload;
      state.isOpen = true;
      state.activeComponentId = componentId;
      state.activeTab = 'content';
      
      // Create default component state if it doesn't exist
      if (!state.components[componentId]) {
        state.components[componentId] = createDefaultComponent(componentId);
      }
    },
    
    closeHeadingEditor: (state) => {
      state.isOpen = false;
      state.activeComponentId = null;
    },
    
    setActiveTab: (state, action: PayloadAction<'content' | 'style' | 'advanced'>) => {
      state.activeTab = action.payload;
    },
    
    updateHeadingContent: (state, action: PayloadAction<{
      componentId: string;
      content: Partial<HeadingContent>;
    }>) => {
      const { componentId, content } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].content = {
          ...state.components[componentId].content,
          ...content,
        };
      }
    },
    
    updateHeadingTitle: (state, action: PayloadAction<{
      componentId: string;
      title: string;
    }>) => {
      const { componentId, title } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].content.title = title;
      }
    },
    
    updateHeadingAlignment: (state, action: PayloadAction<{
      componentId: string;
      alignment: Alignment;
    }>) => {
      const { componentId, alignment } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].styles.alignment = alignment;
      }
    },
    
    updateHeadingTypography: (state, action: PayloadAction<{
      componentId: string;
      typography: Partial<TypographyStyles>;
    }>) => {
      const { componentId, typography } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].styles.typography = {
          ...state.components[componentId].styles.typography,
          ...typography,
        };
      }
    },
    
    updateHeadingTextStroke: (state, action: PayloadAction<{
      componentId: string;
      textStroke: Partial<TextStroke>;
    }>) => {
      const { componentId, textStroke } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].styles.textStroke = {
          ...state.components[componentId].styles.textStroke,
          ...textStroke,
        };
      }
    },
    
    updateHeadingTextShadow: (state, action: PayloadAction<{
      componentId: string;
      textShadow: Partial<TextShadow>;
    }>) => {
      const { componentId, textShadow } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].styles.textShadow = {
          ...state.components[componentId].styles.textShadow,
          ...textShadow,
        };
      }
    },
    
    updateHeadingTextColor: (state, action: PayloadAction<{
      componentId: string;
      color: string;
    }>) => {
      const { componentId, color } = action.payload;
      console.log('Slice: updateHeadingTextColor', componentId, color);
      if (state.components[componentId]) {
        state.components[componentId].styles.textColor = color;
        console.log('Slice: Full component after update:', JSON.stringify(state.components[componentId], null, 2));
      }
    },
    
    updateHeadingBlendMode: (state, action: PayloadAction<{
      componentId: string;
      blendMode: BlendMode;
    }>) => {
      const { componentId, blendMode } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].styles.blendMode = blendMode;
      }
    },
    
    updateHeadingAdvanced: (state, action: PayloadAction<{
      componentId: string;
      advanced: Partial<AdvancedSettings>;
    }>) => {
      const { componentId, advanced } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].advanced = {
          ...state.components[componentId].advanced,
          ...advanced,
        };
      }
    },
    
    updateHeadingMargin: (state, action: PayloadAction<{
      componentId: string;
      margin: Partial<Margin>;
    }>) => {
      const { componentId, margin } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].advanced.margin = {
          ...state.components[componentId].advanced.margin,
          ...margin,
        };
      }
    },
    
    updateHeadingPadding: (state, action: PayloadAction<{
      componentId: string;
      padding: Partial<Padding>;
    }>) => {
      const { componentId, padding } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].advanced.padding = {
          ...state.components[componentId].advanced.padding,
          ...padding,
        };
      }
    },
    
    resetHeadingToDefault: (state, action: PayloadAction<{ componentId: string }>) => {
      const { componentId } = action.payload;
      state.components[componentId] = createDefaultComponent(componentId);
    },
    
    initializeHeadingComponent: (state, action: PayloadAction<{ componentId: string }>) => {
      const { componentId } = action.payload;
      if (!state.components[componentId]) {
        state.components[componentId] = createDefaultComponent(componentId);
      }
    },

    updateHeadingBackground: (state, action: PayloadAction<{
      componentId: string;
      background: Partial<BackgroundSettings>;
      state?: 'normal' | 'hover';
    }>) => {
      const { componentId, background, state: bgState = 'normal' } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].advanced.background[bgState] = {
          ...state.components[componentId].advanced.background[bgState],
          ...background,
        };
      }
    },

    updateHeadingTransform: (state, action: PayloadAction<{
      componentId: string;
      transform: Partial<TransformSettings>;
      state?: 'normal' | 'hover';
    }>) => {
      const { componentId, transform, state: transformState = 'normal' } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].advanced.transform[transformState] = {
          ...state.components[componentId].advanced.transform[transformState],
          ...transform,
        };
      }
    },

    updateHeadingBorder: (state, action: PayloadAction<{
      componentId: string;
      border: Partial<BorderSettings>;
      state?: 'normal' | 'hover';
    }>) => {
      const { componentId, border, state: borderState = 'normal' } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].advanced.border[borderState] = {
          ...state.components[componentId].advanced.border[borderState],
          ...border,
        };
      }
    },

    updateHeadingResponsive: (state, action: PayloadAction<{
      componentId: string;
      responsive: Partial<ResponsiveSettings>;
    }>) => {
      const { componentId, responsive } = action.payload;
      if (state.components[componentId]) {
        state.components[componentId].advanced.responsive = {
          ...state.components[componentId].advanced.responsive,
          ...responsive,
        };
      }
    },

    syncHeadingEditorState: (state, action: PayloadAction<Partial<HeadingEditorState>>) => {
      const newState = action.payload;
      console.log('Slice: syncHeadingEditorState received components count:', Object.keys(newState.components || {}).length);
      if (newState.components) {
        // Merge each component instead of replacing to preserve default structure
        Object.keys(newState.components).forEach((compId) => {
          const receivedComp = newState.components![compId];
          const existingComp = state.components[compId];
          
          if (existingComp) {
            // Deep merge to preserve defaults while updating changed values
            state.components[compId] = {
              ...existingComp,
              content: { ...existingComp.content, ...receivedComp.content },
              styles: { ...existingComp.styles, ...receivedComp.styles },
              advanced: {
                ...existingComp.advanced,
                ...receivedComp.advanced,
                // Deep merge nested objects
                background: receivedComp.advanced?.background ? {
                  normal: { ...existingComp.advanced.background.normal, ...receivedComp.advanced.background.normal },
                  hover: { ...existingComp.advanced.background.hover, ...receivedComp.advanced.background.hover },
                } : existingComp.advanced.background,
                transform: receivedComp.advanced?.transform ? {
                  normal: { ...existingComp.advanced.transform.normal, ...receivedComp.advanced.transform.normal },
                  hover: { ...existingComp.advanced.transform.hover, ...receivedComp.advanced.transform.hover },
                } : existingComp.advanced.transform,
                border: receivedComp.advanced?.border ? {
                  normal: { ...existingComp.advanced.border.normal, ...receivedComp.advanced.border.normal },
                  hover: { ...existingComp.advanced.border.hover, ...receivedComp.advanced.border.hover },
                } : existingComp.advanced.border,
              },
            };
            console.log('Slice: Merged component', compId, 'result:', JSON.stringify(state.components[compId], null, 2));
          } else {
            // New component - ensure it has the proper structure with normal/hover
            state.components[compId] = receivedComp;
            console.log('Slice: Added new component', compId);
          }
        });
      }
      if (newState.isOpen !== undefined) state.isOpen = newState.isOpen;
      if (newState.activeTab !== undefined) state.activeTab = newState.activeTab;
      if (newState.activeComponentId !== undefined) state.activeComponentId = newState.activeComponentId;
    },
  },
});

export const {
  openHeadingEditor,
  closeHeadingEditor,
  setActiveTab,
  updateHeadingContent,
  updateHeadingTitle,
  updateHeadingAlignment,
  updateHeadingTypography,
  updateHeadingTextStroke,
  updateHeadingTextShadow,
  updateHeadingTextColor,
  updateHeadingBlendMode,
  updateHeadingAdvanced,
  updateHeadingMargin,
  updateHeadingPadding,
  resetHeadingToDefault,
  initializeHeadingComponent,
  updateHeadingBackground,
  updateHeadingTransform,
  updateHeadingBorder,
  updateHeadingResponsive,
  syncHeadingEditorState,
} = headingEditorSlice.actions;

export default headingEditorSlice.reducer;
