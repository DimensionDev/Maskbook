import { delay } from '@dimensiondev/kit'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { currentSetupGuideStatus, userGuideStatus } from '../../../shared/legacy-settings/settings'
import { SetupGuideStep } from '../../../shared/legacy-settings/types'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions'
import { requestSiteAdaptorsPermission } from '../helper/request-permission'
import stringify from 'json-stable-stringify'

export async function getSupportedSites(): Promise<Array<{ networkIdentifier: string }>> {
    return [...definedSiteAdaptors.values()].map((x) => ({ networkIdentifier: x.networkIdentifier }))
}

export async function setupSite(network: string, newTab: boolean) {
    const worker = definedSiteAdaptors.get(network)
    const home = worker?.homepage

    // request permission from all sites supported.
    if (!(await requestSiteAdaptorsPermission([...definedSiteAdaptors.values()]))) return

    userGuideStatus[network].value = '1'
    await delay(100)
    if (!home) return
    if (!newTab) return home

    browser.tabs.create({ active: true, url: home })
    return
}

export async function connectSite(
    identifier: PersonaIdentifier,
    network: string,
    type?: 'local' | 'nextID',
    profile?: ProfileIdentifier,
) {
    const worker = definedSiteAdaptors.get(network)
    if (!worker) return

    if (!(await requestSiteAdaptorsPermission([worker]))) return

    currentSetupGuideStatus[network].value = stringify({
        status: type === 'nextID' ? SetupGuideStep.VerifyOnNextID : SetupGuideStep.FindUsername,
        persona: identifier.toText(),
        username: profile?.userId,
    })

    await delay(100)

    if (worker.homepage) {
        browser.tabs.create({ active: true, url: worker.homepage })
    }
}
