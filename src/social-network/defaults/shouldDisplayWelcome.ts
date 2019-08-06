import Services from '../../extension/service'
import { getStorage } from '../../utils/browser.storage'

export function shouldDisplayWelcomeDefault(network: string) {
    return async () => {
        const ids = await Services.People.queryMyIdentity(network)
        const storage = await getStorage()
        if (ids.length) return false
        if (storage.userDismissedWelcome) return false
        return true
    }
}
