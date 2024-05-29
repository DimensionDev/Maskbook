import { Flags } from '@masknet/flags'

const map = new WeakMap<HTMLElement, ShadowRoot>()
export function getOrAttachShadowRoot(node: HTMLElement) {
    if (map.has(node)) return map.get(node)!
    const dom = node.attachShadow(Flags.shadowRootInit)
    map.set(node, dom)
    return dom
}
