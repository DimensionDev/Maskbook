import { CssBaseline, Theme, ThemeProvider } from '@mui/material'
import { MaskIconPalette, MaskIconPaletteContext } from '@masknet/icons'
import { CustomSnackbarProvider } from '../Components'

function compose(init: React.ReactNode, ...f: Array<(children: React.ReactNode) => JSX.Element>) {
    // eslint-disable-next-line unicorn/no-array-reduce
    return f.reduceRight((prev, curr) => curr(prev), <>{init}</>)
}

export interface MaskThemeProvider extends React.PropsWithChildren<{}> {
    useTheme(): Theme
    useMaskIconPalette(theme: Theme): MaskIconPalette
    CustomSnackbarOffsetY?: number
}
export function MaskThemeProvider(props: MaskThemeProvider) {
    const { children, useTheme, useMaskIconPalette, CustomSnackbarOffsetY } = props
    const theme = useTheme()
    const MaskIconPalette = useMaskIconPalette(theme)

    return compose(
        children,
        (jsx) => <MaskIconPaletteContext.Provider value={MaskIconPalette}>{jsx}</MaskIconPaletteContext.Provider>,
        (jsx) => <ThemeProvider theme={theme} children={jsx} />,
        (jsx) => (
            <CustomSnackbarProvider
                disableWindowBlurListener={false}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                children={jsx}
                offsetY={CustomSnackbarOffsetY}
            />
        ),
        (jsx) => (
            <>
                <CssBaseline />
                {jsx}
            </>
        ),
    )
}
