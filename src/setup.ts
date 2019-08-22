import { activateSocialNetworkUI, definedSocialNetworkUIs } from './social-network/ui'
import { definedSocialNetworkWorkers } from './social-network/worker'
import { MessageCenter } from './utils/messages'
import { GetContext } from '@holoflows/kit/es'

function UIProvider() {
    return [import('./social-network-provider/facebook.com/ui-provider')]
}
function WorkerProvider() {
    return [
        import('./social-network-provider/facebook.com/worker-provider'),
        import('./social-network-provider/options-page/index'),
    ]
}

export async function backgroundSetup() {
    MessageCenter.on('closeActiveTab', async () => {
        const tabs = await browser.tabs.query({
            active: true,
        })
        if (tabs[0]) {
            await browser.tabs.remove(tabs[0].id!)
        }
    })
    Object.assign(window, {
        // @ts-ignore
        elliptic: await import('elliptic'),
    })
    await Promise.all(WorkerProvider())
}
Object.assign(window, { definedSocialNetworkWorkers, definedSocialNetworkUIs })
export async function uiSetup() {
    await Promise.all(UIProvider())
    activateSocialNetworkUI()

    const close = window.close
    window.close = () => {
        Reflect.apply(close, window, [])
        setTimeout(async () => {
            if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query && browser.tabs.remove) {
                const { id } = await browser.tabs.getCurrent()
                id && (await browser.tabs.remove(id))
            } else {
                MessageCenter.emit('closeActiveTab', undefined)
            }
        }, 400)
    }
    // In options page, we need all WorkerProviders to be registered,
    // but no action will be performed.
    if (GetContext() === 'options') await Promise.all(WorkerProvider())
}
