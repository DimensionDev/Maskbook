import { createMakeStyles, type CSSObject, type Css, type Cx } from 'tss-react'
import { useTheme, type Theme } from '@mui/material'

// Note: type refinement, see https://github.com/garronej/tss-react/issues/128
export const { makeStyles } = createMakeStyles({ useTheme }) as any as {
    makeStyles: <Params = void, RuleNameSubsetReferencedInNestedSelectors extends string = never>(params?: {
        name?: string | Record<string, unknown>
        uniqId?: string
    }) => <RuleName extends string>(
        cssObjectByRuleNameOrGetCssObjectByRuleName:
            | Record<RuleName, CSSObject>
            | ((
                  theme: Theme,
                  params: Params,
                  classes: Record<RuleNameSubsetReferencedInNestedSelectors, string>,
              ) => Record<RuleNameSubsetReferencedInNestedSelectors | RuleName, CSSObject>),
    ) => <StyleOverrides extends { classes?: { [key in string]?: string | undefined } }>(
        params: Params,
        styleOverrides?: {
            props: StyleOverrides
            ownerState?: Record<string, unknown>
        },
    ) => {
        classes: StyleOverrides extends { classes?: { [key in infer ExtraKeys]?: string | undefined } } ?
            Record<string extends ExtraKeys ? RuleName : ExtraKeys | RuleName, string>
        :   Record<RuleName, string>
        theme: Theme
        css: Css
        cx: Cx
    }
}
