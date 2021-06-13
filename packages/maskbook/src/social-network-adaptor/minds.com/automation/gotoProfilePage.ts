import type { ProfileIdentifier } from '../../../database/type'

export function gotoProfilePageMinds(profile: ProfileIdentifier) {
    const path = `/${profile.userId}`
    ;(document.querySelector(`[href="${path}"]`) as HTMLElement | undefined)?.click()
    setTimeout(() => {
        // The classic way
        if (!location.pathname.startsWith(path)) location.pathname = path
    }, 400)
}
