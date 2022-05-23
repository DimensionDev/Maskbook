import { delay } from '@dimensiondev/kit'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions'
import { requestSiteAdaptorsPermission } from '../helper/request-permission'

export async function getSupportedSites(): Promise<Array<{ networkIdentifier: string }>> {
    return [...definedSiteAdaptors.values()].map((x) => ({ networkIdentifier: x.networkIdentifier }))
}

export async function migration_in_progress_setupSite(
    network: string,
    newTab: boolean,
    setSettingsCallback: () => void,
) {
    const worker = definedSiteAdaptors.get(network)
    const home = worker?.homepage

    // request permission from all sites supported.
    if (!(await requestSiteAdaptorsPermission([...definedSiteAdaptors.values()]))) return

    // TODO: move settings callback here.
    setSettingsCallback()
    await delay(100)
    if (!home) return
    if (!newTab) return home

    browser.tabs.create({ active: true, url: home })
    return
}

export async function migration_in_progress_connectSite(network: string, setSettingsCallback: () => void) {
    const worker = definedSiteAdaptors.get(network)
    if (!worker) return

    if (!(await requestSiteAdaptorsPermission([worker]))) return

    // TODO: move settings callback here.
    setSettingsCallback()

    await delay(100)

    if (worker.homepage) {
        browser.tabs.create({ active: true, url: worker.homepage })
    }
}
