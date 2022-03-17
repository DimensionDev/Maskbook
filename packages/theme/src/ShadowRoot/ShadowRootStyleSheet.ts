const shadowHeadMap = new WeakMap<ShadowRoot, HTMLHeadElement>()
const constructableStyleSheetEnabled = true

// There are 2 rendering mode of this ShadowRootStyleSheet.
// 1. If the host supports ConstructableStyleSheet proposal:
//      It is the fastest but only Chrome supports it.
// 2. style tags that being synchronize between all ShadowRoot.
//      See https://github.com/emotion-js/emotion/blob/main/packages/sheet/src/index.js
//      Note: We cannot use .sheet.insertRule (so called "speedy mode") because in our app,
//            the host of a ShadowRoot might be detached from the DOM and reattach to another place,
//            when a <style> tag is disconnected from the DOM, it's CSSStyleSheet object will be dropped.
export class StyleSheet {
    // Unlucky, emotion will create it's own StyleSheet and use isSpeedy, tags, keys and container for Global components.
    readonly tags: any = []
    readonly container = document.createElement('div')
    readonly isSpeedy = false
    readonly key: string
    constructor(options: { key: string; container: HTMLElement | ShadowRoot }) {
        this.key = options.key
        if (options.container instanceof ShadowRoot) {
            this.implementation =
                constructableStyleSheetEnabled && 'adoptedStyleSheets' in Document.prototype
                    ? new ConstructableStyleSheet()
                    : new SynchronizeStyleSheet()
            this.addContainer(options.container)
            Reflect.set(this.container, 'sheet', this)
        } else {
            // global style
            const un_global = Reflect.get(options.container, 'sheet')
            if (!(un_global instanceof StyleSheet)) throw new TypeError()

            return {
                tags: [],
                key: options.key,
                insert: un_global.implementation.insertGlobal.bind(un_global.implementation),
                flush: un_global.implementation.flushGlobal.bind(un_global.implementation),
            } as any
        }
    }
    addContainer(container: ShadowRoot) {
        this.implementation.addContainer(container, this.key)
    }
    hydrate() {
        throw new Error('Does not support SSR.')
    }
    insert(rule: string) {
        if (process.env.NODE_ENV !== 'production') {
            const isImportRule = rule.charCodeAt(0) === 64 && rule.charCodeAt(1) === 105
            if (isImportRule && this._alreadyInsertedOrderInsensitiveRule) {
                // this would only cause problem in speedy mode
                // but we don't want enabling speedy to affect the observable behavior
                // so we report this error at all times
                console.error(
                    "You're attempting to insert the following rule:\n" +
                        rule +
                        '\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules.',
                )
            }

            this._alreadyInsertedOrderInsensitiveRule = this._alreadyInsertedOrderInsensitiveRule || !isImportRule
        }
        this.implementation.insert(rule)
    }
    flush() {
        this.implementation.flush()
        this._alreadyInsertedOrderInsensitiveRule = false
    }
    private implementation!: ConstructableStyleSheet | SynchronizeStyleSheet
    private _alreadyInsertedOrderInsensitiveRule = false
}
class ConstructableStyleSheet {
    private sheet = new CSSStyleSheet()
    private globalSheet = new CSSStyleSheet()
    private added = new WeakSet<ShadowRoot>()
    addContainer(container: ShadowRoot) {
        if (this.added.has(container)) return
        this.added.add(container)
        container.adoptedStyleSheets = [this.globalSheet, ...(container.adoptedStyleSheets || []), this.sheet]
    }
    insert(rule: string) {
        insertRuleSpeedy(this.sheet, rule)
    }
    insertGlobal(rule: string) {
        insertRuleSpeedy(this.globalSheet, rule)
    }
    flush() {
        this.sheet.replaceSync('')
    }
    flushGlobal() {
        this.globalSheet.replaceSync('')
    }
}
class SynchronizeStyleSheet {
    private ctr = 0
    private containers = new Map<ShadowRoot, HTMLDivElement>()
    addContainer(container: ShadowRoot, tag: string) {
        if (this.containers.has(container)) return

        // setup tags
        const head = getShadowRootHead(container)
        const localContainer = document.createElement('div')
        localContainer.dataset.styleContainer = tag
        head.appendChild(localContainer)
        this.containers.set(container, localContainer)

        {
            const style = createStyleElement()
            style.dataset.globalStyleOf = tag
            head.insertBefore(style, head.firstChild)
            this.globalStyles.set(container, style)
        }

        // copy styles
        const first = this.containers.entries().next()
        if (first.done) return // there is no previous styles. we are done.

        const frag = document.createDocumentFragment()
        for (const x of first.value[1].children) {
            frag.appendChild(x.cloneNode(true))
        }
        localContainer.appendChild(frag)
    }
    insert(rule: string) {
        if (this.ctr % 25 === 0) {
            this._insertTag()
        }

        for (const container of this.containers.values()) {
            const tag = container.lastElementChild!
            tag.appendChild(document.createTextNode(rule))
        }
        this.ctr += 1
    }
    insertGlobal(rule: string) {
        for (const style of this.globalStyles.values()) {
            style.appendChild(document.createTextNode(rule))
        }
    }
    flush() {
        for (const container of this.containers.values()) {
            for (const tag of container.children) {
                tag.remove()
            }
        }
        this.ctr = 0
    }
    flushGlobal() {
        this.globalStyles.forEach((x) => (x.innerText = ''))
    }
    private _insertTag = () => {
        for (const container of this.containers.values()) {
            container.appendChild(createStyleElement())
        }
    }
    private globalStyles = new Map<ShadowRoot, HTMLStyleElement>()
}

function getShadowRootHead(shadow: ShadowRoot) {
    if (!shadowHeadMap.has(shadow)) {
        const head = document.createElement('head')
        shadowHeadMap.set(shadow, head)
        shadow.insertBefore(head, shadow.firstChild)
    }
    return shadowHeadMap.get(shadow)!
}

function createStyleElement(): HTMLStyleElement {
    const tag = document.createElement('style')
    tag.appendChild(document.createTextNode(''))
    return tag
}
function insertRuleSpeedy(sheet: CSSStyleSheet, rule: string) {
    try {
        sheet.insertRule(rule, sheet.cssRules.length)
    } catch (error) {
        if (
            process.env.NODE_ENV !== 'production' &&
            // cspell:ignore focusring
            !/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear){/.test(
                rule,
            )
        ) {
            console.error(`There was a problem inserting the following rule: "${rule}"`, error)
        }
    }
}
