import { memo, useCallback, useMemo } from 'react'
import { EMPTY_LIST, SOCIAL_MEDIA_NAME, type EnhanceableSite } from '@masknet/shared-base'
import { PersonaContext, SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { requestPermissionFromExtensionPage } from '../../../shared-ui/index.js'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { ConnectSocialAccounts } from '@masknet/injected-ui/ConnectSocialAccounts'
import { useSupportSocialNetworks } from '../../hooks/index.js'
import { SOCIAL_MEDIA_ICON_FILTER_COLOR } from '../../constants.js'
import Services from '#services'
import { EventMap } from '../../../shared/definitions/event.js'
import { Trans } from '@lingui/react/macro'

export const ConnectSocialAccountModal = memo<ActionModalBaseProps>(function ConnectSocialAccountModal(props) {
    const { data: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()
    const networks = useMemo(
        () =>
            definedSocialNetworks.map((networkIdentifier) => {
                const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[networkIdentifier]
                return {
                    networkIdentifier,
                    icon:
                        Icon ?
                            <Icon
                                size={24}
                                style={{
                                    filter: SOCIAL_MEDIA_ICON_FILTER_COLOR[networkIdentifier],
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: 99,
                                }}
                            />
                        :   null,
                    name: SOCIAL_MEDIA_NAME[networkIdentifier] || '',
                }
            }),
        [definedSocialNetworks],
    )

    const { currentPersona } = PersonaContext.useContainer()

    const handleConnect = useCallback(
        async (networkIdentifier: EnhanceableSite) => {
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
            <ConnectSocialAccounts networks={networks} onConnect={handleConnect} />
        </ActionModal>
    )
})
