import { currentSetupGuideStatus, userGuideStatus } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../../components/InjectedComponents/SetupGuide/types'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { delay } from '@dimensiondev/kit'
import { requestExtensionPermission } from '../../../background/services/helper'
import {
    definedSocialNetworkUIs,
    getNetworkWorker,
    loadSocialNetworkUI,
    loadSocialNetworkUIs,
    SocialNetworkUI,
} from '../../social-network'
import { Flags } from '../../../shared'

export async function getDefinedSocialNetworkUIs() {
    return [...definedSocialNetworkUIs.values()].map(({ networkIdentifier }) => {
        return {
            networkIdentifier,
        }
    })
}

function requestSNSAdaptorPermission(ui: SocialNetworkUI.Definition) {
    const req = ui.permission?.request()
    if (req) return req
    return requestExtensionPermission({ origins: [...ui.declarativePermissions.origins] })
}

function requestSNSAdaptorsPermission(uis: SocialNetworkUI.Definition[]) {
    return requestExtensionPermission({
        origins: [...uis.map((x) => x.declarativePermissions.origins).flat()],
    })
}

export async function setupSocialNetwork(defaultNetwork: string, newTab = true) {
    const ui = await loadSocialNetworkUI(defaultNetwork)
    const home = ui.utils.getHomePage?.()

    const uis = await loadSocialNetworkUIs()
    if (!Flags.no_web_extension_dynamic_permission_request) {
        if (!(await requestSNSAdaptorsPermission(uis))) return
    }

    userGuideStatus[defaultNetwork].value = '1'
    await delay(100)
    if (!home) return
    if (!newTab) return home

    browser.tabs.create({ active: true, url: home })
    return
}

export async function connectSocialNetwork(
    identifier: PersonaIdentifier,
    network: string,
    type?: 'local' | 'nextID',
    profile?: ProfileIdentifier,
) {
    const ui = await loadSocialNetworkUI(network)
    const home = ui.utils.getHomePage?.()
    if (!Flags.no_web_extension_dynamic_permission_request) {
        if (!(await requestSNSAdaptorPermission(ui))) return
    }
    currentSetupGuideStatus[network].value = stringify({
        status: type === 'nextID' ? SetupGuideStep.VerifyOnNextID : SetupGuideStep.FindUsername,
        persona: identifier.toText(),
        username: profile?.userId,
    })
    await delay(100)
    home && browser.tabs.create({ active: true, url: home })
}

export async function openProfilePage(network: string, userId?: string) {
    const ui = await loadSocialNetworkUI(network)
    const profile = ui.utils.getProfilePage?.(userId)
    if (!Flags.no_web_extension_dynamic_permission_request) {
        if (!(await requestSNSAdaptorPermission(ui))) return
    }
    await delay(100)
    profile && browser.tabs.create({ active: true, url: profile })
}

export async function openShareLink(SNSIdentifier: string, post: string) {
    const url = (await getNetworkWorker(SNSIdentifier)).utils.getShareLinkURL?.(post)
    if (!url) return
    const width = 700
    const height = 520
    browser.windows.create({
        url: url.toString(),
        width,
        height,
        type: 'popup',
        left: (screen.width - width) / 2,
        top: (screen.height - height) / 2,
    })
}

const key = 'openSNSAndActivatePlugin'
/**
 * This function will open a new web page, then open the composition dialog and activate the composition entry of the given plugin.
 * @param url URL to open
 * @param pluginID Plugin to activate
 */
export async function openSNSAndActivatePlugin(url: string, pluginID: string) {
    await browser.tabs.create({ active: true, url })
    sessionStorage.setItem(key, pluginID)
}
export async function getDesignatedAutoStartPluginID() {
    const val = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
    return val
}
