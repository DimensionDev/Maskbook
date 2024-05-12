import { Sniffings } from '@masknet/shared-base'
import { maskSDK_URL, injectUserScriptMV2, evaluateContentScript } from '../../utils/injectScript.js'

export async function attachMaskSDKToCurrentActivePage(): Promise<boolean> {
    if (browser.scripting) {
        const [{ id }] = await browser.tabs.query({ active: true })
        if (!id) return false
        await Promise.all([attachMaskSDK3(id), evaluateContentScript(id)])
    } else if (browser.tabs) {
        await Promise.all([attachMaskSDK2(), evaluateContentScript(undefined)])
    }
    return true
}

async function attachMaskSDK2() {
    await browser.tabs.executeScript(undefined, {
        code: await injectUserScriptMV2(maskSDK_URL),
    })
}
async function attachMaskSDK3(id: number) {
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

    if (browser.scripting) {
        const [{ id }] = await browser.tabs.query({ active: true })
        if (!id) return
        await attachMaskSDK3(id)
    } else if (browser.tabs) {
        await attachMaskSDK2()
    }
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
