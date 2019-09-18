import { createMuiTheme } from '@material-ui/core'
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme'
import indigo from '@material-ui/core/colors/indigo'
import orange from '@material-ui/core/colors/orange'

const _refTheme = createMuiTheme()
const _refThemeDark = createMuiTheme({ palette: { type: 'dark' } })

function getFontFamily(monospace?: boolean) {
    /**
     * The font list on every platform in CJK language is derived from
     * https://raw.githubusercontent.com/microsoft/vscode/332aaba6ded659529a7ae91e6ae0071ff1ef6ae8/src/vs/workbench/browser/media/style.css
     *
     * And following MIT License
     */
    function getAppleFontFamily() {
        return {
            default: '-apple-system, BlinkMacSystemFont, sans-serif',
            zhHans: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif',
            zhHant: '-apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif',
            ja: '-apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic Pro", sans-serif',
            ko: '-apple-system, BlinkMacSystemFont, "Nanum Gothic", "Apple SD Gothic Neo", "AppleGothic", sans-serif',
            monospace: 'Monaco, Menlo, Inconsolata, "Courier New", monospace',
        }
    }
    function getWindowsFontFamily() {
        return {
            default: '"Segoe WPC", "Segoe UI", sans-serif',
            zhHans: '"Segoe WPC", "Segoe UI", "Microsoft YaHei", sans-serif',
            zhHant: '"Segoe WPC", "Segoe UI", "Microsoft Jhenghei", sans-serif',
            ja: '"Segoe WPC", "Segoe UI", "Meiryo", sans-serif',
            ko: '"Segoe WPC", "Segoe UI", "Malgun Gothic", "Dotom", sans-serif',
            monospace: 'Consolas, Inconsolata, "Courier New", monospace',
        }
    }
    function getOtherFontFamily() {
        return {
            default: '"Ubuntu", "Droid Sans", sans-serif',
            zhHans: '"Ubuntu", "Droid Sans", "Source Han Sans SC", "Source Han Sans CN", "Source Han Sans", sans-serif',
            zhHant: '"Ubuntu", "Droid Sans", "Source Han Sans TC", "Source Han Sans TW", "Source Han Sans", sans-serif',
            ja: ' "Ubuntu", "Droid Sans", "Source Han Sans J", "Source Han Sans JP", "Source Han Sans", sans-serif',
            ko:
                '"Ubuntu", "Droid Sans", "Source Han Sans K", "Source Han Sans JR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim", sans-serif',
            monospace: '"Droid Sans Mono", Inconsolata, "Courier New", monospace, "Droid Sans Fallback"',
        }
    }

    const platform = navigator.platform.toLowerCase()
    const f = platform.match('win')
        ? getWindowsFontFamily()
        : platform.match(/ios|apple|mac/)
        ? getAppleFontFamily()
        : getOtherFontFamily()
    const language = navigator.language.toLowerCase()
    const jp = language.match('jp') || language.match('ja')
    const ko = language.match('ko')
    const hansLike = language.match('zh') && language.match('cn')
    const hantLike = language.match('zh') && (language.match('tw') || language.match('hk'))
    if (monospace) return f.monospace
    if (hantLike) return f.zhHant
    if (hansLike) return f.zhHans
    if (jp) return f.ja
    if (ko) return f.ko
    return f.default
}

const baseTheme = (theme: 'dark' | 'light') =>
    ({
        palette: {
            primary: { main: indigo[400] },
            secondary: { main: orange[800] },
            type: theme,
        },
        typography: {
            fontFamily: getFontFamily(),
        },
        shape: { borderRadius: 4 },
        overrides: {
            MuiButton: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    } as ThemeOptions)
// Theme
export const MaskbookLightTheme = createMuiTheme(baseTheme('light'))
export const MaskbookDarkTheme = createMuiTheme(baseTheme('dark'))
export const FixedWidthFonts = `Droid Sans Mono', Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif`
