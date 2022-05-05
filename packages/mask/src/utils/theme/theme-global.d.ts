declare module '@mui/material/styles/createPalette.d' {
    export interface Palette {
        secondaryDivider: string
        public: {
            primary: string
            success: string
            warning: string
            danger: string
            white: string
            dark: string
            secondaryDark: string
            line: string
            secondaryLine: string
            highlight: string
        }
    }
    export interface TypeText {
        third: string
        hint: string
        strong: string
        buttonText: string
    }
    export interface TypeAction {
        buttonHover: string
        bgHover: string
        mask: string
    }
    export interface TypeBackground {
        input: string
        tipMask: string
        messageShadow: string
        modalTitle: string
    }
}

declare module '@mui/material/index.d' {
    export interface Color {
        primary: string
        second: string
        third: string
    }
}
export {}
