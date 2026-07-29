import { type Theme, type ThemeOptions, unstable_createMuiStrictModeTheme } from '@mui/material'

function unwrapCssVariableFallback(value: string) {
    return /^var\([^,]+,\s*(.+)\)$/u.exec(value)?.[1] ?? value
}

function getSerializableSpacing(theme: Theme): ThemeOptions['spacing'] {
    const spacingVariable = (theme as { vars?: { spacing?: string | readonly string[] } }).vars?.spacing
    if (Array.isArray(spacingVariable)) return spacingVariable.map(unwrapCssVariableFallback)
    if (typeof spacingVariable === 'string') return unwrapCssVariableFallback(spacingVariable)
    return theme.spacing
}

function toThemeOptions(theme: Theme) {
    const { colorSchemes, defaultColorScheme } = theme as Theme & {
        colorSchemes?: Record<string, Record<string, unknown>>
        defaultColorScheme?: string
    }

    // MUI copies the default color scheme onto the Theme root. Feeding both copies
    // back into createTheme duplicates variables and lets stale root values overwrite
    // a site adaptor's changes under colorSchemes.
    const defaultScheme = defaultColorScheme ? colorSchemes?.[defaultColorScheme] : undefined
    const options = Object.fromEntries(Object.entries(theme).filter(([key]) => !defaultScheme || !(key in defaultScheme)))
    return options as ThemeOptions
}

export function createShadowRootTheme(theme: Theme) {
    return unstable_createMuiStrictModeTheme({
        ...toThemeOptions(theme),
        // A CSS-variable Theme exposes spacing as a function. Restore its serializable
        // input so recreating the Theme does not drop the spacing variable declarations.
        spacing: getSerializableSpacing(theme),
        cssVariables: {
            rootSelector: ':host',
            colorSchemeSelector: ':host-context([data-%s])',
        },
    })
}
