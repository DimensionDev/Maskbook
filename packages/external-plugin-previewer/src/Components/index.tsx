import { createElement } from 'react'
import type { Component } from './types'

export { MaskCard } from './MaskCard'
export { MaskBlockQuote as MaskCodeBlock } from './BlockQuote'
export { Translate } from './Translate'
export * from './types'

export const span = createNativeTagDelegate('span')
export const div = createNativeTagDelegate('div')
export const br = createNativeTagDelegate('br', { children: false })
function createNativeTagDelegate<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    acceptProps?: { [key in keyof HTMLElementTagNameMap[T]]?: boolean },
) {
    const C: Component<{}> = () => {
        // TODO: implement acceptProps
        if (acceptProps?.children === false) return createElement(tag)
        return createElement(tag, {}, <slot />)
    }
    C.displayName = tag
    return C
}
