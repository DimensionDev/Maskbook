import { compact, first, sortBy } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { delay } from '@masknet/kit'
import {
    type PersonaIdentifier,
    type ProfileIdentifier,
    currentSetupGuideStatus,
    SetupGuideStep,
} from '@masknet/shared-base'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions.js'
import type { SiteAdaptor } from '../../../shared/site-adaptors/types.js'
import type { Tabs } from 'webextension-polyfill'

async function hasPermission(origin: string): Promise<boolean> {
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
    return sortBy([...definedSiteAdaptors.values()], (x) => x.sortIndex)
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

export async function getAllOrigins() {
    const groups = await getSupportedOrigins()
    const promises = groups.map(async ({ origins, networkIdentifier }) => {
        const originsWithNoPermission = compact(
            await Promise.all(origins.map((origin) => hasPermission(origin).then((yes) => (yes ? null : origin)))),
        )
        return {
            networkIdentifier,
            hasPermission: !originsWithNoPermission.length,
        }
    })

    return Promise.all(promises)
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

/**
 * It's caller's responsibility to call browser.permissions.request to get the permissions needed.
 * @param identifier Persona
 * @param network Network to connect
 * @param profile Profile
 * @param openInNewTab Open in new tab
 */
export async function connectSite(
    identifier: PersonaIdentifier,
    network: string,
    profile?: ProfileIdentifier,
    openInNewTab = true,
) {
    const site = definedSiteAdaptors.get(network)
    if (!site) return

    const url = site.homepage
    if (!url) return

    let targetTab: Tabs.Tab | undefined
    if (openInNewTab) {
        targetTab = await browser.tabs.create({ active: true, url: site.homepage })
    } else {
        const openedTabs = await browser.tabs.query({ url: `${url}/*` })
        targetTab = openedTabs.find((x: { active: boolean }) => x.active) ?? first(openedTabs)

        if (!targetTab?.id || !targetTab.windowId) {
            await browser.tabs.create({ active: true, url })
        }
    }
    await delay(100)
    if (!targetTab?.windowId) return
    await browser.tabs.update(targetTab.id, { active: true })
    await browser.windows.update(targetTab.windowId, { focused: true })
    currentSetupGuideStatus[network].value = stringify({
        status: SetupGuideStep.VerifyOnNextID,
        persona: identifier.toText(),
        username: profile?.userId,
        tabId: targetTab.id,
    })
}
