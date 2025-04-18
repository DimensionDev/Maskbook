import { checkAndRequestPermission, requestDriveAccessToken } from '../../../shared/helpers/index.js'

/* eslint-disable @typescript-eslint/ban-ts-comment */
export async function getAccessToken(interactive = false) {
    const granted = await checkAndRequestPermission()
    if (!granted) return

    return requestDriveAccessToken(interactive)
}

export async function clearAccessToken() {
    const token = await getAccessToken()
    return new Promise<void>((resolve) => {
        // @ts-expect-error
        chrome.identity.removeCachedAuthToken({ token }, () => resolve())
    })
}
