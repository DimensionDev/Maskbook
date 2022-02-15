import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLDivElement

const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const searchProfileTabListLastChildSelector = () =>
    querySelector<E>('[id="react-root"] section main  div[role="tablist"] > :last-child')

export const searchProfileTabPageSelector = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child')

export const searchProfileTabSelector = () =>
    querySelector<E>('[id="react-root"] section main div[role="tablist"]  a[aria-selected="false"]')

export const searchProfileActiveTabSelector = () =>
    querySelector<E>('[id="react-root"] section main  div[role="tablist"] a[aria-selected="true"]')

export const searchAvatarSelector = () =>
    querySelector<HTMLImageElement>('[id="react-root"] section main header button  img')

export const bioDescriptionSelector = () =>
    querySelector<E>('[id="react-root"] section main header section > div:last-child > :nth-child(3)')

export const personalHomepageSelector = () =>
    querySelector<E>('[id="react-root"] section main header section > div:last-child  a')

export const searchNickNameSelector = () =>
    querySelector<E>('[id="react-root"] section main header section > div:last-child > span')

export const searchUserIdSelector = () =>
    querySelector<HTMLHeadingElement>('[id="react-root"] section main header section h2')

export const searchProfileTabArticlePageSelector = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child > article')

export const searchProfileTabOtherArticlePageSelector = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child > div')
