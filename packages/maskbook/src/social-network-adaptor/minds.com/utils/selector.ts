import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(
    selector: string,
    singleMode: boolean = true,
) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const rootSelector: () => LiveSelector<E, true> = () => querySelector<E>('m-app')

export const composeAnchorSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('m-composer__topbarbutton')

export const composeAnchorTextSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('m-composer__topbarbutton .m-icon__assetsFile')

export const composerModalSelector: () => LiveSelector<E, true> = () => querySelector<E>('m-composer__modal')

export const postEditorInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('m-composer__modal m-composer__toolbar > div > *:nth-child(4)', true)
export const toolBoxInSideBarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('.m-sidebarNavigation__list li:nth-child(11)')

export const postEditorInTimelineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('m-composer__toolbar > div > *:nth-child(4)')

export const postEditorDraftContentSelector = () => {
    return querySelector<HTMLElement>('m-composer__modal m-composer__textarea textarea')
}

export const postsContentSelector = () => querySelectorAll('m-activity')

export const selfInfoSelectors = () => ({
    handle: querySelector<HTMLScriptElement>('.m-user-menu ul li a:first-child').map((x) =>
        x.innerText?.replace(/@/, '').trim(),
    ),
})

export const composeButtonSelector = () =>
    new LiveSelector().querySelector<HTMLDivElement>('.m-composer__topbarButton').enableSingleMode()

export const composeTextareaSelector = () =>
    new LiveSelector().querySelector<HTMLTextAreaElement>('m-composer__textarea textarea').enableSingleMode()

export const composeDialogIndicatorSelector = () =>
    new LiveSelector().querySelector<HTMLDivElement>('m-composer__modal')

export const mindsTextareaSelector = () =>
    new LiveSelector()
        .querySelector<HTMLDivElement>('m-composer__modal m-composer__textArea .m-composer__textArea')
        .enableSingleMode()
