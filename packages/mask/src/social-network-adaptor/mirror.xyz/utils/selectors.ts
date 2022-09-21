import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

export const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const entryInfoSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('div+button').map((x) => x.parentElement?.firstElementChild?.lastElementChild as HTMLElement)

export const menuAuthorSelector: () => LiveSelector<E, true> = () => querySelector<E>('a[href="/"]')

export const postsContentSelector = () =>
    querySelectorAll(
        [
            // In Entries
            '#__next > div:nth-child(2) > div > div > div:not(footer)',
            // In collection
            '#__next > div:nth-child(2) > div > div > div > a:has(footer)',
        ].join(),
    ).filter((x) => x.childNodes.length !== 0)

export const themeSelector: () => LiveSelector<E, true> = () => querySelector<E>('[data-theme]')
