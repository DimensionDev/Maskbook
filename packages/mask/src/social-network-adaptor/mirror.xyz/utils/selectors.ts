import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

export const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

export const entryInfoSelector: () => LiveSelector<E, true> = () => querySelector<E>('todo...')

export const menuAuthorSelector: () => LiveSelector<E, true> = () => querySelector<E>('a[href="/"]')

export const themeSelector: () => LiveSelector<E, true> = () => querySelector<E>('[data-theme]')
