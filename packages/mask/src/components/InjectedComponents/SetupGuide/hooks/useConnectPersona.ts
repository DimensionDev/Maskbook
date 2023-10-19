import { MaskMessages, ProfileIdentifier } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { useAsyncFn } from 'react-use'
import Services from '../../../../../shared-ui/service.js'
import { EventMap } from '../../../../extension/popups/pages/Personas/common.js'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'
import { SetupGuideContext } from '../SetupGuideContext.js'
import { usePersonaConnected } from './usePersonaConnected.js'

export function useConnectPersona() {
    const { step, userId, currentIdentityResolved, destinedPersonaInfo: personaInfo } = SetupGuideContext.useContainer()
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const persona = personaInfo?.identifier
    const connected = usePersonaConnected()
    return useAsyncFn(async () => {
        if (!persona || connected) return
        const id = ProfileIdentifier.of(site, userId)
        if (!id.isSome()) return
        // attach persona with site profile
        await Services.Identity.attachProfile(id.value, persona, {
            connectionConfirmState: 'confirmed',
        })

        if (currentIdentityResolved.avatar) {
            await Services.Identity.updateProfileInfo(id.value, {
                avatarURL: currentIdentityResolved.avatar,
            })
        }
        // auto-finish the setup process
        if (!personaInfo) throw new Error('invalid persona')
        await Services.Identity.setupPersona(personaInfo?.identifier)
        queryClient.invalidateQueries(['query-persona-info', persona.publicKeyAsHex])
        MaskMessages.events.ownPersonaChanged.sendToAll()

        Telemetry.captureEvent(EventType.Access, EventMap[activatedSiteAdaptorUI!.networkIdentifier])
    }, [site, personaInfo, step, persona, userId, currentIdentityResolved.avatar, connected])
}
