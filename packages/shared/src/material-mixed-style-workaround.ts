export function applyWorkaround(insertPoint: Node, container: Node) {
    const shadowMap = new WeakMap<HTMLStyleElement, HTMLStyleElement>()
    const workaround = document.createElement('div')
    workaround.setAttribute('data-css-order-workaround', 'true')
    insertPoint.insertBefore(workaround, null)
    container.insertBefore = new Proxy(container.insertBefore, {
        apply(f, target, [dom, before]) {
            if (target === container && dom instanceof HTMLStyleElement) {
                if (shadowMap.has(before)) before = shadowMap.get(before)
                const meta = dom.getAttribute('data-meta')
                if (meta && meta.includes('makeStyle')) {
                    workaround.appendChild(dom)
                    const shadow = document.createElement('style')
                    shadowMap.set(dom, shadow)
                    Reflect.apply(f, target, [shadow, before])
                    Object.defineProperty(dom, 'parentNode', {
                        get() {
                            return container
                        },
                    })
                    return dom
                }
            }
            return Reflect.apply(f, target, [dom, before])
        },
    })
}
