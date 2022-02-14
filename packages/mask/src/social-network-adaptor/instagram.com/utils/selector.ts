import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const searchProfileTabListLastChildSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[id="react-root"] section main  div[role="tablist"] > :last-child')

export const searchProfileTabPageSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child')

export const searchProfileTabPageSelector1: () => LiveSelector<E, true> = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child > :last-child')

export const searchProfileTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[id="react-root"] section main div[role="tablist"]  a[aria-selected="false"]')

export const searchProfileActiveTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[id="react-root"] section main  div[role="tablist"] a[aria-selected="true"]')

export const searchAvatarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[id="react-root"] section main header button  img')

export const bioDescriptionSelector = () =>
    querySelector<HTMLDivElement>('[id="react-root"] section main header section > div:last-child > :nth-child(3)')

export const personalHomepageSelector = () =>
    querySelector<HTMLDivElement>('[id="react-root"] section main header section > div:last-child  a')

export const searchNickNameSelector = () =>
    querySelector<HTMLDivElement>('[id="react-root"] section main header section > div:last-child > span')

export const searchUserIdSelector = () =>
    querySelector<HTMLDivElement>('[id="react-root"] section main header section h2')
