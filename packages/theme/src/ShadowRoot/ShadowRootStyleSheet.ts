const shadowHeadMap = new WeakMap<ShadowRoot, HTMLHeadElement>()
/* https://github.com/emotion-js/emotion/blob/main/packages/sheet/src/index.js */

// There are 2 rendering mode of this ShadowRootStyleSheet.
// 1. If the host supports ConstructableStyleSheet proposal:
//      It is the fastest but only Chrome supports it.
// 2. style tags that being synchronize between all ShadowRoot.
//      Note: We cannot use .sheet.insertRule (so called "speedy mode") because in our app,
//            the host of a ShadowRoot might be detached from the DOM and reattach to another place,
//            when a <style> tag is disconnected from the DOM, it's CSSStyleSheet object will be dropped.
export class StyleSheet {
    // Unlucky, emotion will create it's own StyleSheet and use isSpeedy, tags, keys and container for Global components.
    tags: any = []
    container: HTMLElement

    private ctr = 0
    private containers = new Map<ShadowRoot, HTMLDivElement>()
    private _alreadyInsertedOrderInsensitiveRule = false
    constructor(public key: string, containerShadow: ShadowRoot) {
        const head = getShadowRootHead(containerShadow)

        const global = (this.container = document.createElement('div'))
        global.dataset.globalOf = key
        head.insertBefore(global, head.firstChild)

        this.addContainer(containerShadow)
    }
    addContainer(container: ShadowRoot) {
        if (this.containers.has(container)) return

        // setup tags
        const localContainer = document.createElement('div')
        localContainer.dataset.key = this.key
        const head = getShadowRootHead(container)
        head.appendChild(localContainer)
        this.containers.set(container, localContainer)

        // copy styles
        const first = this.containers.entries().next()
        if (first.done) return // there is no previous styles. we are done.

        const existingStyles = Array.from(first.value[1].children)
        // append existing styles to newly joined container
        const frag = document.createDocumentFragment()
        existingStyles.forEach((x) => frag.appendChild(x.cloneNode(true)) as HTMLStyleElement)
        localContainer.appendChild(frag)
    }

    private _insertTag = () => {
        for (const container of this.containers.values()) {
            container.appendChild(createStyleElement())
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

        for (const container of this.containers.values()) {
            const tag = Array.from(container.children).at(-1)!
            tag.appendChild(document.createTextNode(rule))
        }
        this.ctr += 1
    }

    flush() {
        for (const container of this.containers.values()) {
            for (const tag of container.children) {
                tag.remove()
            }
        }
        this.ctr = 0
        this._alreadyInsertedOrderInsensitiveRule = false
    }
}

function getShadowRootHead(shadow: ShadowRoot) {
    if (!shadowHeadMap.has(shadow)) {
        const head = document.createElement('head')
        shadowHeadMap.set(shadow, head)
        shadow.insertBefore(head, shadow.firstChild)
    }
    return shadowHeadMap.get(shadow)!
}

function createStyleElement(options: { nonce?: string } = {}): HTMLStyleElement {
    const tag = document.createElement('style')
    if (options.nonce !== undefined) {
        tag.setAttribute('nonce', options.nonce)
    }
    tag.appendChild(document.createTextNode(''))
    return tag
}
