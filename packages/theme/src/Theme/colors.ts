import type { PaletteOptions } from '@mui/material'

interface MaskColor {
    main: string
    textPrimary: string
    textPluginColor: string
    textSecondary: string
    normalText: string
    textLight: string
    second: string
    third: string
    primaryMain: string
    secondaryMain: string
    thirdMain: string
    bg: string
    bottom: string
    bottomBg: string
    shadowBottom: string
    secondaryBottom: string
    input: string
    modalTitleBg: string
    highlight: string
    line: string
    secondaryLine: string
    tips: string
    whiteBlue: string
    primary: string
    success: string
    warn: string
    orangeMain: string
    redMain: string
    twitterBorderLine: string
    setupGuideBorder: string
    danger: string
    white: string
    secondaryDark: string
    secondaryMainDark: string
    dark: string
    publicMain: string
    publicSecond: string
    publicThird: string
    publicLine: string
    publicTwitter: string
    publicThirdMain: string
    publicBg: string
    publicInput: string
    borderSecondary: string
}

interface MaskColorShadow {
    popup: string
    selectMenu: string
    tooltip: string
}

declare module '@mui/material/styles' {
    interface Palette {
        maskColor: MaskColor
        shadow: MaskColorShadow
        secondaryDivider: string
    }

    interface PaletteOptions {
        maskColor?: MaskColor
        shadow?: MaskColorShadow
        secondaryDivider?: string
    }

    interface CssVarsPalette {
        maskColor: MaskColor
        shadow: MaskColorShadow
        secondaryDivider: string
    }

    interface TypeText {
        third: string
        strong: string
        buttonText: string
        twitterButton: string
        twitterButtonText: string
    }

    interface TypeBackground {
        input: string
        tipMask: string
        twitterTooltipBg: string
        primaryBackground2: string
        mainBackground: string
    }

    interface TypeAction {
        mask: string
    }
}

export const alpha = (color: string, opacity: number) =>
    `color-mix(in srgb, ${color}, transparent ${(1 - opacity) * 100}%)`

export const lighten = (color: string, coefficient: number) =>
    `color-mix(in srgb, ${color}, white ${coefficient * 100}%)`

export const LightMaskColors = {
    mode: 'light',
    primary: { main: '#1c68f3' },
    grey: {
        '700': '#536471',
        '300': '#b9cad3',
        '200': '#cfd9de',
        '50': '#eff3f4',
    },
    text: {
        primary: '#07101B',
        secondary: '#767F8D',
        third: '#ACB4C1',
        strong: '#111418',
        buttonText: '#FFFFFF',
        twitterButton: '#111418',
        twitterButtonText: '#FFFFFF',
    },
    maskColor: {
        main: '#07101B',
        textPrimary: '#111432',
        textPluginColor: '#07101B',
        textSecondary: '#7B8192',
        normalText: '#7B8192',
        textLight: '#A6A9B6',
        second: '#767F8D',
        third: '#ACB4C1',
        primaryMain: '#B5B7BB',
        secondaryMain: '#CDCFD1',
        thirdMain: '#F3F3F4',
        bg: '#F9F9F9',
        bottom: '#FFFFFF',
        bottomBg: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        shadowBottom: '#000000',
        secondaryBottom: 'rgba(255, 255, 255, 0.8)',
        input: '#F2F6FA',
        modalTitleBg:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
        highlight: '#1C68F3',
        line: '#F2F5F6',
        secondaryLine: '#E6E7E8',
        tips: 'rgba(0, 0, 0, 0.9)',
        whiteBlue:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        primary: '#1C68F3',
        success: '#3DC233',
        warn: '#FFB100',
        orangeMain: '#FFB915',
        redMain: '#FF5F5F',
        twitterBorderLine: '#EDF1F2',
        setupGuideBorder: '#536471',
        danger: '#FF3545',
        white: '#ffffff',
        secondaryDark: '#767F8D',
        secondaryMainDark: '#181818',
        dark: '#07101B',
        publicMain: '#07101B',
        publicSecond: '#767F8D',
        publicThird: '#ACB4C1',
        publicLine: '#F2F5F6',
        publicTwitter: '#1D9BF0',
        publicThirdMain: '#F3F3F4',
        publicBg: '#F9F9F9',
        publicInput: '#F2F6FA',
        borderSecondary: '#d2dbe0',
    },
    shadow: {
        popup: '0px 4px 30px rgba(0, 0, 0, 0.1)',
        selectMenu: '0px 4px 30px rgba(0, 0, 0, 0.1)',
        tooltip: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    background: {
        default: '#F9F9F9',
        input: '#F2F6FA',
        tipMask: 'rgba(0, 0, 0, 0.85)',
        twitterTooltipBg: 'rgba(0, 0, 0, 0.6)',
        primaryBackground2: '#FBFBFC',
        mainBackground: '#FFFFFF',
        paper: '#ffffff',
    },
    error: {
        main: '#F4212E',
    },
    divider: '#EFF3F4',
    secondaryDivider: '#CFD9DE',
    action: {
        mask: 'rgba(0, 0, 0, 0.4)',
    },
} as const satisfies PaletteOptions

export const DarkMaskColors = {
    primary: { main: '#1c68f3' },
    grey: {
        '700': '#8899a6',
        '300': '#6b7d8c',
        '200': '#3d5466',
        '50': '#253341',
    },
    maskColor: {
        main: '#F5F5F5',
        textPrimary: '#FFFFFF',
        textPluginColor: '#07101B',
        textSecondary: 'ghostwhite',
        normalText: 'rgba(255, 255, 255, 0.8)',
        textLight: '#A6A9B6',
        second: 'rgba(255, 255, 255, 0.78)',
        third: 'rgba(255, 255, 255, 0.44)',
        primaryMain: 'rgba(255, 255, 255, 0.28)',
        secondaryMain: 'rgba(255, 255, 255, 0.13)',
        thirdMain: 'rgba(255, 255, 255, 0.11)',
        bg: 'rgba(255, 255, 255, 0.08)',
        bottom: '#030303',
        bottomBg: '0px 0px 20px rgba(255, 255, 255, 0.12)',
        secondaryBottom: 'rgba(0, 0, 0, 0.8)',
        input: 'rgba(255, 255, 255, 0.15)',
        shadowBottom: '#ffffff',
        modalTitleBg: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)',
        highlight: '#FFFFFF',
        line: 'rgba(255, 255, 255, 0.18)',
        secondaryLine: 'rgba(255, 255, 255, 0.43)',
        tips: 'rgba(255, 255, 255, 0.9)',
        whiteBlue: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
        primary: '#1C68F3',
        success: '#3DC233',
        warn: '#FFB100',
        orangeMain: '#FFB915',
        redMain: '#FF5F5F',
        twitterBorderLine: '#2F3336',
        setupGuideBorder: '#6E767D',
        danger: '#FF3545',
        white: '#ffffff',
        secondaryDark: '#767F8D',
        secondaryMainDark: '#181818',
        dark: '#07101B',
        publicMain: '#07101B',
        publicSecond: '#767F8D',
        publicThird: '#ACB4C1',
        publicLine: '#F2F5F6',
        publicTwitter: '#1D9BF0',
        publicThirdMain: '#F3F3F4',
        publicBg: '#F9F9F9',
        publicInput: '#F2F6FA',
        borderSecondary: '#536471',
    },
    shadow: {
        popup: '0px 4px 30px rgba(255, 255, 255, 0.15)',
        selectMenu: '0px 4px 30px rgba(255, 255, 255, 0.15)',
        tooltip: '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
    text: {
        primary: '#F5F5F5',
        secondary: '#C4C7CD',
        third: '#666C75',
        strong: '#FFFFFF',
        buttonText: '#0F1419',
        twitterButton: '#EFF3F4',
        twitterButtonText: '#0F1419',
    },
    background: {
        default: '#1C1C1C',
        input: '#26292C',
        tipMask: 'rgba(255, 255, 255, 0.85)',
        twitterTooltipBg: 'rgba(91, 112, 131, 0.6)',
        primaryBackground2: '#212442',
        mainBackground: '#111432',
        paper: '#101010',
    },
    error: {
        main: '#FF5555',
    },
    divider: '#38444D',
    secondaryDivider: '#38444D',
    action: {
        mask: 'rgba(91, 112, 131, 0.4)',
    },
} as const satisfies PaletteOptions

export const MaskColors = {
    light: LightMaskColors,
    dark: DarkMaskColors,
} as const
