/// <reference path="./JSS-internal.d.ts" />
/// <reference path="./CSSOM.d.ts" />

/**
 * This file is granted to [JSS](https://github.com/cssinjs/jss) with MIT Licence
 */
import warning from 'warning'
import {
    SheetsRegistry,
    StyleSheet as JSSStyleSheet,
    Rule,
    toCssValue,
    InsertionPoint,
    JssValue,
    RuleList,
    Renderer,
} from 'jss'

type PriorityOptions = {
    index: number
    insertionPoint?: InsertionPoint
}
//#region Code for ConstrucatbleStylesheetsRenderer
let SharedStyleSheets: StyleSheet[] = []
const appliedShadowRoot = new Set<ShadowRoot>()
function applyAdoptedStyleSheets(shadowOnly = false) {
    if (!shadowOnly) document.adoptedStyleSheets = [...SharedStyleSheets]
    appliedShadowRoot.forEach(shadow => (shadow.adoptedStyleSheets = [...SharedStyleSheets]))
}
const styleMap = new Map<string, StyleSheet>()
function addStyle(e: HTMLStyleElement, shadow: ShadowRoot, insertAfter?: HTMLStyleElement | null): void {
    const style = new CSSStyleSheet()
    style.replace(e.innerHTML)
    if (insertAfter) {
        const beforeSheet = styleMap.get(insertAfter.innerHTML)!
        if (!beforeSheet) warning(false, '[JSS] Target element has not rendered by ConstrucatbleStylesheetsRenderer')
        const index = SharedStyleSheets.indexOf(beforeSheet)

        if (index === -1) return addStyle(e, shadow)
        const arrLeft = SharedStyleSheets.slice(0, index)
        const arrRight = SharedStyleSheets.slice(index, SharedStyleSheets.length)
        SharedStyleSheets = [...arrLeft, style, ...arrRight]
    } else {
        SharedStyleSheets.push(style)
    }
    styleMap.set(e.innerHTML, style)
    applyAdoptedStyleSheets()
}
function deleteRule(e: HTMLStyleElement, index: number) {
    const sheet = styleMap.get(e.innerHTML)!
    styleMap.delete(e.innerHTML)
    e.sheet!.deleteRule(index)
    sheet.deleteRule(index)
    styleMap.set(e.innerHTML, sheet)
    applyAdoptedStyleSheets()
}
function removeStyle(e: HTMLStyleElement, shadow: ShadowRoot) {
    const sheet = styleMap.get(e.innerHTML)
    if (!sheet) {
        return warning(false, '[JSS] Cannot remove style', e)
    }
    SharedStyleSheets = SharedStyleSheets.filter(y => sheet !== y)
    styleMap.delete(e.innerHTML)
    applyAdoptedStyleSheets()
}
//#endregion

// ? function memoize: unused
// ? function getPropertyValue: moved to class
// ? function setProperty: moved to class
// ? function removeProperty: moved to class
// ? function setSelector: moved to class
// ? function getHead: unused
// ? function findHigherSheet: not modified
/**
 * Find attached sheet with an index higher than the passed one.
 */
function findHigherSheet(registry: JSSStyleSheet[], options: PriorityOptions): JSSStyleSheet | null {
    for (let i = 0; i < registry.length; i++) {
        const sheet = registry[i]
        if (
            sheet.attached &&
            sheet.options.index > options.index &&
            sheet.options.insertionPoint === options.insertionPoint
        ) {
            return sheet
        }
    }
    return null
}
// ? function findHighestSheet: unused
// ? function findCommentNode: unused
type PrevNode = {
    parent?: Node
    node?: Node
}
// ! function findPrevNode: modified(signature, body)
/**
 * Find a node before which we can insert the sheet.
 */
function findPrevNode(options: PriorityOptions, sheets: SheetsRegistry): PrevNode | false {
    const { registry } = sheets

    if (registry.length > 0) {
        // Try to insert before the next higher sheet.
        const sheet = findHigherSheet(registry, options)
        if (sheet && sheet.renderer) {
            return {
                parent: sheet.renderer.element.parentNode!,
                node: sheet.renderer.element,
            }
        }
        // ! call to findHighestSheet removed
    }
    // ! call to findCommentNode removed

    return false
}
// ! function insertStyle modified (signature, body)
/**
 * Insert style element into the DOM.
 */
function insertStyle(style: HTMLStyleElement, options: PriorityOptions, shadow: ShadowRoot, sheets: SheetsRegistry) {
    if (styleMap.has(style.innerHTML)) return
    // To keep the priority
    const nextNode = findPrevNode(options, sheets)
    if (nextNode !== false) {
        addStyle(style, shadow, nextNode.node! as HTMLStyleElement)
    }
    // ! remove things about insertionPoint
    // ! remove call to getHead
}

/**
 * Read jss nonce setting from the page if the user has set it.
 */
const getNonce = (): string | null => {
    const node = document.querySelector('meta[property="csp-nonce"]')
    return node ? node.getAttribute('content') : null
}
// ! function insertRule: modified(signature, body)
function insertRule(
    e: HTMLStyleElement,
    container: StyleSheet | CSSMediaRule | CSSKeyframesRule,
    rule: string,
    index: number = container.cssRules.length,
): false | StyleSheet | CSSMediaRule | CSSKeyframesRule {
    const sheetInMemory = styleMap.get(e.innerHTML)!
    styleMap.delete(e.innerHTML)
    try {
        if ('insertRule' in container) {
            container.insertRule(rule, index)
        } else if ('appendRule' in container) {
            container.appendRule(rule)
        }

        sheetInMemory.insertRule(rule, index)
        styleMap.set(e.innerHTML, sheetInMemory)
        applyAdoptedStyleSheets()
    } catch (err) {
        warning(false, `[JSS] Can not insert an unsupported rule \n${rule}`)
        return false
    }
    return container.cssRules[index] as StyleSheet | CSSMediaRule | CSSKeyframesRule
}

// ! function createStyle: unused

export class ConstructableStyleSheetsRenderer implements Renderer {
    getPropertyValue(cssRule: HTMLElement | CSSStyleRule | CSSKeyframeRule, prop: string): string {
        // Support CSSTOM.
        if ('attributeStyleMap' in cssRule) {
            return cssRule.attributeStyleMap.get(prop)!
        }
        return cssRule.style.getPropertyValue(prop)
    }
    setProperty(cssRule: HTMLElement | CSSStyleRule | CSSKeyframeRule, prop: string, value: JssValue): true {
        let cssValue = value as string

        if (Array.isArray(value)) {
            cssValue = toCssValue(value, true)

            if (value[value.length - 1] === '!important') {
                cssRule.style.setProperty(prop, cssValue, 'important')
                return true
            }
        }
        // Support CSSTOM.
        if ('attributeStyleMap' in cssRule) {
            cssRule.attributeStyleMap.set(prop, cssValue)
        } else {
            cssRule.style.setProperty(prop, cssValue)
        }
        return true
    }
    removeProperty(cssRule: HTMLElement | CSSStyleRule | CSSKeyframeRule, prop: string) {
        try {
            // Support CSSTOM.
            if ('attributeStyleMap' in cssRule) {
                cssRule.attributeStyleMap.delete(prop)
            } else {
                cssRule.style.removeProperty(prop)
            }
        } catch (err) {
            warning(false, `[JSS] DOMException "${err.message}" was thrown. Tried to remove property "${prop}".`)
        }
    }
    setSelector(cssRule: CSSStyleRule, selectorText: string): boolean {
        cssRule.selectorText = selectorText

        // Return false if setter was not successful.
        // Currently works in chrome only.
        return cssRule.selectorText === selectorText
    }
    element!: HTMLStyleElement
    sheet: JSSStyleSheet | void
    // ! ourselves property. Don't want to use the global registry.
    static registry = new SheetsRegistry()
    hasInsertedRules: boolean = false
    constructor(public shadow: ShadowRoot, sheet?: JSSStyleSheet) {
        appliedShadowRoot.add(shadow)
        applyAdoptedStyleSheets()

        // There is no sheet when the renderer is used from a standalone StyleRule.
        if (sheet) ConstructableStyleSheetsRenderer.registry.add(sheet)

        this.sheet = sheet
        const { media, meta, element } = this.sheet ? this.sheet.options : ({} as Record<string, any>)
        // ! We're not using createStyle()
        this.element = element || document.createElement('style')
        this.element.setAttribute('data-jss', '')
        if (media) this.element.setAttribute('media', media)
        if (meta) this.element.setAttribute('data-meta', meta)
        const nonce = getNonce()
        if (nonce) this.element.setAttribute('nonce', nonce)
    }

    /**
     * Insert style element into render tree.
     */
    attach(): void {
        if (!this.sheet) return
        insertStyle(this.element, this.sheet.options, this.shadow, ConstructableStyleSheetsRenderer.registry)
    }

    /**
     * Remove style element from render tree.
     */
    detach(): void {
        removeStyle(this.element, this.shadow)
    }

    /**
     * Inject CSS string into element.
     */
    deploy(): void {
        const { sheet } = this
        if (!sheet) return
        if (sheet.options.link) {
            this.insertRules(sheet.rules)
            return
        }
        this.element.textContent = `\n${sheet.toString()}\n`
    }

    /**
     * Insert RuleList into an element.
     */

    insertRules(rules: RuleList, nativeParent?: StyleSheet | CSSMediaRule | CSSKeyframesRule) {
        // @ts-ignore
        for (let i = 0; i < rules.index.length; i++) {
            // @ts-ignore
            this.insertRule(rules.index[i], i, nativeParent)
        }
    }

    /**
     * Insert a rule into element.
     */
    insertRule(
        rule: Rule,
        index: number = this.element.cssRules.length,
        nativeParent: StyleSheet | CSSMediaRule | CSSKeyframesRule = this.element.sheet!,
    ): false | CSSRule {
        const { sheet } = this.element
        if (!sheet) return false

        if ('rules' in rule) {
            const parent = rule
            let latestNativeParent = nativeParent

            if (rule.type === 'conditional' || rule.type === 'keyframes') {
                const result = insertRule(
                    this.element,
                    nativeParent,
                    parent.toString({ children: false } as any),
                    index,
                )
                if (result === false) return false
                latestNativeParent = result
                this.insertRules(parent.rules, result)
                return latestNativeParent as CSSRule
            }
        }
        const ruleStr = rule.toString()

        if (!ruleStr) return false

        const nativeRule = insertRule(this.element, nativeParent, ruleStr, index)
        if (nativeRule === false) {
            return false
        }

        this.hasInsertedRules = true
        Object.assign(rule, { renderable: nativeRule })
        return nativeRule as CSSRule
    }

    /**
     * Delete a rule.
     */
    deleteRule(cssRule: CSSRule): boolean {
        const { sheet } = this.element
        const index = this.indexOf(cssRule)
        if (index === -1) return false
        deleteRule(this.element, index)
        return true
    }

    /**
     * Get index of a CSS Rule.
     */
    indexOf(cssRule: CSSRule): number {
        const { cssRules } = this.element.sheet!
        for (let index = 0; index < cssRules.length; index++) {
            if (cssRule === cssRules[index]) return index
        }
        return -1
    }

    /**
     * Generate a new CSS rule and replace the existing one.
     *
     * Only used for some old browsers because they can't set a selector.
     */
    replaceRule(cssRule: CSSRule, rule: Rule): false | CSSRule {
        const index = this.indexOf(cssRule)
        if (index === -1) return false
        deleteRule(this.element, index)
        return this.insertRule(rule, index)
    }

    /**
     * Get all rules elements.
     */
    getRules(): CSSRuleList {
        return this.element.sheet!.cssRules
    }
}
