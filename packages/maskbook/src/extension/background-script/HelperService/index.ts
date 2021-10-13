import { memoizePromise } from '../../../utils'
import { getNetworkWorker } from '../../../social-network'
import { PopupRoutes } from '../../popups'
import urlcat from 'urlcat'
import { currentPopupWindowId } from '../../../settings/settings'

export * from './storage'

const cache = new Map<string, string>()

export const resolveTCOLink = memoizePromise(
    async (u: string) => {
        if (!u.startsWith('https://t.co/')) return null
        if (cache.has(u)) return cache.get(u)!
        const res = await globalThis.fetch(u, {
            redirect: 'error',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
        })
        const text = await res.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const dom = doc.querySelector('noscript > meta') as HTMLMetaElement
        if (!dom) return null
        const [, url] = dom.content.split('URL=')
        if (url) cache.set(u, url)
        return url ?? null
    },
    (x) => x,
)

export function fetch(url: string) {
    return globalThis.fetch(url).then((x) => x.blob())
}

export function fetchJSON(url: string): Promise<unknown> {
    return globalThis.fetch(url).then((x) => x.json())
}
export { requestExtensionPermission, queryExtensionPermission } from './extensionPermission'

export async function createNewWindowAndPasteShareContent(SNSIdentifier: string, post: string) {
    const url = (await getNetworkWorker(SNSIdentifier)).utils.getShareLinkURL?.(post)
    if (!url) return
    browser.tabs.create({ active: true, url: url.toString() })
}

export async function openPopupsWindow(route?: string, params?: Record<string, any>) {
    const windows = await browser.windows.getAll()
    const popup = windows.find((win) => win && win.type === 'popup' && win.id === currentPopupWindowId.value)

    // Focus on the pop-up window if it already exists
    if (popup) {
        await browser.windows.update(currentPopupWindowId.value, { focused: true })
    } else {
        const url = urlcat('popups.html#', route ?? PopupRoutes.Wallet, { toBeClose: 1, ...params })

        let left: number
        let top: number

        try {
            const lastFocused = await browser.windows.getLastFocused()
            // Position window in top right corner of lastFocused window.
            top = lastFocused.top ?? 0
            left = (lastFocused.left ?? 0) + (lastFocused.width ?? 0) - 350
        } catch (error_) {
            // The following properties are more than likely 0, due to being
            // opened from the background chrome process for the extension that
            // has no physical dimensions

            const { screenX, screenY, outerWidth } = window
            top = Math.max(screenY, 0)
            left = Math.max(screenX + (outerWidth - 350), 0)
        }

        const { id } = await browser.windows.create({
            url: browser.runtime.getURL(url),
            width: 350,
            height: 640,
            type: 'popup',
            state: 'normal',
            left,
            top,
        })

        // update currentPopupWindowId and clean event
        if (id) {
            currentPopupWindowId.value = id
            browser.windows.onRemoved.addListener(function listener(windowID: number) {
                if (windowID === id) {
                    currentPopupWindowId.value = 0
                }
            })

            // firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1271047
            if (process.env.target === 'firefox') {
                browser.windows.update(id, {
                    left,
                    top,
                })
            }
        }
    }
}

export async function removePopupWindow() {
    if (currentPopupWindowId.value) {
        browser.windows.remove(currentPopupWindowId.value)
    }
}

export function openInternalPage(path: string) {
    browser.tabs.create({
        active: true,
        url: browser.runtime.getURL(path),
    })
}
