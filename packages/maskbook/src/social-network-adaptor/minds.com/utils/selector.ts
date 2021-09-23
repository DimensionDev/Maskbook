import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(
    selector: string,
    singleMode: boolean = true,
) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

export const rootSelector: () => LiveSelector<E, true> = () => querySelector<E>('m-app')

export const themeListItemSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>(
        'm-usermenu__v3 > div.m-user-menu.m-dropdown > ul > li:nth-child(5) .ng-star-inserted',
    )

export const composerModalSelector: () => LiveSelector<E, true> = () => querySelector<E>('m-composer__modal')

export const postEditorInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('m-composer__modal m-composer__toolbar > div > *:nth-child(4)', true)

export const postEditorInTimelineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('m-newsfeed m-composer', true)

export const toolBoxInSideBarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('.m-sidebarNavigation__list li:nth-child(11)')

export const postEditorDraftContentSelector = () => {
    return querySelector<HTMLElement>('m-composer__modal m-composer__textarea textarea.m-composerTextarea__message')
}

export const handleSelector = () => querySelector<HTMLScriptElement>('.m-user-menu ul li a:first-child')

export const selfInfoSelectors = () => ({
    handle: handleSelector().map((x) => x.innerText.replace(/@/, '').trim()),
    avatar: querySelector<HTMLScriptElement>('.m-user-menu .minds-avatar').map((x) =>
        // get everything between the parens (the url)
        x.style.backgroundImage.match(/\((.*?)\)/)![1].replace(/('|")/g, ''),
    ),
})

export const composeButtonSelector = () =>
    querySelector(
        [
            '.m-sidebarNavigation__item m-sidebarNavigation__item--compose',
            '.m-sidebarNavigation__item--compose a', // legacy
        ].join(),
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
            'm-activity__modal m-activity__content .m-activityContent__mediaDescriptionText',
            'm-activity__modal m-activity__content .m-activityContent__messageWrapper > span:first-child',
            'm-activity:not(.m-activity--minimalMode) m-activity__content .m-activityContent__messageWrapper > span:first-child',
            'm-activity:not(.m-activity--minimalMode) m-activity__content .m-activityContent__mediaDescriptionText',
        ].join(),
    )
