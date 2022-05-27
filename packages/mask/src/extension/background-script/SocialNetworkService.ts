import { currentSetupGuideStatus, userGuideStatus } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { SetupGuideStep } from '../../components/InjectedComponents/SetupGuide/types'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import {
    migration_in_progress_connectSite,
    migration_in_progress_setupSite,
} from '../../../background/services/site-adaptors/connect'

export {
    getDesignatedAutoStartPluginID,
    openSNSAndActivatePlugin,
    openProfilePage,
    getSupportedSites,
    openShareLink,
} from '../../../background/services/site-adaptors'

export async function setupSite(defaultNetwork: string, newTab = true) {
    return migration_in_progress_setupSite(defaultNetwork, newTab, () => {
        userGuideStatus[defaultNetwork].value = '1'
    })
}

export async function connectSite(
    identifier: PersonaIdentifier,
    network: string,
    type?: 'local' | 'nextID',
    profile?: ProfileIdentifier,
) {
    return migration_in_progress_connectSite(network, () => {
        currentSetupGuideStatus[network].value = stringify({
            status: type === 'nextID' ? SetupGuideStep.VerifyOnNextID : SetupGuideStep.FindUsername,
            persona: identifier.toText(),
            username: profile?.userId,
        })
    })
}
