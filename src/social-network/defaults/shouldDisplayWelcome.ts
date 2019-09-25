import Services from '../../extension/service'
import { getStorage } from '../../utils/browser.storage'
import { SocialNetworkUI } from '../ui'

export async function shouldDisplayWelcomeDefault(this: SocialNetworkUI) {
    if (typeof this.networkIdentifier === 'function')
        throw new TypeError(
            'You cannot use shouldDisplayWelcomeDefault when networkIdentifier is a function. Please implement this function by yourself.',
        )

    if (process.env.firefoxVariant === 'GeckoView') return true
    const storage = (await getStorage(this.networkIdentifier)) || {}
    if (storage.forceDisplayWelcome) return true

    const ids = await Services.People.queryMyIdentity(this.networkIdentifier)
    if (ids.length) return false

    if (storage.userIgnoredWelcome) return false
    return true
}
