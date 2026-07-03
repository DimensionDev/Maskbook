import { Sniffings } from '@masknet/shared-base'
import { maskSDK_URL, evaluateContentScript } from '../../utils/injectScript.js'

export async function attachMaskSDKToCurrentActivePage(): Promise<boolean> {
    const [{ id }] = await browser.tabs.query({ active: true })
    if (!id) return false
    await Promise.all([attachMaskSDK(id), evaluateContentScript(id)])
    return true
}

async function attachMaskSDK(id: number) {
    // TODO: Firefox MV3
    const target = {
        target: { tabId: id },
        files: [maskSDK_URL],
        world: 'MAIN' as any,
    }
    if (Sniffings.is_firefox) delete target.world
    const [{ error }] = await browser.scripting.executeScript(target)
    if (error) throw error
}
export async function developmentMaskSDKReload(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') return

    const [{ id }] = await browser.tabs.query({ active: true })
    if (!id) return
    await attachMaskSDK(id)
}

export async function shouldSuggestConnectInPopup(url?: string): Promise<boolean> {
    if (!url) {
        const tabs = await browser.tabs.query({ active: true })
        if (!tabs.length) return false
        url = tabs[0].url
    }
    if (!url) return false
    return canInject(url) && !(await browser.permissions.contains({ origins: [new URL(url).origin + '/*'] }))
}

function canInject(url: string) {
    if (url.startsWith('http://localhost:')) return true
    if (url.startsWith('http://localhost/')) return true
    if (url.startsWith('http://127.0.0.1')) return true
    if (url.startsWith('https://')) return true
    return false
}
