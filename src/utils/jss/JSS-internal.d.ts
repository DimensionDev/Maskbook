declare module 'warning' {
    export default function warning(...args: any[]): void
}
declare module 'jss/lib/utils/toCssValue.js' {
    export default function toCssValue(value: any, ignoreImportant: boolean = false): string
}
declare module 'jss/lib/rules/StyleRule.js' {
    export default class StyleRule implements BaseRule {
        selector: string
        key: unknown
    }
}
declare module 'jss/lib/types/' {
    interface CSSRuleBase<T extends { type: any }> {
        type: T['type']
        CSSRule?: CSSRule
        CSSStyleSheet?: CSSStyleSheet
        cssText: DOMString
    }
    export interface BaseRule {
        type: string
        key: string
        isProcessed: boolean
        options: RuleOptions
        toString(options?: import('jss').ToCssOptions): string
    }
    export interface CSSStyleRule extends CSSRuleBase<{ type: 1 }>, CSSRule {
        type: 1
        style: CSSStyleDeclaration
        selectorText: DOMString
    }
    export type CSSOMRule = CSSStyleRule | CSSMediaRule | CSSKeyframesRule
    export type JssValue = string | number | Array<string | number | Array<string | number> | '!important'>
    export type InsertionPoint = string | HTMLElement
    export abstract class Renderer {
        constructor(sheet?: StyleSheet)
        element: HTMLStyleElement
        setProperty(cssRule: HTMLElement | CSSStyleRule, prop: string, value: JssValue): boolean
        getPropertyValue(cssRule: HTMLElement | CSSStyleRule, prop: string): string
        removeProperty(cssRule: HTMLElement | CSSStyleRule, prop: string): void
        setSelector(cssRule: CSSStyleRule, selectorText: string): boolean
        attach(): void
        detach(): void
        deploy(sheet: StyleSheet): void
        insertRule(rule: Rule): false | CSSStyleRule
        deleteRule(cssRule: CSSStyleRule): boolean
        replaceRule(cssRule: CSSStyleRule, rule: Rule): false | CSSStyleRule
        indexOf(cssRule: CSSStyleRule): number
        getRules(): CSSRuleList | void
    }
}
declare module 'jss' {
    export * from '@types/jss'
    export interface StyleSheet extends import('@types/jss').StyleSheet {
        options: PriorityOptions
        renderer: Renderer
        attached: boolean
    }
    export interface Rule extends import('@types/jss').Rule {
        key: unknown
    }
}

interface StyleSheet {
    cssRules: CSSRuleList
    deleteRule(index: number): void
    insertRule(rule: string, index: number): void
}
interface HTMLStyleElement {
    cssRules: CSSRuleList
}
interface CSSStyleSheet {
    replace(css: string): Promise<CSSStyleSheet>
    replaceSync(css: string): void
}
interface ConstructableStyleSheets {
    adoptedStyleSheets: ReadonlyArray<StyleSheet>
}
interface Document extends ConstructableStyleSheets {}
interface ShadowRoot extends ConstructableStyleSheets {}
