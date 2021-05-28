import { createElement } from 'react'

export { MaskCard } from './MaskCard'
export { Translate } from './Translate'

export interface Component<P> {
    (props: P, dispatchEvent: (event: Event) => void): React.ReactChild
    displayName: string
}

export const span = createNativeTagDelegate('span')
export const div = createNativeTagDelegate('div')
export const br = createNativeTagDelegate('br', { children: false })
function createNativeTagDelegate<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    accpetProps?: { [key in keyof HTMLElementTagNameMap[T]]?: boolean },
) {
    const C: Component<{}> = () => {
        // TODO: implement acceptProps
        if (accpetProps?.children === false) return createElement(tag)
        return createElement(tag, {}, <slot />)
    }
    C.displayName = tag
    return C
}
