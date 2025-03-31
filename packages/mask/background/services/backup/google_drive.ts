export async function getAccessToken() {
    const contained = await browser.permissions.contains({ permissions: ['identity'] })
    if (!contained) {
        const granted = await browser.permissions.request({ origins: ['identity'] })
        if (!granted) return
    }
    return new Promise<string>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            resolve(token)
        })
    })
}
