import * as $ from './intrinsic_content.js'
import * as $safe from './intrinsic_blessed.js'

const isNodeCache = $safe.WeakMap<object, boolean>()
export function isNode(item: unknown): item is Node {
    if (!item) return false
    if (isNodeCache.has(item)) return isNodeCache.get(item)!
    try {
        $.Node_parentNode(item as Node)
        isNodeCache.set(item, true)
        return true
    } catch {
        isNodeCache.set(item, false)
        return false
    }
}

const isShadowRootCache = $safe.WeakMap<object, boolean>()
export function isShadowRoot(item: unknown): item is ShadowRoot {
    if (!item) return false
    if (isShadowRootCache.has(item)) return isShadowRootCache.get(item)!
    try {
        $.ShadowRoot_host(item as ShadowRoot)
        isShadowRootCache.set(item, true)
        return true
    } catch {
        isShadowRootCache.set(item, false)
        return false
    }
}

const isDocumentCache = $safe.WeakMap<object, boolean>()
export function isDocument(item: unknown): item is Document {
    if (item === document) return true
    if (!item) return false
    if (isDocumentCache.has(item)) return isDocumentCache.get(item)!
    try {
        $.Document_defaultView(item as Document)
        isDocumentCache.set(item, true)
        return true
    } catch {
        isDocumentCache.set(item, false)
        return false
    }
}

const isWindowCache = $safe.WeakMap<object, boolean>()
export function isWindow(item: unknown): item is Window {
    if (item === window) return true
    if (!item) return false
    if (isWindowCache.has(item)) return isWindowCache.get(item)!
    try {
        $.Window_document(item as typeof window)
        isWindowCache.set(item, true)
        return true
    } catch {
        isWindowCache.set(item, false)
        return false
    }
}
export const { isArray } = Array
