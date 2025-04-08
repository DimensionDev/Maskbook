/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'

export async function requestDriveAccessToken(interactive = false) {
    if (!isEnvironment(Environment.ExtensionProtocol) && !isEnvironment(Environment.ManifestBackground)) {
        // The User Activation limitation is from Firefox
        throw new Error(
            'browser.permissions.request can only be called after a User Activation and from a chrome-extension:// protocol.',
        )
    }
    return new Promise<string>((resolve, reject) => {
        // @ts-expect-error
        chrome.identity.getAuthToken(
            {
                interactive,
                scopes: ['https://www.googleapis.com/auth/drive.file', 'email'],
            },
            (token: string) => {
                // @ts-expect-error
                if (chrome.runtime.lastError) {
                    // @ts-expect-error
                    reject(new Error(chrome.runtime.lastError.message))
                    return
                }
                resolve(token)
            },
        )
    })
}
