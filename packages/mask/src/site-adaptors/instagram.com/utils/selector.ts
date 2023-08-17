import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const searchProfileTabListLastChildSelector = () =>
    querySelector<E>('section main  div[role="tablist"] > :last-child')

export const searchProfileTabPageSelector = () => querySelector('section main[role="main"] > div > :nth-child(2)')

export const searchProfileTabSelector = () =>
    querySelector<E>('section main div[role="tablist"]  a[aria-selected="false"]')

export const searchProfileActiveTabSelector = () =>
    querySelector<E>('section main  div[role="tablist"] a[aria-selected="true"]')

export const bioDescriptionSelector = () => querySelector<E>('section main header section > div:last-child h1')

export const personalHomepageSelector = () => querySelector<E>(' section main header section > div:last-child  a')

export const searchNickNameSelector = () => querySelector<E>('section main header section > div:last-child > span')

export const searchUserIdSelector = () => querySelector<HTMLHeadingElement>('section main header section h2')

export const searchUserIdInEditPageSelector = () =>
    querySelector('#react-root').querySelector('button > img').closest(4).querySelector('h1')

export const searchProfileTabArticlePageSelector = () => querySelector<E>('section main div[role="tablist"]')

export const searchProfileTabOtherArticlePageSelector = () =>
    querySelector<E>('section main > div > div:last-child > div')

export const searchInstagramAvatarListSelector = () =>
    querySelector('[role="dialog"] .piCib > div > form').closest(1).querySelector('button')

export const searchInstagramSaveAvatarButtonSelector = () =>
    querySelector<HTMLButtonElement>('section > div > header > div > div:last-child > button')

export const searchInstagramAvatarSelector = () => querySelector<E>('header img, img[data-testid="user-avatar"]')

export const searchInstagramProfileAvatarButtonSelector = () =>
    querySelector('section main header button > img').closest<HTMLDivElement>(3)

export const searchInstagramAvatarSettingDialog = () => querySelector('#ssrb_root_start').closest<E>(1)

export const searchInstagramAvatarEditPageSettingDialog = () => querySelector('#react-root')

export const searchInstagramProfileSettingButtonSelector = () =>
    querySelector('header button').closest(4).querySelector('section > div > div')

export const searchInstagramProfileEditButton = () => querySelector('a[href="/accounts/edit/"]')

export const searchInstagramPostAvatarSelector = () =>
    new LiveSelector<HTMLImageElement, false>().querySelectorAll<HTMLImageElement>(
        '[role="button"] > a > img[crossorigin="anonymous"]',
    )

export const inpageAvatarSelector = () =>
    querySelectorAll<HTMLDivElement>('[role=main] article[role=presentation] header [role=button]')

export const searchInstagramHandleSelector = () =>
    querySelector<HTMLAnchorElement>(
        'div[style="transform: translateX(0px);"] > div > div > div:last-child > div > span[aria-describedby] > div > a',
    )
export const searchInstagramSelfAvatarSelector = () =>
    querySelector(
        'div[style="transform: translateX(0px);"] > div > div > div:last-child > div > span[aria-describedby] > div > a img[crossorigin="anonymous"]',
    )
