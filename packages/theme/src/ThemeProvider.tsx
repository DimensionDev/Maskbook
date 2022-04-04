import { CssBaseline, Theme, ThemeProvider } from '@mui/material'
import { MaskIconPalette, MaskIconPaletteContext } from '@masknet/icons'
import { CustomSnackbarProvider } from './Components/Snackbar'

function compose(init: React.ReactNode, ...f: ((children: React.ReactNode) => JSX.Element)[]) {
    return f.reduceRight((prev, curr) => curr(prev), <>{init}</>)
}
const identity = (jsx: React.ReactNode) => jsx as JSX.Element

export interface MaskThemeProvider extends React.PropsWithChildren<{}> {
    baseline: boolean
    useTheme(): Theme
    useMaskIconPalette(theme: Theme): MaskIconPalette
    CustomSnackbarOffsetY?: number
}
export function MaskThemeProvider(props: MaskThemeProvider) {
    const { children, baseline, useTheme, useMaskIconPalette, CustomSnackbarOffsetY } = props
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
        baseline
            ? (jsx) => (
                  <>
                      <CssBaseline />
                      {jsx}
                  </>
              )
            : identity,
    )
}
