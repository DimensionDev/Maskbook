// cspell:disable
import { LiveSelector } from '@dimensiondev/holoflows-kit'

type E = HTMLElement

function querySelector<T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}

export function rootSelector() {
    return querySelector<E>('m-app')
}

export function composerModalSelector() {
    return querySelector<E>('m-composer__modal')
}

export function postEditorInDialogSelector() {
    return querySelector<E>('m-composer__modal m-composer__titlebar m-composertitlebar__dropdown', true)
}

export function postEditorInTimelineSelector() {
    return querySelector<E>('m-composer m-composer__toolbar > div > :nth-child(6)', true)
}

export function toolboxInSidebarSelector() {
    return querySelector<E>('.m-sidebarNavigation__list li:nth-child(7)')
}

export function postEditorDraftContentSelector() {
    return querySelector<HTMLElement>('m-composer__modal m-composer__textarea textarea.m-composerTextarea__message')
}

export function handleSelector() {
    return querySelector<HTMLAnchorElement>('.m-sidebarNavigation__item--user [data-ref="sidenav-channel"]')
}

export function selfInfoSelectors() {
    return {
        handle: handleSelector().evaluate()?.getAttribute('href')?.slice(1).replace(/^@/, ''), // Could include `@` by chance.
        avatar: querySelector<HTMLImageElement>('.m-sidebarNavigation__item--user > a > div > img').evaluate()?.src,
    }
}

export function inpageAvatarSelector() {
    return new LiveSelector().querySelectorAll<HTMLDivElement>('.m-activityOwnerBlock__avatar')
}

export function composeButtonSelector() {
    return querySelector(
        [
            '.m-sidebarNavigation__item m-sidebarNavigation__item--compose',
            '.m-sidebarNavigation__item--compose a', // legacy
        ].join(','),
        true,
    )
}

export function composeTextareaSelector() {
    return new LiveSelector().querySelector<HTMLTextAreaElement>('m-composer__textarea textarea').enableSingleMode()
}

export function composeDialogIndicatorSelector() {
    return new LiveSelector().querySelector<HTMLDivElement>('m-composer__modal')
}

export function composerModalTextAreaSelector() {
    return new LiveSelector()
        .querySelector<HTMLTextAreaElement>('m-composer__modal m-composer__textArea .m-composer__textArea textarea')
        .enableSingleMode()
}

export function composerPreviewSelector() {
    return new LiveSelector()
        .querySelector<HTMLDivElement>('m-composer__modal m-composer__preview img')
        .enableSingleMode()
}

export function searchResultHeadingSelector() {
    return querySelector('m-discovery__search')
}

export function postContentSelector() {
    return new LiveSelector().querySelectorAll<HTMLDivElement>(
        [
            'm-activity m-activity__content .m-activityTop__mainColumn',
            'm-activity m-activity__content .m-activityContentText__body > m-readmore > span:first-child',
            'm-activity:not(.m-activity--minimalMode) m-activity__content .m-activityContent__messageWrapper > span:first-child',
            'm-activity:not(.m-activity--minimalMode) m-activity__content .m-activityContent__mediaDescriptionText',
        ].join(','),
    )
}

export function searchMindsProfileCover() {
    return querySelector('div[data-cy="data-minds-channel-banner"]')
}
