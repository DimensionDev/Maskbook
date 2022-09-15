import { delay } from '@dimensiondev/kit'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { currentSetupGuideStatus, userGuideStatus } from '../../../shared/legacy-settings/settings.js'
import { SetupGuideStep } from '../../../shared/legacy-settings/types.js'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions.js'
import { requestSiteAdaptorsPermission } from '../helper/request-permission.js'
import stringify from 'json-stable-stringify'
import { first } from 'lodash-unified'

export async function getSupportedSites(): Promise<
    Array<{
        networkIdentifier: string
    }>
> {
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

    // #region reset the global setup status setting
    currentSetupGuideStatus[network].value = stringify({
        status: type === 'nextID' ? SetupGuideStep.VerifyOnNextID : SetupGuideStep.FindUsername,
        persona: identifier.toText(),
        username: profile?.userId,
    })

    await delay(100)
    // #endregion

    // #region open or switch the site
    const openedTabs = await browser.tabs.query({ url: `${worker.homepage}/*` })
    const targetTab = openedTabs.find((x) => x.active) ?? first(openedTabs)

    if (targetTab?.id) {
        await browser.tabs.update(targetTab.id, {
            active: true,
        })
        await browser.windows.update(targetTab.windowId, { focused: true })
    } else {
        await browser.tabs.create({ active: true, url: worker.homepage })
    }
    // #endregion
}
