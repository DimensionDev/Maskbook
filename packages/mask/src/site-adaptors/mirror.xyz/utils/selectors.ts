import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

export const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const postsContentSelector = () =>
    querySelectorAll(
        [
            // In Entries
            '[id="__next"] > div:nth-child(2) > div > div:not([class]) > div:not(footer)',
            // In collection
            '[id="__next"] > div:nth-child(2) a:has(footer)',
            '[id="__next"] > div:nth-child(2) a:has(img[alt="Card Header"][loading="lazy"])',
            // In Entry detail
            '[id="__next"] > div:nth-child(2) > div:has([class]):not(footer):has(p)',
        ].join(','),
    ).filter((x) => x.childNodes.length !== 0)

export const themeSelector: () => LiveSelector<E, true> = () => querySelector<E>('[data-theme]')
