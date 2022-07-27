import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const searchUserIdOnMobileSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('div[data-sigil$="profile"] a')

export const searchAvatarSelector: () => LiveSelector<HTMLImageElement, true> = () =>
    querySelector<HTMLImageElement>(
        '[role="main"] [role="link"] [role="img"] image, [role="main"] [role="button"] [role="img"] image',
    )

export const searchNickNameSelector: () => LiveSelector<HTMLHeadingElement, true> = () =>
    querySelector<HTMLHeadingElement>('span[dir="auto"] div h1')

export const searchNickNameSelectorOnMobile: () => LiveSelector<E, true> = () => querySelector<E>('#cover-name-root h3')

export const bioDescriptionSelector = () =>
    querySelector('span[dir="auto"] div h1').closest(7).querySelector<HTMLSpanElement>('span[dir="auto"] > span')

export const bioDescriptionSelectorOnMobile: () => LiveSelector<HTMLDivElement, true> = () => querySelector('#bio div')

export const searchUserIdSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('div[role="tablist"][data-visualcompletion="ignore-dynamic"] a[role="tab"]')

export const searchUserIdSelectorOnMobile: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('#tlFeed div[data-sigil="scroll-area"] a:last-child')

// #endregion facebook nft avatar

export const searchFacebookAvatarListSelector = () =>
    querySelector('[role="dialog"] > div > div > div > input[type=file] + [role="button"]')
        .closest(3)
        .querySelector('div')

export const searchFacebookAvatarMobileListSelector = () => querySelector('#nuxChoosePhotoButton').closest<E>(6)

export const searchFacebookAvatarSelector = () =>
    querySelector('[role="main"] [role="button"] svg[role="img"],[role="main"] [role="link"] svg[role="img"]')

export const searchFacebookAvatarOnMobileSelector = () =>
    querySelector('[data-sigil="timeline-cover"] i[aria-label$="picture"]')

export const searchFaceBookPostAvatarSelector = () =>
    new LiveSelector<SVGElement, false>().querySelectorAll<SVGElement>(
        '[type="nested/pressable"] > a > div > svg, ul div[role="article"] a > div > svg[role="none"]',
    )

export const searchFaceBookPostAvatarOnMobileSelector = () => querySelectorAll('[data-gt=\'{"tn":"~"}\']')

export const searchFacebookAvatarOpenFilesSelector = () => querySelector('[role="dialog"] input[type=file] ~ div')

export const searchFacebookAvatarOpenFilesOnMobileSelector = () =>
    querySelector<HTMLInputElement>('#nuxChoosePhotoButton ~ input')

export const searchFacebookSaveAvatarButtonOnMobileSelector = () => querySelector('#nuxUploadPhotoButton')

export const searchFacebookAvatarContainerSelector = () =>
    querySelector('div[data-pagelet="ProfileActions"] > div > div')

export const searchFacebookProfileSettingButtonSelector = () =>
    querySelector('[role="button"] [role="img"]').closest(10).querySelector('input[type="file"] ~ div').closest<E>(2)

export const searchFacebookEditProfileSelector = () =>
    querySelector('[role="main"] [role="button"] [role="img"]')
        .closest(1)
        .querySelector<E>('i[data-visualcompletion="css-img"]')

export const searchFacebookSaveAvatarButtonSelector = () =>
    new LiveSelector()
        .querySelector('[role="dialog"] [role="slider"]')
        .closest(7)
        .querySelectorAll('div')
        .map((x) => x.parentElement?.parentElement)
        .at(-1)

export const searchFacebookConfirmAvatarImageSelector = () =>
    querySelector('[role="dialog"] [role="slider"]').closest(7).querySelector('img')
// #region

export const toolBoxInSideBarSelector: () => LiveSelector<E, true> = () =>
    /* cspell:disable-next-line */
    querySelector<E>('#ssrb_left_rail_start')
        .closest(1)
        .querySelector('h2')
        .closest(1)
        .querySelector('div > div > div > :nth-child(2) > ul > li:nth-child(2)')

// for getting normal tab style
export const profileTabUnselectedSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] a[aria-selected="false"]')

// for getting activated tab style
export const profileTabSelectedSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] [aria-selected="true"]')

// for inserting web3 tab
export const searchProfileTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] a:nth-child(7)')

// for getting the inserted web3 tab
export const web3TabSelector: () => LiveSelector<HTMLSpanElement, true> = () =>
    querySelector<HTMLSpanElement>('[role="main"] a:nth-child(7)+span')

// for inserting web3 tab content
export const searchProfileTabPageSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] > div:last-child > div')

// for getting profile section style
export const profileSectionSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"]').querySelector('[style]')

export const searchIntroSectionSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-pagelet="ProfileTilesFeed_0"]')

export const searchBioSelector: () => LiveSelector<HTMLSpanElement, true> = () =>
    querySelector<HTMLSpanElement>(
        '[data-pagelet="ProfileTilesFeed_0"] > div > div > div > div > div:last-child span[dir="auto"]',
    )

export const searchResultHeadingSelector = () => querySelector('[role="article"]')

export const searchHomepageSelector: () => LiveSelector<HTMLSpanElement, true> = () =>
    querySelector<HTMLSpanElement>('[data-pagelet="ProfileTilesFeed_0"] ul a span[dir="auto"]')
