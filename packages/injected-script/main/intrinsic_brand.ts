import { $ } from './intrinsic.js'

export function isNode(item: unknown): item is Node {
    if (!item) return false
    try {
        $.Node_parentNode(item as Node)
        return true
    } catch {
        return false
    }
}
export function isShadowRoot(item: unknown): item is ShadowRoot {
    if (!item) return false
    try {
        $.ShadowRoot_host(item as ShadowRoot)
        return true
    } catch {
        return false
    }
}

export function isDocument(item: unknown): item is Document {
    if (!item) return false
    try {
        $.Document_defaultView(item as Document)
        return true
    } catch {
        return false
    }
}

export function isWindow(item: unknown): item is Window {
    if (!item) return false
    try {
        $.Window_document(item as typeof window)
        return true
    } catch {
        return false
    }
}
export const { isArray } = Array
