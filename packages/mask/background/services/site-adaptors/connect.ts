import { compact, first, sortBy } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { delay } from '@masknet/kit'
import {
    userGuideStatus,
    type PersonaIdentifier,
    type ProfileIdentifier,
    userGuideFinished,
    currentSetupGuideStatus,
    SetupGuideStep,
} from '@masknet/shared-base'
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
    return sortBy(
        [...definedSiteAdaptors.values()].filter((x) =>
            options.isSocialNetwork === undefined ? true : x.isSocialNetwork === options.isSocialNetwork,
        ),
        (x) => x.sortIndex,
    ).map((x) => ({ networkIdentifier: x.networkIdentifier }))
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

export async function hasSetup(network: string) {
    return !!userGuideStatus[network].value || userGuideFinished[network].value
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

    const permissionGranted = await requestSiteAdaptorsPermission([worker])
    if (!permissionGranted) return

    currentSetupGuideStatus[network].value = stringify({
        status: type === 'nextID' ? SetupGuideStep.VerifyOnNextID : SetupGuideStep.FindUsername,
        persona: identifier.toText(),
        username: profile?.userId,
    })

    const url = worker.homepage
    if (!url) return

    await delay(100)
    if (openInNewTab) {
        await browser.tabs.create({ active: true, url: worker.homepage })
    } else {
        const openedTabs = await browser.tabs.query({ url: `${url}/*` })
        const targetTab = openedTabs.find((x: { active: boolean }) => x.active) ?? first(openedTabs)

        if (targetTab?.id && targetTab.windowId) {
            await browser.tabs.update(targetTab.id, { active: true })
            await browser.windows.update(targetTab.windowId, { focused: true })
        } else {
            await browser.tabs.create({ active: true, url })
        }
    }
}
