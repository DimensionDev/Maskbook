import type { Component } from './types.js'

export const Translate: Component<{}> = () => {
    return (
        <span>
            i18n: <slot />
        </span>
    )
}
Translate.displayName = 'i18n-translate'
