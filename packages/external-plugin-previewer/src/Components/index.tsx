import { createElement } from 'react'
import type { Component } from './types.js'

export { MaskCard } from './MaskCard.js'
export { MaskBlockQuote as MaskCodeBlock } from './BlockQuote.js'
export { Translate } from './Translate.js'
export * from './types.js'

export const span = createNativeTagDelegate('span')
export const div = createNativeTagDelegate('div')
export const br = createNativeTagDelegate('br', { children: false })
function createNativeTagDelegate<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    acceptProps?: {
        [key in keyof HTMLElementTagNameMap[T]]?: boolean
    },
) {
    const C: Component<{}> = () => {
        // TODO: implement acceptProps
        if (acceptProps?.children === false) return createElement(tag)
        return createElement(tag, {}, <slot />)
    }
    C.displayName = tag
    return C
}
