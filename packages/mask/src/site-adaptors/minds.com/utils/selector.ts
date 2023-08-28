import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

export const rootSelector: () => LiveSelector<E, true> = () => querySelector<E>('m-app')

export const themeListItemSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('.m-sidebarNavigation__list > li:nth-child(7) > a > span')

export const composerModalSelector: () => LiveSelector<E, true> = () => querySelector<E>('m-composer__modal')

export const postEditorInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('m-composer__modal m-composer__toolbar > div > *:nth-child(4)', true)

export const postEditorInDialogSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('m-composer__modal m-composer__titlebar m-composertitlebar__dropdown', true)

export const postEditorInTimelineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('m-composer m-composer__toolbar > div > :nth-child(6)', true)

export const toolboxInSidebarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('.m-sidebarNavigation__list li:nth-child(7)')

export const postEditorDraftContentSelector = () => {
    return querySelector<HTMLElement>('m-composer__modal m-composer__textarea textarea.m-composerTextarea__message')
}

export const handleSelector = () => querySelector('.m-sidebarNavigation__item--user > a > div > span')

export const selfInfoSelectors = () => ({
    handle: handleSelector().evaluate()?.innerText.trim(),
    avatar: querySelector<HTMLImageElement>('.m-sidebarNavigation__item--user > a > div > img').evaluate()?.src,
})

export const inpageAvatarSelector = () =>
    new LiveSelector().querySelectorAll<HTMLDivElement>('.m-activityOwnerBlock__avatar')

export const composeButtonSelector = () =>
    querySelector(
        [
            '.m-sidebarNavigation__item m-sidebarNavigation__item--compose',
            '.m-sidebarNavigation__item--compose a', // legacy
        ].join(','),
        true,
    )

export const composeTextareaSelector = () =>
    new LiveSelector().querySelector<HTMLTextAreaElement>('m-composer__textarea textarea').enableSingleMode()

export const composeDialogIndicatorSelector = () =>
    new LiveSelector().querySelector<HTMLDivElement>('m-composer__modal')

export const composerModalTextAreaSelector = () =>
    new LiveSelector()
        .querySelector<HTMLTextAreaElement>('m-composer__modal m-composer__textArea .m-composer__textArea textarea')
        .enableSingleMode()

export const composerPreviewSelector = () =>
    new LiveSelector().querySelector<HTMLDivElement>('m-composer__modal m-composer__preview img').enableSingleMode()

export const searchResultHeadingSelector = () => querySelector('m-discovery__search')

export const postContentSelector = () =>
    new LiveSelector().querySelectorAll<HTMLDivElement>(
        [
            'm-activityv2 m-activityv2__content .m-activityTop__mainColumn',
            'm-activityv2 m-activityv2__content .m-activityContentText__body > m-readmore > span:first-child',
            'm-activity:not(.m-activity--minimalMode) m-activity__content .m-activityContent__messageWrapper > span:first-child',
            'm-activity:not(.m-activity--minimalMode) m-activity__content .m-activityContent__mediaDescriptionText',
        ].join(','),
    )

export const searchMindsProfileCover = () => querySelector('div[data-cy="data-minds-channel-banner"]')
