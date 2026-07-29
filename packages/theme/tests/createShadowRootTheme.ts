import { describe, expect, test } from 'vitest'
import { unstable_createMuiStrictModeTheme } from '@mui/material'
// eslint-disable-next-line import/no-empty-named-blocks, unicorn/require-module-specifiers
import type {} from '@mui/material/themeCssVarsAugmentation'
import { createShadowRootTheme } from '../src/Theme/createShadowRootTheme.js'
import { MaskTheme } from '../src/Theme/theme.js'

type StyleSheet = Record<string, unknown>

function collectCssVariables(styleSheets: StyleSheet[]) {
    const variables: Array<[string, string | number]> = []
    const visit = (value: unknown) => {
        if (!value || typeof value !== 'object') return
        for (const [key, child] of Object.entries(value)) {
            if (key.startsWith('--') && (typeof child === 'string' || typeof child === 'number')) {
                variables.push([key, child])
            } else {
                visit(child)
            }
        }
    }
    visit(styleSheets)
    return variables.toSorted(([leftKey, leftValue], [rightKey, rightValue]) =>
        `${leftKey}:${leftValue}`.localeCompare(`${rightKey}:${rightValue}`),
    )
}

function getStyleSheets(theme: object) {
    return (theme as { generateStyleSheets(): StyleSheet[] }).generateStyleSheets()
}

describe('createShadowRootTheme', () => {
    test('preserves every generated CSS variable', () => {
        const theme = createShadowRootTheme(MaskTheme)

        expect(collectCssVariables(getStyleSheets(theme))).toEqual(collectCssVariables(getStyleSheets(MaskTheme)))
        expect(theme.spacing(1)).toBe('var(--mui-spacing, 8px)')
        expect(theme.spacing(1.5)).toBe('calc(1.5 * var(--mui-spacing, 8px))')
    })

    test('uses site adaptor changes from the default color scheme', () => {
        const lightScheme = MaskTheme.colorSchemes.light!
        const customizedTheme = {
            ...MaskTheme,
            colorSchemes: {
                ...MaskTheme.colorSchemes,
                light: {
                    ...lightScheme,
                    palette: {
                        ...lightScheme.palette,
                        primary: { ...lightScheme.palette.primary, main: '#123456' },
                    },
                },
            },
        } as unknown as typeof MaskTheme
        const variables = collectCssVariables(getStyleSheets(createShadowRootTheme(customizedTheme)))

        expect(variables).toContainEqual(['--mui-palette-primary-main', '#123456'])
    })

    test.each([
        { spacing: 10, expected: 'var(--mui-spacing, 10px)' },
        { spacing: '0.5rem', expected: 'var(--mui-spacing, 0.5rem)' },
        { spacing: [0, 4, 8], expected: 'var(--mui-spacing-1, 4px)' },
    ])('preserves the $spacing spacing configuration', ({ spacing, expected }) => {
        const theme = unstable_createMuiStrictModeTheme({ cssVariables: true, spacing })
        const shadowTheme = createShadowRootTheme(theme)

        expect(collectCssVariables(getStyleSheets(shadowTheme))).toEqual(collectCssVariables(getStyleSheets(theme)))
        expect(shadowTheme.spacing(1)).toBe(expected)
    })
})
