import type { ProfileIdentifier } from '@masknet/shared-base'

export function gotoProfilePageTwitter(profile: ProfileIdentifier) {
    const path = `/${profile.userId}`
    ;(document.querySelector(`[href="${path}"]`) as HTMLElement | undefined)?.click()
    setTimeout(() => {
        // The classic way
        if (!location.pathname.startsWith(path)) location.pathname = path
    }, 400)
}
