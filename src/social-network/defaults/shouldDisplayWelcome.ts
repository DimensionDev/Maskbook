import Services from '../../extension/service'
import { getStorage } from '../../utils/browser.storage'

export function shouldDisplayWelcomeDefault(network: string) {
    return async () => {
        const storage = (await getStorage(network)) || {}
        if (storage.forceDisplayWelcome) return true

        const ids = await Services.People.queryMyIdentity(network)
        if (ids.length) return false

        if (storage.userIgnoredWelcome) return false
        return true
    }
}
