/* eslint-disable @typescript-eslint/ban-ts-comment */
export async function getAccessToken(interactive = false) {
    const contained = await browser.permissions.contains({ permissions: ['identity'] })
    if (!contained) {
        const granted = await browser.permissions.request({ origins: ['identity'] })
        if (!granted) return
    }
    return new Promise<string>((resolve, reject) => {
        // @ts-expect-error
        chrome.identity.getAuthToken({ interactive }, (token, error) => {
            // @ts-expect-error
            if (chrome.runtime.lastError) {
                // @ts-expect-error
                reject(new Error(chrome.runtime.lastError.message))
                return
            }
            resolve(token)
        })
    })
}

export async function clearAccessToken() {
    const token = await getAccessToken()
    return new Promise<void>((resolve) => {
        // @ts-expect-error
        chrome.identity.removeCachedAuthToken({ token }, () => resolve())
    })
}
