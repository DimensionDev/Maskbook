import Services from '../../extension/service'
import { getStorage } from '../../utils/browser.storage'
import { getActivatedUI } from '../ui'

export async function shouldDisplayWelcomeDefault() {
    const netId = getActivatedUI().networkIdentifier
    if (process.env.firefoxVariant === 'GeckoView') return true
    const storage = (await getStorage(netId)) || {}
    if (storage.forceDisplayWelcome) return true

    const ids = await Services.People.queryMyIdentity(netId)
    if (ids.length) return false

    if (storage.userIgnoredWelcome) return false
    return true
}
