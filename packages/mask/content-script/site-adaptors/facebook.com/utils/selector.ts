// cspell:disable
import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { compact } from 'lodash-es'

type E = HTMLElement

function querySelector<T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

function querySelectorAll<T extends E>(selector: string) {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export function searchAvatarSelector() {
    return querySelector<HTMLImageElement>(
        '[role="navigation"] svg g image, [role="main"] [role="link"] [role="img"] image, [role="main"] [role="button"] [role="img"] image',
    )
}

export function searchNickNameSelector(userId?: string | null) {
    return querySelector<HTMLHeadingElement>(
        compact([userId ? `a[href$="id=${userId}"]` : undefined, 'span[dir="auto"] div h1']).join(','),
    )
}

export function searchUserIdSelector() {
    return querySelector<HTMLAnchorElement>('div[role="tablist"][data-visualcompletion="ignore-dynamic"] a[role="tab"]')
}

export function searchFacebookAvatarListSelector() {
    return querySelector('[role="dialog"] > div:nth-child(3)  input[type=file] + [role="button"]')
        .closest(3)
        .querySelector('div')
}

export function searchFacebookAvatarSelector() {
    return querySelector('[role="main"] [role="button"] svg[role="img"],[role="main"] [role="link"] svg[role="img"]')
}

export function searchFaceBookPostAvatarSelector() {
    return new LiveSelector<SVGElement, false>().querySelectorAll<SVGElement>(
        '[type="nested/pressable"] > a > div > svg, ul div[role="article"] a > div > svg[role="none"]',
    )
}

export function searchFacebookAvatarOpenFilesSelector() {
    return querySelector('[role="dialog"] input[type=file] ~ div')
}

export function searchFacebookProfileSettingButtonSelector() {
    return querySelector(
        '[role="main"] > div > div > div > div > div input[accept*="image"] + div[role="button"]',
    ).closest<E>(2)
}

export function searchFacebookProfileCoverSelector() {
    return querySelector('[role="button"] [role="img"]')
        .closest(10)
        .querySelector('input[type="file"] ~ div')
        .closest<E>(6)
        .querySelector('div')
}

export function searchFacebookEditProfileSelector() {
    return querySelector('[role="main"] [role="button"] [role="img"]')
        .closest(1)
        .querySelector<E>('i[data-visualcompletion="css-img"]')
}

export function searchFacebookSaveAvatarButtonSelector() {
    return new LiveSelector()
        .querySelector('[role="dialog"] [role="slider"]')
        .closest(7)
        .querySelectorAll('div')
        .map((x) => x.parentElement?.parentElement)
        .at(-1)
}

export function searchFacebookConfirmAvatarImageSelector() {
    return querySelector('[role="dialog"] [role="slider"]').closest(7).querySelector('img')
}

export function inpageAvatarSelector() {
    return querySelectorAll('[type="nested/pressable"]').closest<HTMLAnchorElement>(2)
}

export function toolboxInSidebarSelector() {
    return querySelector<E>('[data-pagelet="LeftRail"] > div > div > :nth-child(2) > ul > li:nth-child(2)')
}

export function toolboxInSpecialSidebarSelector() {
    return querySelector(
        '[role="navigation"] > div > div > div > :nth-child(2) > div > div > :nth-child(2) ul > li:nth-child(2)',
    )
}
export function toolboxInSidebarSelectorWithNoLeftRailStart() {
    return querySelector<E, false>('[role="banner"]')
        .closest(1)
        .querySelector('div + div > div > div > div > div > div > div > div > ul')
        .closest(1)
        .querySelector('div:nth-child(2) > ul > li:nth-child(2)')
}

// for getting normal tab style
export function profileTabUnselectedSelector() {
    return querySelector<E>('[role="tablist"] a[aria-selected="false"]')
}

// for getting activated tab style
export function profileTabSelectedSelector() {
    return querySelector<E>('[role="tablist"] a[aria-selected="true"]')
}

// for inserting web3 tab
export function searchProfileTabSelector() {
    return querySelector<E>('[role="tablist"] > div > div > :last-child')
}

// for getting the inserted web3 tab
export function web3TabSelector() {
    return querySelector<HTMLSpanElement>('[role="tablist"] a:nth-child(7)+span')
}

// for inserting web3 tab content
export function searchProfileTabPageSelector() {
    return querySelector<E>('[role="main"] > div:last-child > div')
}

// for getting profile section style
export function profileSectionSelector() {
    return querySelector<E>('[role="main"]').querySelector('[style]')
}

export function searchIntroSectionSelector() {
    return querySelector<E>('[role="main"] > div:last-child > div:last-child')
}

export function searchBioSelector() {
    return querySelector<E>(
        '[role="main"] > div:last-child > div:last-child > div > div > div:last-child > div > div > div > div > div > div > div:nth-child(2) > div span',
    )
}

export function searchResultHeadingSelector() {
    return querySelector('[role="article"]')
}

export function searchHomepageSelector() {
    return querySelector<HTMLSpanElement>('[data-pagelet="ProfileTilesFeed_0"] ul a span[dir="auto"]')
}
