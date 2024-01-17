import { MaskMessages, ProfileIdentifier } from '@masknet/shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { useAsync } from 'react-use'
import { useQueryClient } from '@tanstack/react-query'
import Services from '../../../../../shared-ui/service.js'
import { EventMap } from '../../../../../shared/definitions/event.js'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'
import { SetupGuideContext } from '../SetupGuideContext.js'

export function useConnectPersona() {
    const { userId, myIdentity, personaInfo, setIsFirstConnection, connected } = SetupGuideContext.useContainer()
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const persona = personaInfo?.identifier
    const queryClient = useQueryClient()
    return useAsync(async () => {
        if (!persona || !userId || connected) return
        const id = ProfileIdentifier.of(site, userId)
        if (!id.isSome()) return
        // attach persona with site profile
        await Services.Identity.attachProfile(id.value, persona, {
            connectionConfirmState: 'confirmed',
        })

        setIsFirstConnection(true)
        if (myIdentity.avatar) {
            await Services.Identity.updateProfileInfo(id.value, {
                avatarURL: myIdentity.avatar,
            })
        }
        // auto-finish the setup process
        if (!personaInfo) throw new Error('invalid persona')
        await Services.Identity.setupPersona(personaInfo.identifier)
        queryClient.removeQueries({ queryKey: ['query-persona-info', persona.publicKeyAsHex] })
        MaskMessages.events.ownPersonaChanged.sendToAll()

        Telemetry.captureEvent(EventType.Access, EventMap[activatedSiteAdaptorUI!.networkIdentifier])
    }, [site, persona, userId, myIdentity.avatar, connected, queryClient])
}
