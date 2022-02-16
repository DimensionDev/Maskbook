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
    querySelector<HTMLImageElement>('[role="link"] [role="img"] image, [role="button"] [role="img"] image')

export const searchNickNameSelector: () => LiveSelector<HTMLSpanElement, true> = () =>
    querySelector<HTMLSpanElement>('span[dir="auto"] div h1')

export const searchNickNameSelectorOnMobile: () => LiveSelector<E, true> = () => querySelector<E>('#cover-name-root h3')

export const bioDescriptionSelector = () =>
    querySelector<HTMLSpanElement>('span[dir="auto"] div h1')
        .closest(7)
        .querySelector<HTMLSpanElement>('span[dir="auto"] > span')

export const bioDescriptionSelectorOnMobile: () => LiveSelector<HTMLDivElement, true> = () => querySelector('#bio div')

export const searchUserIdSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('div[data-pagelet="ProfileTabs"] a[role="tab"]')

export const searchUserIdSelectorOnMobile: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('#tlFeed div[data-sigil="scroll-area"] a:last-child')

// #endregion facebook nft avatar

export const searchFacebookAvatarListSelector = () =>
    querySelector('[role="dialog"] input[type=file] + [role="button"]').closest(3).querySelector('div')

export const searchFacebookAvatarMobileListSelector = () => querySelector('#nuxChoosePhotoButton').closest<E>(6)

export const searchFacebookAvatarSelector = () =>
    querySelector('[role="button"] svg[role="img"], [role="link"] svg[role="img"]')

export const searchFacebookAvatarOnMobileSelector = () =>
    querySelector('[data-sigil="timeline-cover"] i[aria-label$="picture"]')

export const searchFaceBookPostAvatarSelector = () =>
    new LiveSelector<SVGElement, false>().querySelectorAll<SVGElement>('[type="nested/pressable"] svg')

export const searchFaceBookPostAvatarOnMobileSelector = () => querySelectorAll('[data-gt=\'{"tn":"~"}\']')

export const searchFacebookAvatarOpenFilesSelector = () => querySelector('[role="dialog"] input[type=file] ~ div')

export const searchFacebookAvatarOpenFilesOnMobileSelector = () =>
    querySelector<HTMLInputElement>('#nuxChoosePhotoButton ~ input')

export const searchFacebookSaveAvatarButtonOnMobileSelector = () => querySelector('#nuxUploadPhotoButton')

export const searchFacebookProfileSettingButtonSelector = () =>
    querySelector('div[data-pagelet="ProfileActions"] > div > div > div:first-child')

export const searchFacebookEditProfileSelector = () =>
    querySelector('[role="button"] [role="img"]').closest(1).querySelector<E>('i[data-visualcompletion="css-img"]')

export const searchFacebookSaveAvatarButtonSelector = () =>
    new LiveSelector()
        .querySelector('[role="dialog"] [role="slider"]')
        .closest<HTMLDivElement>(7)
        .querySelectorAll('div')
        .map((x) => x.parentElement?.parentElement)
        .at(-1)

export const searchFacebookConfirmAvatarImageSelector = () =>
    querySelector('[role="dialog"] [role="slider"]').closest<HTMLDivElement>(7).querySelector('img')
// #region
