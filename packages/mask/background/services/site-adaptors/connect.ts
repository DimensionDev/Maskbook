import { compact } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { delay } from '@masknet/kit'
import { openOrActiveTab } from '@masknet/shared-base-ui'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { currentSetupGuideStatus, userGuideStatus } from '../../../shared/legacy-settings/settings.js'
import { SetupGuideStep } from '../../../shared/legacy-settings/types.js'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions.js'
import { requestSiteAdaptorsPermission } from '../helper/request-permission.js'
import type { SiteAdaptor } from '../../../shared/site-adaptors/types.js'

const hasPermission = async (origin: string): Promise<boolean> => {
    return browser.permissions.contains({
        origins: [origin],
    })
}

interface SitesQueryOptions {
    isSocialNetwork?: boolean
}

export async function getSupportedSites(options: SitesQueryOptions = {}): Promise<
    Array<{
        networkIdentifier: string
    }>
> {
    return [...definedSiteAdaptors.values()]
        .filter((x) => (options.isSocialNetwork === undefined ? true : x.isSocialNetwork === options.isSocialNetwork))
        .map((x) => ({ networkIdentifier: x.networkIdentifier }))
}

export async function getSupportedOrigins(options: SitesQueryOptions = {}): Promise<
    Array<{
        networkIdentifier: string
        origins: string[]
    }>
> {
    return [...definedSiteAdaptors.values()]
        .filter((x) => (options.isSocialNetwork === undefined ? true : x.isSocialNetwork === options.isSocialNetwork))
        .map((x) => ({ networkIdentifier: x.networkIdentifier, origins: [...x.declarativePermissions.origins] }))
}
export async function getOriginsWithoutPermission(options: SitesQueryOptions = {}): Promise<
    Array<{
        networkIdentifier: string
        origins: string[]
    }>
> {
    const groups = await getSupportedOrigins(options)
    const promises = groups.map(async ({ origins, networkIdentifier }) => {
        const unGrantedOrigins = compact(
            await Promise.all(origins.map((origin) => hasPermission(origin).then((yes) => (yes ? null : origin)))),
        )
        if (!unGrantedOrigins.length) return null
        return {
            networkIdentifier,
            origins: compact(unGrantedOrigins),
        }
    })
    return compact(await Promise.all(promises))
}

export async function getSitesWithoutPermission(): Promise<SiteAdaptor.Definition[]> {
    const groups = [...definedSiteAdaptors.values()]
    const promises = groups.map(async (x) => {
        const origins = x.declarativePermissions.origins
        const unGrantedOrigins = compact(
            await Promise.all(origins.map((origin) => hasPermission(origin).then((yes) => (yes ? null : origin)))),
        )
        if (!unGrantedOrigins.length) return null
        return x
    })
    return compact(await Promise.all(promises))
}

export async function setupSite(network: string, newTab: boolean) {
    const worker = definedSiteAdaptors.get(network)
    const home = worker?.homepage

    // request permission from all sites supported.
    if (!(await requestSiteAdaptorsPermission([...definedSiteAdaptors.values()]))) return

    if (!userGuideStatus[network].value) userGuideStatus[network].value = '1'

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
    openInNewTab = true,
) {
    const worker = definedSiteAdaptors.get(network)
    if (!worker) return

    if (!(await requestSiteAdaptorsPermission([worker]))) return

    // #region reset the global setup status settings
    currentSetupGuideStatus[network].value = stringify({
        status: type === 'nextID' ? SetupGuideStep.VerifyOnNextID : SetupGuideStep.FindUsername,
        persona: identifier.toText(),
        username: profile?.userId,
    })

    await delay(100)
    // #endregion
    if (openInNewTab) {
        await browser.tabs.create({ active: true, url: worker.homepage })
    } else {
        await openOrActiveTab(worker.homepage)
    }
}
