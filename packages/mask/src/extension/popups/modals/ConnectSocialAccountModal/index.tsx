import { memo, useCallback } from 'react'
import { EMPTY_LIST, type EnhanceableSite } from '@masknet/shared-base'

import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { ActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { ConnectSocialAccounts } from '../../components/ConnectSocialAccounts/index.js'
import { useSupportSocialNetworks } from '../../hook/useSupportSocialNetworks.js'
import Services from '../../../service.js'
import { PersonaContext } from '@masknet/shared'

export const ConnectSocialAccountModal = memo<ActionModalBaseProps>(function ConnectSocialAccountModal({ ...rest }) {
    const { t } = useI18N()
    const { value: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()

    const { currentPersona } = PersonaContext.useContainer()

    const handleConnect = useCallback(
        async (networkIdentifier: EnhanceableSite) => {
            if (currentPersona) {
                await Services.SocialNetwork.connectSite(
                    currentPersona.identifier,
                    networkIdentifier,
                    'local',
                    undefined,
                    false,
                )
            }
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
