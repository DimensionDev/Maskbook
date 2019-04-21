/// <reference path="./JSS-internal.d.ts" />
/**
 * This file is granted to [JSS](https://github.com/cssinjs/jss) with MIT Licence
 */
import warning from 'warning'
import { SheetsRegistry, StyleSheet as JSSStyleSheet, Rule } from 'jss'
import { CSSStyleRule, CSSOMRule, JssValue, InsertionPoint, Renderer } from 'jss/lib/types/'
import StyleRule from 'jss/lib/rules/StyleRule.js'
import toCssValue from 'jss/lib/utils/toCssValue.js'

type PriorityOptions = {
    index: number
    insertionPoint?: InsertionPoint
}

const enum CSSRuleTypes {
    STYLE_RULE = 1,
    KEYFRAMES_RULE = 7,
}
function isCSSStyleRule(x: any): x is CSSStyleRule {
    return x.type === CSSRuleTypes.STYLE_RULE
}
function isCSSKeyFramesRule(x: any): x is CSSKeyframesRule {
    return x.type === CSSRuleTypes.KEYFRAMES_RULE
}

let SharedStyleSheets: StyleSheet[] = []
function applyAdoptedStyleSheets(shadow: ShadowRoot, shadowOnly = false) {
    if (!shadowOnly) document.adoptedStyleSheets = [...SharedStyleSheets]
    shadow.adoptedStyleSheets = [...SharedStyleSheets]
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
    applyAdoptedStyleSheets(shadow)
}
function insertRule(e: HTMLStyleElement, shadow: ShadowRoot) {
    const sheet = styleMap.get(e.innerHTML)!
    styleMap.delete(e.innerHTML)
    return (rule: string, index: number) => {
        e.sheet!.insertRule(rule, index)
        sheet.insertRule(rule, index)
        styleMap.set(e.innerHTML, sheet)
        applyAdoptedStyleSheets(shadow)
    }
}
function deleteRule(e: HTMLStyleElement, shadow: ShadowRoot) {
    const sheet = styleMap.get(e.innerHTML)!
    styleMap.delete(e.innerHTML)
    return (index: number) => {
        e.sheet!.deleteRule(index)
        sheet.deleteRule(index)
        styleMap.set(e.innerHTML, sheet)
        applyAdoptedStyleSheets(shadow)
    }
}
function removeStyle(e: HTMLStyleElement, shadow: ShadowRoot) {
    const sheet = styleMap.get(e.innerHTML)
    if (!sheet) {
        return warning(false, '[JSS] Cannot remove style', e)
    }
    SharedStyleSheets = SharedStyleSheets.filter(y => sheet !== y)
    styleMap.delete(e.innerHTML)
    applyAdoptedStyleSheets(shadow)
}
/**
 * Find attached sheet with an index higher than the passed one.
 */
function findHigherSheet(registry: JSSStyleSheet[], options: PriorityOptions): JSSStyleSheet | null {
    return (
        registry.find(
            sheet =>
                sheet.attached &&
                sheet.options.index > options.index &&
                sheet.options.insertionPoint === options.insertionPoint,
        ) || null
    )
}

/**
 * Find a node before which we can insert the sheet.
 */
function findPrevNode(options: PriorityOptions, sheets: SheetsRegistry): HTMLStyleElement | null {
    const { registry } = sheets
    if (registry.length > 0) {
        // Try to insert before the next higher sheet.
        const sheet = findHigherSheet(registry as any, options)
        if (sheet) return (sheet.renderer as Renderer).element
    }
    return null
}

/**
 * Insert style element into the DOM.
 */
function insertStyle(style: HTMLStyleElement, options: PriorityOptions, shadow: ShadowRoot, sheets: SheetsRegistry) {
    if (styleMap.has(style.innerHTML)) return
    // To keep the priority
    const prevNode = findPrevNode(options, sheets)
    addStyle(style, shadow, prevNode)
}

/**
 * Read jss nonce setting from the page if the user has set it.
 */
const getNonce = (): string | null => {
    const node = document.querySelector('meta[property="csp-nonce"]')
    return node ? node.getAttribute('content') : null
}

export default function ConstructableStylesheetsRendererGenerator(shadow: ShadowRoot) {
    return class ConstructableStylesheetsRenderer implements Renderer {
        getPropertyValue(cssRule: HTMLElement | CSSStyleRule, prop: string): string {
            return cssRule.style.getPropertyValue(prop)
        }
        setProperty(cssRule: HTMLElement | CSSStyleRule, prop: string, value: JssValue): true {
            let cssValue = (value as any) as string

            if (Array.isArray(value)) {
                cssValue = toCssValue(value, true)

                if (value[value.length - 1] === '!important') {
                    cssRule.style.setProperty(prop, cssValue, 'important')
                    return true
                }
            }
            cssRule.style.setProperty(prop, cssValue)
            return true
        }
        removeProperty(cssRule: HTMLElement | CSSStyleRule, prop: string) {
            try {
                cssRule.style.removeProperty(prop)
            } catch (err) {
                warning(false, '[JSS] DOMException "%s" was thrown. Tried to remove property "%s".', err.message, prop)
            }
        }
        setSelector(cssRule: CSSStyleRule, selectorText: string): boolean {
            cssRule.selectorText = selectorText
            return cssRule.selectorText === selectorText
        }
        getKey = (() => {
            const extractKey = (cssText: string, from: number = 0) => cssText.substr(from, cssText.indexOf('{') - 1)

            return (cssRule: CSSOMRule): string => {
                if (isCSSStyleRule(cssRule)) return cssRule.selectorText
                if (isCSSKeyFramesRule(cssRule)) {
                    const { name } = cssRule
                    return `@keyframes ${name}`
                }
                // Conditionals.
                return extractKey(cssRule.cssText)
            }
        })()

        /**
         * @unused Copied from DomRenderer.
         */
        getUnescapedKeysMap = (() => {
            let style: HTMLStyleElement
            let isAttached = false

            return (rules: CSSOMRule[]): Object => {
                const map: Record<string, unknown> = {}
                if (!style) style = document.createElement('style')
                for (let i = 0; i < rules.length; i++) {
                    const rule = rules[i]
                    if (!(rule instanceof StyleRule)) continue
                    const rule2: StyleRule = rule
                    const { selector } = rule2
                    // Only unescape selector over CSSOM if it contains a back slash.
                    if (selector && selector.indexOf('\\') !== -1) {
                        // Lazilly attach when needed.
                        if (!isAttached) {
                            shadow.appendChild(style)
                            isAttached = true
                        }
                        style.textContent = `${selector} {}`
                        const { sheet } = style
                        if (sheet) {
                            const { cssRules } = sheet
                            if (cssRules) map[(cssRules[0] as CSSStyleRule).selectorText] = rule2.key
                        }
                    }
                }
                if (isAttached) {
                    shadow.removeChild(style)
                    isAttached = false
                }
                return map
            }
        })()
        element!: HTMLStyleElement
        static registry = new SheetsRegistry()
        hasInsertedRules: boolean = false
        constructor(public sheet?: JSSStyleSheet) {
            // There is no sheet when the renderer is used from a standalone StyleRule.
            if (sheet) ConstructableStylesheetsRenderer.registry.add(sheet as any)
            const { media, meta, element } = (this.sheet ? this.sheet.options : {}) as any
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
            insertStyle(this.element, this.sheet.options, shadow, ConstructableStylesheetsRenderer.registry)
        }

        /**
         * Remove style element from render tree.
         */
        detach(): void {
            removeStyle(this.element, shadow)
        }

        /**
         * Inject CSS string into element.
         */
        deploy(): void {
            if (!this.sheet) return
            this.element.textContent = `\n${this.sheet.toString()}\n`
        }

        /**
         * Insert a rule into element.
         */
        insertRule(rule: Rule, index: number = this.element.cssRules.length): false | CSSStyleRule {
            const { sheet } = this.element
            const { cssRules } = sheet!
            const str = rule.toString()

            if (!str) return false
            try {
                insertRule(this.element, shadow)(str, index)
            } catch (err) {
                warning(false, '[JSS] Can not insert an unsupported rule \n\r%s', rule)
                return false
            }
            this.hasInsertedRules = true
            return cssRules[index] as CSSStyleRule
        }

        /**
         * Delete a rule.
         */
        deleteRule(cssRule: CSSStyleRule): boolean {
            const index = this.indexOf(cssRule)
            if (index === -1) return false
            deleteRule(this.element, shadow)(index)
            return true
        }

        /**
         * Get index of a CSS Rule.
         */
        indexOf(cssRule: CSSStyleRule): number {
            return Array.from(this.element.sheet!.cssRules).indexOf(cssRule)
        }

        /**
         * Generate a new CSS rule and replace the existing one.
         */
        replaceRule(cssRule: CSSStyleRule, rule: Rule): false | CSSStyleRule {
            const index = this.indexOf(cssRule)
            const newCssRule = this.insertRule(rule, index)
            deleteRule(this.element, shadow)
            return newCssRule
        }

        /**
         * Get all rules elements.
         */
        getRules(): CSSRuleList {
            return this.element.sheet!.cssRules
        }
    }
}
