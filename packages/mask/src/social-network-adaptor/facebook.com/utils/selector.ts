import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const searchUserIdOnMobileSelector: () => LiveSelector<E, true> = () =>
    querySelector<HTMLMetaElement>('div[data-sigil$="profile"] a')

export const searchAvatarSelector: () => LiveSelector<E, true> = () => querySelector<E>('[href="/me/"] image')

export const searchNickNameSelector: () => LiveSelector<E, true> = () => querySelector<E>('[href="/me/"] span > span')

export const bioDescriptionSelector = () =>
    querySelector('[role="main"] h1').closest(5).querySelector<HTMLSpanElement>('span > span')

// #endregion facebook nft avatar

export const searchFacebookAvatarListSelector = () =>
    querySelector('[role="dialog"] input[type=file] + [role="button"]').closest(3).querySelector('div')

export const searchFacebookAvatarMobileListSelector = () => querySelector('#nuxChoosePhotoButton').closest<E>(6)

export const searchFacebookAvatarSelector = () => querySelector('[role="button"] [role="img"]')

export const searchFacebookAvatarOnMobileSelector = () =>
    querySelector('[data-sigil="timeline-cover"] i[aria-label$="picture"]')

export const searchFaceBookPostAvatarSelector = () => querySelectorAll('[type="nested/pressable"] svg')

export const searchFaceBookPostAvatarOnMobileSelector = () => querySelectorAll('[data-gt=\'{"tn":"~"}\']')

export const searchFacebookAvatarOpenFilesSelector = () => querySelector('[role="dialog"] input[type=file] ~ div')

export const searchFacebookAvatarOpenFilesOnMobileSelector = () =>
    querySelector<HTMLInputElement>('#nuxChoosePhotoButton ~ input')

export const searchFacebookSaveAvatarButtonOnMobileSelector = () => querySelector('#nuxUploadPhotoButton')

export const searchFacebookProfileSettingButtonSelector = () =>
    querySelector('[role="button"] [role="img"]').closest(10).querySelector('input[type="file"] ~ div').closest<E>(2)

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
