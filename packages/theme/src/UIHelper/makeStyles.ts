import { createMakeStyles, type CSSObject, type Css, type Cx } from 'tss-react'
import { useTheme, type Theme } from '@mui/material'

const { makeStyles: baseMakeStyles } = createMakeStyles({ useTheme })

interface MakeStylesOptions {
    name?: string | { [property: string]: unknown }
    uniqId?: string
}

interface StyleRules { [property: string]: CSSObject | { [property: string]: unknown } }
//                                           ^ conceal the complaint like `position: string` not satisfy `position: CSSProperties['position']`

type NestedSelectorClasses<RuleNameSubsetReferencedInNestedSelectors extends string> = { [key in RuleNameSubsetReferencedInNestedSelectors]: string }

interface StyleOverrides {
    classes?: Partial<{ [property: string]: string | undefined }>
}

interface EmptyStyleOverrides {
    classes?: { [key in never]: never }
}

type StyleClassNames<Styles extends StyleRules> = {
    [Key in keyof Styles]: string
}

type ExtraClassKeys<Overrides extends StyleOverrides> =
    Overrides extends { classes?: infer Classes } ? Extract<keyof NonNullable<Classes>, string> : never

type OverrideClassNames<ExtraKeys extends string, BaseKeys extends PropertyKey> =
    string extends ExtraKeys ? { [property: string]: string }
    : { [key in Exclude<ExtraKeys, BaseKeys>]: string }

interface MakeStylesResult<Styles extends StyleRules, Overrides extends StyleOverrides> {
    classes: StyleClassNames<Styles> & OverrideClassNames<ExtraClassKeys<Overrides>, keyof Styles>
    theme: Theme
    css: Css
    cx: Cx
}

type GetCssObjectByRuleName<Params, RuleNameSubsetReferencedInNestedSelectors extends string> = (
    theme: Theme,
    params: Params,
    classes: NestedSelectorClasses<RuleNameSubsetReferencedInNestedSelectors>,
) => StyleRules

export interface UseStyles<Params, Styles extends StyleRules> {
    (params: Params): MakeStylesResult<Styles, EmptyStyleOverrides>
    <Overrides extends StyleOverrides>(
        params: Params,
        styleOverrides: {
            props: Overrides
            ownerState?: { [property: string]: unknown }
        },
    ): MakeStylesResult<Styles, Overrides>
}

interface MakeStylesHook<Params, RuleNameSubsetReferencedInNestedSelectors extends string> {
    <Styles extends StyleRules>(cssObjectByRuleName: Styles): UseStyles<Params, Styles>
    <T extends GetCssObjectByRuleName<Params, RuleNameSubsetReferencedInNestedSelectors>>(
        getCssObjectByRuleName: T,
    ): UseStyles<Params, ReturnType<T>>
}

// Note: type refinement, see https://github.com/garronej/tss-react/issues/128
export function makeStyles<Params = void, RuleNameSubsetReferencedInNestedSelectors extends string = never>(
    params?: MakeStylesOptions,
): MakeStylesHook<Params, RuleNameSubsetReferencedInNestedSelectors> {
    return baseMakeStyles(params) as unknown as MakeStylesHook<Params, RuleNameSubsetReferencedInNestedSelectors>
}
