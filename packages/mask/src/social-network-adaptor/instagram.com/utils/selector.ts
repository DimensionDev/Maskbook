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
    querySelector<E>('[id="react-root"] section main  div[role="tablist"] > :last-child')

export const searchProfileTabPageSelector = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child')

export const searchProfileTabSelector = () =>
    querySelector<E>('[id="react-root"] section main div[role="tablist"]  a[aria-selected="false"]')

export const searchProfileActiveTabSelector = () =>
    querySelector<E>('[id="react-root"] section main  div[role="tablist"] a[aria-selected="true"]')

export const bioDescriptionSelector = () =>
    querySelector<E>('[id="react-root"] section main header section > div:last-child > :nth-child(3)')

export const personalHomepageSelector = () =>
    querySelector<E>('[id="react-root"] section main header section > div:last-child  a')

export const searchNickNameSelector = () =>
    querySelector<E>('[id="react-root"] section main header section > div:last-child > span')

export const searchUserIdSelector = () =>
    querySelector<HTMLHeadingElement>('[id="react-root"] section main header section h2')

export const searchUserIdInEditPageSelector = () =>
    querySelector('[id="react-root"] button[title="Change Profile Photo"] > img').closest(4).querySelector('h1')

export const searchProfileTabArticlePageSelector = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child > article')

export const searchProfileTabOtherArticlePageSelector = () =>
    querySelector<E>('[id="react-root"] section main > div > div:last-child > div')

export const searchInstagramAvatarListSelector = () =>
    querySelector('[role="dialog"] .piCib > div > form').closest(1).querySelector('button')

export const searchInstagramAvatarOpenFilesSelector = () =>
    querySelector('[id="react-root"] button[title="Change Profile Photo"] > img')
        .closest(4)
        .querySelector<HTMLFormElement>('form')

export const searchInstagramSaveAvatarButtonSelector = () =>
    querySelector<HTMLButtonElement>('section > div > header > div > div:last-child > button')

export const searchInstagramAvatarSelector = () =>
    querySelector('[id="react-root"] header img[alt="Change Profile Photo"], img[data-testid="user-avatar"]')

export const searchInstagramProfileAvatarButtonSelector = () =>
    querySelector('[id="react-root"] button[title="Change Profile Photo"] > img').closest<HTMLDivElement>(3)

export const searchInstagramAvatarSettingDialog = () => querySelector<E>('[id="react-root"]')

export const searchInstagramAvatarUploadLoadingSelector = () =>
    querySelector('[id="react-root"] button[title="Change Profile Photo"]')
        .closest(1)
        .querySelector<HTMLDivElement>('div[data-visualcompletion="loading-state"]')

export const searchInstagramProfileSettingButtonSelector = () =>
    querySelector('[id="react-root"] header button[title="Change Profile Photo"]')
        .closest(4)
        .querySelector('section > div > div')

export const searchInstagramPostAvatarSelector = () =>
    new LiveSelector<HTMLImageElement, false>().querySelectorAll<HTMLImageElement>(
        '[id="react-root"] [role="button"] > a > img[data-testid="user-avatar"]',
    )
