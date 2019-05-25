type DOMString = string
declare global {
    interface HTMLElement {
        attributeStyleMap: Map<string, string>
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
    interface ShadowRoot extends ConstructableStyleSheets {
        __polyfilled_root_: HTMLElement
    }
}
interface CSSRuleBase<T extends { type: any }> {
    type: T['type']
    CSSRule?: CSSRule
    CSSStyleSheet?: CSSStyleSheet
    cssText: DOMString
}
interface CSSGroupingRule<T> extends CSSRuleBase<T> {
    cssRules: CSSRuleList
    insertRule(rule: DOMString, index: number): number
    deleteRule(index: number): void
}

interface CSSStyleRule extends CSSRuleBase<{ type: 1 }>, CSSRule {
    type: 1
    style: CSSStyleDeclaration
    selectorText: DOMString
}

interface CSSCharsetRule extends CSSRuleBase<{ type: 2 }> {
    type: 2
    charset: DOMString
}

interface CSSImportRule extends CSSRuleBase<{ type: 3 }> {
    type: 3
    mediaList: {
        mediaText: DOMString
        length: number
        item?: DOMString
        appendMedium(medium: DOMString): void
        deleteMedium(medium: DOMString): void
    }
}

interface CSSMediaRule extends CSSGroupingRule<{ type: 4 | 4 }> {
    type: 4
    mediaList: {
        mediaText: DOMString
        length: number
        item?: DOMString
        appendMedium(medium: DOMString): void
        deleteMedium(medium: DOMString): void
    }
}

interface CSSFontFaceRule extends CSSRuleBase<{ type: 5 | 5 }> {
    type: 5
    style: CSSStyleDeclaration
}

interface CSSKeyframeRule extends CSSRuleBase<{ type: 8 | 8 }> {
    type: 8
    style: CSSStyleDeclaration
    keyText: DOMString
}

interface CSSKeyframesRule extends CSSRuleBase<{ type: 7 | 7 }> {
    type: 7
    cssRules: CSSRuleList
    name: DOMString
    appendRule(rule: DOMString): void
    deleteRule(key: DOMString): void
    findRule(key: DOMString): CSSKeyframeRule
}

interface CSSNamespaceRule extends CSSRuleBase<{ type: 10 | 10 }> {
    type: 10
    namespaceURI: DOMString
    prefix: DOMString
}

interface CSSViewportRule extends CSSRuleBase<{ type: 15 | 15 }> {
    type: 15
    style: CSSStyleDeclaration
}

export type CSSSimpleRule = CSSCharsetRule | CSSImportRule | CSSNamespaceRule

export type AnyCSSRule =
    | CSSMediaRule
    | CSSFontFaceRule
    | CSSKeyframesRule
    | CSSSimpleRule
    | CSSStyleRule
    | CSSViewportRule
export type CSSSimpleRule = CSSCharsetRule | CSSImportRule | CSSNamespaceRule
