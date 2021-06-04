import type { Component } from '.'

export const Translate: Component<{}> = () => {
    return (
        <span>
            i18n: <slot></slot>
        </span>
    )
}
Translate.displayName = 'i18n-translate'
