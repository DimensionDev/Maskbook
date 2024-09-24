// cspell:disable
import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

function querySelector<T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
function querySelectorAll<T extends E>(selector: string) {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export function searchProfileTabListLastChildSelector() {
    return querySelector<E>('section main  div[role="tablist"] > :last-child')
}

export function searchProfileTabPageSelector() {
    return querySelector('section main[role="main"] > div > :last-child')
}

export function searchProfileTabSelector() {
    return querySelector<E>('section main div[role="tablist"]  a[aria-selected="false"]')
}

export function searchProfileActiveTabSelector() {
    return querySelector<E>('section main  div[role="tablist"] a[aria-selected="true"]')
}

export function bioDescriptionSelector() {
    return querySelector<E>('section main header section > div:last-child h1')
}

export function searchNickNameSelector() {
    return querySelector<E>('section main header section > div:last-child > div > span')
}

export function searchProfileTabArticlePageSelector() {
    return querySelector<E>('section main div[role="tablist"]')
}

export function searchInstagramAvatarListSelector() {
    return querySelector('[role="dialog"] .piCib > div > form').closest(1).querySelector('button')
}

export function searchInstagramAvatarSelector() {
    return querySelector<E>('header img, img[data-testid="user-avatar"]')
}

export function searchInstagramProfileAvatarButtonSelector() {
    return querySelector('section main header button > img').closest<HTMLDivElement>(3)
}

export function searchInstagramAvatarSettingDialog() {
    return querySelector('#ssrb_root_start').closest<E>(1)
}

export function searchInstagramAvatarEditPageSettingDialog() {
    return querySelector('#react-root')
}

export function searchInstagramProfileEditButton() {
    return querySelector('a[href="/accounts/edit/"]')
}

export function searchInstagramPostAvatarSelector() {
    return new LiveSelector<HTMLImageElement, false>().querySelectorAll<HTMLImageElement>(
        '[role="button"] > a > img[crossorigin="anonymous"]',
    )
}

export function inpageAvatarSelector() {
    return querySelectorAll<HTMLDivElement>('[role=main] article[role=presentation] header [role=button]')
}

export function searchInstagramHandleSelector() {
    return querySelector<HTMLAnchorElement>('a[role=link]:has(img[alt$=" profile picture"])')
}
export function searchInstagramSelfAvatarSelector() {
    return querySelector(
        'div[style="transform: translateX(0px);"] > div > div > div:last-child > div > span[aria-describedby] > div > a img[crossorigin="anonymous"]',
    )
}
