import { createMakeStyles, type CSSObject, type Css, type Cx } from 'tss-react'
import { useTheme, type Theme } from '@mui/material'

const { makeStyles: baseMakeStyles } = createMakeStyles({ useTheme })

type MakeStylesOptions = {
    name?: string | Record<string, unknown>
    uniqId?: string
}

type StyleRules = Record<string, CSSObject>

type NestedSelectorClasses<RuleNameSubsetReferencedInNestedSelectors extends string> = Record<
    RuleNameSubsetReferencedInNestedSelectors,
    string
>

type StyleOverrides = {
    classes?: { [key in string]?: string | undefined }
}

type EmptyStyleOverrides = {
    classes?: Record<never, never>
}

type StyleClassNames<Styles extends StyleRules> = {
    [Key in keyof Styles]: string
}

type ExtraClassKeys<Overrides extends StyleOverrides> =
    Overrides extends { classes?: infer Classes } ? Extract<keyof NonNullable<Classes>, string> : never

type OverrideClassNames<ExtraKeys extends string, BaseKeys extends PropertyKey> =
    string extends ExtraKeys ? Record<string, string>
    : { [Key in Exclude<ExtraKeys, BaseKeys>]: string }

type MakeStylesResult<Styles extends StyleRules, Overrides extends StyleOverrides> = {
    classes: StyleClassNames<Styles> & OverrideClassNames<ExtraClassKeys<Overrides>, keyof Styles>
    theme: Theme
    css: Css
    cx: Cx
}

type GetCssObjectByRuleName<
    Params,
    RuleNameSubsetReferencedInNestedSelectors extends string,
    Styles extends StyleRules,
> = (
    theme: Theme,
    params: Params,
    classes: NestedSelectorClasses<RuleNameSubsetReferencedInNestedSelectors>,
) => Styles

export interface UseStyles<Params, Styles extends StyleRules> {
    (params: Params): MakeStylesResult<Styles, EmptyStyleOverrides>
    <Overrides extends StyleOverrides>(
        params: Params,
        styleOverrides: {
            props: Overrides
            ownerState?: Record<string, unknown>
        },
    ): MakeStylesResult<Styles, Overrides>
}

interface MakeStylesHook<Params, RuleNameSubsetReferencedInNestedSelectors extends string> {
    <Styles extends StyleRules>(cssObjectByRuleName: Styles): UseStyles<Params, Styles>
    <Styles extends StyleRules>(
        getCssObjectByRuleName: GetCssObjectByRuleName<Params, RuleNameSubsetReferencedInNestedSelectors, Styles>,
    ): UseStyles<Params, Styles>
}

// Note: type refinement, see https://github.com/garronej/tss-react/issues/128
export function makeStyles<Params = void, RuleNameSubsetReferencedInNestedSelectors extends string = never>(
    params?: MakeStylesOptions,
): MakeStylesHook<Params, RuleNameSubsetReferencedInNestedSelectors> {
    return baseMakeStyles(params) as unknown as MakeStylesHook<Params, RuleNameSubsetReferencedInNestedSelectors>
}
