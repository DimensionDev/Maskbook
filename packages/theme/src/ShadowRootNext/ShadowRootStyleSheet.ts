/* https://github.com/emotion-js/emotion/blob/main/packages/sheet/src/index.js */
const shadowHeadMap = new WeakMap<ShadowRoot, HTMLDivElement>()
export class StyleSheet {
    // Unlucky, emotion will create it's own StyleSheet and use isSpeedy, tags, keys and container for Global components.
    isSpeedy = true
    tags: any = []
    container: HTMLElement

    private ctr = 0
    private shadowHead: HTMLDivElement
    private syncContainers = new Map<Element | ShadowRoot, HTMLStyleElement[]>()
    private _alreadyInsertedOrderInsensitiveRule = false
    constructor(public key: string, private containerShadow: ShadowRoot) {
        if (!shadowHeadMap.has(containerShadow)) {
            const div = document.createElement('div')
            div.dataset.styleContainer = ''
            shadowHeadMap.set(containerShadow, div)
            containerShadow.insertBefore(div, containerShadow.firstChild)
        }
        const shadowHead = (this.shadowHead = shadowHeadMap.get(containerShadow)!)

        const global = (this.container = document.createElement('div'))
        global.dataset.globalOf = key
        shadowHead.insertBefore(global, shadowHead.firstChild)

        const local = document.createElement('div')
        local.dataset.key = key
        shadowHead.appendChild(local)
        this.addContainer(local)
    }
    addContainer(container: Element | ShadowRoot) {
        const first = this.syncContainers.entries().next()
        if (first.done) {
            this.syncContainers.set(container, [])
        } else {
            const [, oldTags] = first.value
            // append child
            const frag = document.createDocumentFragment()
            const tags = oldTags.map((x) => x.cloneNode() as HTMLStyleElement)
            tags.forEach((x) => frag.appendChild(x))
            container.appendChild(frag)
            // Note: we need to append it to DOM first, otherwise sheet is null.
            // clone stylesheet
            oldTags.forEach((oldTag, index) => {
                const oldSheet = oldTag.sheet!
                const newSheet = tags[index].sheet!
                cloneSheet(oldSheet, newSheet)
            })
        }
    }

    private _insertTag = () => {
        for (const [container, tags] of this.syncContainers) {
            const child = createStyleElement({ key: this.key })
            tags.push(child)
            container.appendChild(child)
        }
    }

    hydrate(_nodes: HTMLStyleElement[]) {
        throw new Error('Does not support SSR.')
    }

    insert(rule: string) {
        if (this.ctr % 65000 === 0) {
            this._insertTag()
        }

        {
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

        for (const tags of this.syncContainers.values()) {
            const tag = tags.at(-1)!
            const sheet = tag.sheet!
            if (!sheet) console.warn('NO sheet is found. The ShadowRoot is not attached to the DOM tree.')
            try {
                // this is the ultrafast version, works across browsers
                // the big drawback is that the css won't be editable in devtools
                sheet.insertRule(rule, sheet.cssRules.length)
            } catch (error) {
                if (
                    !/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear){/.test(
                        rule,
                    )
                ) {
                    console.error(`There was a problem inserting the following rule: "${rule}"`, error)
                }
            }
        }
        this.ctr += 1
    }

    flush() {
        for (const tags of this.syncContainers.values()) {
            tags.forEach((tag) => tag.parentNode?.removeChild(tag))
            tags.length = 0
        }
        this.ctr = 0
        this._alreadyInsertedOrderInsensitiveRule = false
    }
}

function cloneSheet(old: CSSStyleSheet, newOne: CSSStyleSheet) {
    for (const rule of old.cssRules) {
        newOne.insertRule(rule.cssText, newOne.cssRules.length)
    }
}

function createStyleElement(options: { key: string; nonce?: string }): HTMLStyleElement {
    const tag = document.createElement('style')
    tag.dataset.emotion = options.key
    if (options.nonce !== undefined) {
        tag.setAttribute('nonce', options.nonce)
    }
    tag.appendChild(document.createTextNode(''))
    tag.dataset.s = ''
    return tag
}
