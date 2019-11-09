/**
 * Copyright (c) 2019 cssinjs/jss developers.
 * Copyright (c) 2019 SujiTech.
 * See the GitHub history of this file for full list of contributors.
 *
 * This file is provided AS IS under the MIT (Expat) License. You may obtain a
 * copy of its contents from http://opensource.org/licenses/MIT.
 *
 * Forked from https://github.com/cssinjs/jss/blob/master/packages/jss/src/DomRenderer.js.
 * Intended to be integrated into jss <https://github.com/cssinjs/jss>.
 */
/* eslint-disable import/no-deprecated, no-plusplus */
import warning from 'tiny-warning'
import { InsertionPoint, JssValue, Rule, RuleList, sheets, StyleSheet, toCssValue } from 'jss'
/// <reference path="./CSSOM.d.ts" />
/// <reference path="./JSS-internal.d.ts" />

//#region ConstructableStyleSheetsRenderer
// Nuke Chrome 74: https://bugs.chromium.org/p/chromium/issues/detail?id=967273
const isChrome74 = navigator.appVersion.match(/(Chromium|Chrome)\/74/)
// We want to test it in dev.
if (isChrome74 || process.env.NODE_ENV === 'development') {
    delete Document.prototype.adoptedStyleSheets
}

require('construct-style-sheets-polyfill')
// Should be false for Chrome 73 and Chrome > 75.
const isPolyfilled = CSSStyleSheet.name !== 'CSSStyleSheet'
if (isPolyfilled) console.warn('Browser does not support Constructable Stylesheets. Using polyfill.')

const fakeHead = document.createElement('head')
export const livingShadowRoots = new Set<ShadowRoot>()
const livingStylesheets = new WeakMap<HTMLStyleElement, CSSStyleSheet>()
const proxyWeakMap = new WeakMap<HTMLStyleElement, HTMLStyleElement>()

function getStyleSheet(x: HTMLStyleElement) {
    const e = livingStylesheets.get(x)
    if (e) return e
    const y = new CSSStyleSheet()
    livingStylesheets.set(x, y)
    return y
}

let sheetRulesDirty = false
let constructedStyleString: string = ''

export function applyAdoptedStyleSheets(shadowOnly = true) {
    requestAnimationFrame(() => {
        if (isPolyfilled) {
            constructedStyleString = sheetRulesDirty
                ? [...fakeHead.children]
                      .filter((x): x is HTMLStyleElement => x instanceof HTMLStyleElement)
                      .reduce((prev, cur) => {
                          prev += cur.innerHTML
                          const sheet = getStyleSheet(cur)
                          const fromSheet = [...sheet.rules].map(i => i.cssText).join('\n')
                          prev += fromSheet
                          return prev
                      }, '')
                : constructedStyleString
            const styles = document.createElement('style')
            styles.setAttribute('id', 'sheets')
            styles.innerHTML = constructedStyleString
            const shadows: (Document | ShadowRoot)[] = [...livingShadowRoots]
            if (!shadowOnly) shadows.push(document)
            for (const shadow of shadows) {
                const prev = shadow.getElementById('sheets')
                if (prev) {
                    if (!sheetRulesDirty) continue
                    prev.remove()
                }
                shadow.appendChild(styles.cloneNode(true))
            }
            sheetRulesDirty = false
        } else {
            const styles = Array.from(fakeHead.children).filter(
                (x): x is HTMLStyleElement => x instanceof HTMLStyleElement,
            )
            const shadows = Array.from(livingShadowRoots)
            const nextAdoptedStyleSheets = styles.map(getStyleSheet)
            for (const shadow of shadows) {
                shadow.adoptedStyleSheets = nextAdoptedStyleSheets
            }
            if (!shadowOnly) document.adoptedStyleSheets = nextAdoptedStyleSheets
        }
    })
}

function adoptStylesheets(
    target: ConstructableStyleSheetsRenderer,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
) {
    return {
        ...descriptor,
        value: function(...args: any[]) {
            const result = descriptor.value.apply(this, args)
            sheetRulesDirty = true
            applyAdoptedStyleSheets()
            return result
        },
    }
}
//#endregion

type HTMLElementWithStyleMap = HTMLElement
type AnyCSSRule = unknown

type PriorityOptions = {
    index: number
    insertionPoint?: InsertionPoint
}

/**
 * Cache the value from the first time a function is called.
 */
const memoize = <Value>(fn: () => Value): (() => Value) => {
    let value: any
    return () => {
        if (!value) value = fn()
        return value
    }
}

/**
 * Get a style property value.
 */
function getPropertyValue(cssRule: HTMLElementWithStyleMap | CSSStyleRule | CSSKeyframeRule, prop: string): string {
    try {
        // Support CSSTOM.
        if ('attributeStyleMap' in cssRule) {
            return cssRule.attributeStyleMap.get(prop)!
        }
        return cssRule.style.getPropertyValue(prop)
    } catch (err) {
        // IE may throw if property is unknown.
        return ''
    }
}

/**
 * Set a style property.
 */
function setProperty(
    cssRule: HTMLElementWithStyleMap | CSSStyleRule | CSSKeyframeRule,
    prop: string,
    value: JssValue,
): boolean {
    /**
     * ! Need to hook in polyfill:
     * ! cssRule.style.setProperty(...)
     * ! cssRule.attributeStyleMap.set(...)
     */
    console.warn('Set property', cssRule, prop, value)
    try {
        let cssValue = (value as any) as string

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
    } catch (err) {
        // IE may throw if property is unknown.
        return false
    }
    return true
}

/**
 * Remove a style property.
 */
function removeProperty(cssRule: HTMLElementWithStyleMap | CSSStyleRule | CSSKeyframeRule, prop: string) {
    /**
     * ! Need to hook in polyfill
     * ! cssRule.attributeStyleMap.delete(...)
     * ! cssRule.style.removeProperty(...)
     */
    console.warn('Remove property', cssRule, prop)

    try {
        // Support CSSTOM.
        if ('attributeStyleMap' in cssRule) {
            cssRule.attributeStyleMap.delete(prop)
        } else {
            cssRule.style.removeProperty(prop)
        }
    } catch (err) {
        warning(
            false,
            `[JSS] DOMException "${err.message}" was thrown. at ${err.stack} Tried to remove property "${prop}".`,
        )
    }
}

/**
 * Set the selector.
 *
 * @returns {boolean} Whether the operation is successful.
 */
function setSelector(cssRule: CSSStyleRule, selectorText: string): boolean {
    console.warn('Set selector', cssRule, selectorText)
    cssRule.selectorText = selectorText

    // Return false if setter was not successful.
    // Currently works in chrome only.
    // ! Hack this since it is not implemented !
    if (isPolyfilled) return false
    return cssRule.selectorText === selectorText
}
/**
 * Gets the `head` element upon the first call and caches it.
 * We assume it can't be null.
 * ! Hook this !
 * Original: const getHead = memoize((): HTMLElement => document.querySelector('head') as any)
 */
const getHead = () => fakeHead

/**
 * Find attached sheet with an index higher than the passed one.
 */
function findHigherSheet(registry: Array<StyleSheet>, options: PriorityOptions): StyleSheet | null {
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

/**
 * Find attached sheet with the highest index.
 */
function findHighestSheet(registry: Array<StyleSheet>, options: PriorityOptions): StyleSheet | null {
    for (let i = registry.length - 1; i >= 0; i--) {
        const sheet = registry[i]
        if (sheet.attached && sheet.options.insertionPoint === options.insertionPoint) {
            return sheet
        }
    }
    return null
}

/**
 * Find a comment with "jss" inside.
 */
function findCommentNode(text: string): Node | null {
    const head = getHead()
    for (let i = 0; i < head.childNodes.length; i++) {
        const node = head.childNodes[i]
        if (node.nodeType === 8 && node.nodeValue!.trim() === text) {
            // @ts-ignore
            return node
        }
    }
    return null
}

type PrevNode = {
    parent?: Node
    node?: Node
}

/**
 * Find a node before which we can insert the sheet.
 */
function findPrevNode(options: PriorityOptions): PrevNode | false {
    const { registry } = sheets as any

    if (registry.length > 0) {
        // Try to insert before the next higher sheet.
        let sheet = findHigherSheet(registry, options)
        if (sheet && sheet.renderer) {
            return {
                parent: sheet.renderer.element.parentNode!,
                node: sheet.renderer.element,
            }
        }

        // Otherwise insert after the last attached.
        sheet = findHighestSheet(registry, options)
        if (sheet && sheet.renderer) {
            return {
                parent: sheet.renderer.element.parentNode!,
                node: sheet.renderer.element.nextSibling!,
            }
        }
    }

    // Try to find a comment placeholder if registry is empty.
    const { insertionPoint } = options
    if (insertionPoint && typeof insertionPoint === 'string') {
        const comment = findCommentNode(insertionPoint)
        if (comment) {
            return {
                parent: comment.parentNode,
                node: comment.nextSibling,
            } as any
        }

        // If user specifies an insertion point and it can't be found in the document -
        // bad specificity issues may appear.
        warning(false, `[JSS] Insertion point "${insertionPoint}" not found.`)
    }

    return false
}

// ! Hook this !
// ! Remove all logic for `insertionPoint`
/**
 * Insert style element into the DOM.
 */
function insertStyle(style: HTMLStyleElement, options: PriorityOptions) {
    const { insertionPoint } = options
    // ! Hook this !
    if (insertionPoint)
        throw new TypeError('ConstructableStyleSheetsRenderer.insertStyle does not support insertionPoint.')

    const nextNode = findPrevNode(options)

    if (nextNode !== false && nextNode.parent) {
        nextNode.parent.insertBefore(style, proxyWeakMap.get(nextNode.node as any)! || nextNode.node)
        return
    }

    getHead().appendChild(style)
}

/**
 * Read jss nonce setting from the page if the user has set it.
 */
const getNonce = memoize((): string | null => {
    const node = document.querySelector('meta[property="csp-nonce"]')
    return node ? node.getAttribute('content') : null
})

const insertRule = (
    container: CSSStyleSheet | CSSMediaRule | CSSKeyframesRule,
    rule: string,
    index: number = container.cssRules.length,
): false | any => {
    /**
     * ! Need hook in polyfill
     * ! CSSMediaRule.insertRule(...)
     * ! CSSKeyframesRule.appendRule(...)
     */
    try {
        if ('insertRule' in container) {
            if (isPolyfilled && container instanceof CSSMediaRule)
                throw new Error('CSSMediaRule insertRule not implemented')
            container.insertRule(rule, index)
        }
        // Keyframes rule.
        else if ('appendRule' in container) {
            if (isPolyfilled) throw new Error('CSSKeyframesRule appendRule not implemented')
            container.appendRule(rule)
        }
    } catch (err) {
        console.error(err)
        warning(false, `[JSS] Can not insert an unsupported rule \n${rule}`)
        return false
    }
    return container.cssRules[index]
}

const createStyle = () => document.createElement('style')

export default class ConstructableStyleSheetsRenderer {
    getPropertyValue = getPropertyValue

    @adoptStylesheets
    setProperty(...args: Parameters<typeof setProperty>) {
        return setProperty(...args)
    }
    @adoptStylesheets
    removeProperty(...args: Parameters<typeof removeProperty>) {
        return removeProperty(...args)
    }
    @adoptStylesheets
    setSelector(...args: Parameters<typeof setSelector>) {
        return setSelector(...args)
    }
    // HTMLStyleElement needs fixing https://github.com/facebook/flow/issues/2696
    // ! Hook this !
    get element(): HTMLStyleElement {
        const proxy = new Proxy(this.realElement || {}, {
            get(target, key) {
                if (key === 'sheet') return getStyleSheet(target)
                if (key === 'setAttribute')
                    return (k: string, v: string) => {
                        // XXX: isPolyfilled?
                        if (k === 'media') {
                            console.warn('Not implemented')
                            getStyleSheet(target).media.mediaText = v
                        }
                        if (k === 'media') return target.setAttribute(k, v)
                    }
                return (target as any)[key]
            },
            set(target, key, value) {
                if (key === 'textContent') getStyleSheet(target).replaceSync(value)
                ;(target as any)[key] = value // Will crash on Chrome 74 without polyfill
                return true
            },
        })
        if (this.realElement) proxyWeakMap.set(proxy, this.realElement)
        return proxy
    }
    set element(v) {
        this.realElement = v
    }
    realElement!: HTMLStyleElement
    sheet: StyleSheet

    hasInsertedRules: boolean = false
    constructor(sheet: StyleSheet) {
        // There is no sheet when the renderer is used from a standalone StyleRule.
        if (sheet) sheets.add(sheet)

        this.sheet = sheet
        const { media, meta, element } = this.sheet ? this.sheet.options : ({} as any)
        this.element = element || createStyle()
        this.element.setAttribute('data-jss', '')
        if (media) this.element.setAttribute('media', media)
        if (meta) this.element.setAttribute('data-meta', meta)
        const nonce = getNonce()
        if (nonce) this.element.setAttribute('nonce', nonce)
    }

    /**
     * Insert style element into render tree.
     */
    @adoptStylesheets
    attach(): void {
        // In the case the element node is external and it is already in the DOM.
        if (this.element.parentNode || !this.sheet) return
        // ! Hook this !
        insertStyle(this.realElement, this.sheet.options)

        // When rules are inserted using `insertRule` API, after `sheet.detach().attach()`
        // most browsers create a new CSSStyleSheet, except of all IEs.
        // @ts-ignore
        const deployed = Boolean(this.sheet && this.sheet.deployed)
        if (this.hasInsertedRules && deployed) {
            this.hasInsertedRules = false
            this.deploy()
        }
    }

    /**
     * Remove style element from render tree.
     */
    @adoptStylesheets
    detach(): void {
        // ! Hook this !
        this.element.parentNode!.removeChild(this.realElement)
    }

    /**
     * Inject CSS string into element.
     */
    @adoptStylesheets
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
    insertRules(rules: RuleList, nativeParent?: CSSStyleSheet | CSSMediaRule | CSSKeyframesRule) {
        // @ts-ignore
        for (let i = 0; i < rules.index.length; i++) {
            // @ts-ignore
            this.insertRule(rules.index[i], i, nativeParent)
        }
    }

    /**
     * Insert a rule into element.
     */
    @adoptStylesheets
    insertRule(
        rule: Rule,
        index?: number,
        nativeParent: CSSStyleSheet | CSSMediaRule | CSSKeyframesRule = this.element.sheet! as CSSStyleSheet,
    ): false | CSSStyleSheet | AnyCSSRule {
        if ('rules' in rule) {
            const parent = rule
            let latestNativeParent = nativeParent
            if (rule.type === 'conditional' || rule.type === 'keyframes') {
                // We need to render the container without children first.
                latestNativeParent = insertRule(nativeParent, parent.toString({ children: false } as any), index)
                // @ts-ignore
                if (latestNativeParent === false) {
                    return false
                }
            }
            this.insertRules(parent.rules, latestNativeParent)
            return latestNativeParent
        }

        // IE keeps the CSSStyleSheet after style node has been reattached,
        // so we need to check if the `renderable` reference the right style sheet and not
        // rerender those rules.
        // @ts-ignore
        if (rule.renderable && rule.renderable.parentStyleSheet === this.element.sheet) {
            // @ts-ignore
            return rule.renderable
        }

        const ruleStr = rule.toString()

        if (!ruleStr) return false

        const nativeRule = insertRule(nativeParent, ruleStr, index)
        if (nativeRule === false) {
            return false
        }

        this.hasInsertedRules = true
        // @ts-ignore
        rule.renderable = nativeRule
        return nativeRule
    }

    /**
     * Delete a rule.
     */
    @adoptStylesheets
    deleteRule(cssRule: AnyCSSRule): boolean {
        const { sheet } = this.element
        const index = this.indexOf(cssRule)
        if (index === -1) return false
        sheet!.deleteRule(index)
        return true
    }

    /**
     * Get index of a CSS Rule.
     */
    indexOf(cssRule: AnyCSSRule): number {
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
    @adoptStylesheets
    replaceRule(cssRule: AnyCSSRule, rule: Rule): false | CSSStyleSheet | AnyCSSRule {
        const index = this.indexOf(cssRule)
        if (index === -1) return false
        this.element.sheet!.deleteRule(index)
        return this.insertRule(rule, index)
    }

    /**
     * Get all rules elements.
     */
    getRules(): CSSRuleList {
        /**
         * ! Need hook in polyfill !
         */
        console.trace('Access cssRules')
        return this.element.sheet!.cssRules
    }
}
