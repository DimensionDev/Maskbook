import { memo, useCallback } from 'react'
import { EMPTY_LIST, type EnhanceableSite } from '@masknet/shared-base'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { ConnectSocialAccounts } from '../../components/ConnectSocialAccounts/index.js'
import { useSupportSocialNetworks } from '../../hooks/index.js'
import Services from '../../../service.js'
import { PersonaContext } from '@masknet/shared'
import { useTelemetry } from '@masknet/web3-hooks-base'
import { EventType } from '@masknet/web3-telemetry/types'
import { EventMap } from '../../pages/Personas/common.js'

export const ConnectSocialAccountModal = memo<ActionModalBaseProps>(function ConnectSocialAccountModal({ ...rest }) {
    const { t } = useI18N()
    const { value: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()
    const telemetry = useTelemetry()

    const { currentPersona } = PersonaContext.useContainer()

    const handleConnect = useCallback(
        async (networkIdentifier: EnhanceableSite) => {
            if (!currentPersona) return
            await Services.SiteAdaptor.connectSite(currentPersona.identifier, networkIdentifier, 'local', undefined)
            telemetry.captureEvent(EventType.Access, EventMap[networkIdentifier])
        },
        [currentPersona],
    )

    if (!definedSocialNetworks.length) return null

    return (
        <ActionModal header={t('popups_connect_social_account')} keepMounted {...rest}>
            <ConnectSocialAccounts networks={definedSocialNetworks} onConnect={handleConnect} />
        </ActionModal>
    )
})
