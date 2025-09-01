import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { PersonaContext } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite, PopupRoutes } from '@masknet/shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { memo, useCallback } from 'react'
import { requestPermissionFromExtensionPage } from '../../../shared-ui/index.js'
import { EventMap } from '../../../shared/definitions/event.js'
import { ConnectSocialAccounts } from '../../components/ConnectSocialAccounts/index.js'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useSupportSocialNetworks } from '../../hooks/index.js'
import { useNavigate } from 'react-router-dom'

export const ConnectSocialAccountModal = memo<ActionModalBaseProps>(function ConnectSocialAccountModal(props) {
    const { data: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()

    const { currentPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()

    const handleConnect = useCallback(
        async (networkIdentifier: EnhanceableSite) => {
            if (networkIdentifier === EnhanceableSite.Farcaster) {
                navigate(PopupRoutes.ConnectFirefly)
                return
            }
            if (!currentPersona) return
            if (!(await requestPermissionFromExtensionPage(networkIdentifier))) return
            await Services.SiteAdaptor.connectSite(currentPersona.identifier, networkIdentifier, undefined)

            const eventID = EventMap[networkIdentifier]
            if (eventID) Telemetry.captureEvent(EventType.Access, eventID)
        },
        [currentPersona],
    )

    if (!definedSocialNetworks.length) return null

    return (
        <ActionModal header={<Trans>Connect Social Account</Trans>} keepMounted {...props}>
            <ConnectSocialAccounts networks={definedSocialNetworks} onConnect={handleConnect} />
        </ActionModal>
    )
})
