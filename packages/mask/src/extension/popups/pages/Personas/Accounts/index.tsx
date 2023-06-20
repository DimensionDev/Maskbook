import { memo, useCallback } from 'react'
import { useTitle } from '../../../hook/useTitle.js'
import { AccountsUI } from './UI.js'
import { useI18N } from '../../../../../utils/index.js'
import { EMPTY_LIST, type EnhanceableSite, PopupRoutes } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'
import Services from '../../../../service.js'
import type { Account } from '../type.js'
import { useNavigate } from 'react-router-dom'
import { useSupportSocialNetworks } from '../../../hook/useSupportSocialNetworks.js'
import { PersonaContext } from '@masknet/shared'

const Accounts = memo(() => {
    const { t } = useI18N()

    const navigate = useNavigate()
    const { currentPersona, setSelectedAccount, accounts } = PersonaContext.useContainer()
    const { value: definedSocialNetworks = EMPTY_LIST } = useSupportSocialNetworks()

    const [, onConnect] = useAsyncFn(
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

    const onEnterDetail = useCallback((account: Account) => {
        setSelectedAccount(account)
        navigate(PopupRoutes.AccountDetail)
    }, [])

    useTitle(t('popups_social_account'))

    return (
        <AccountsUI
            accounts={accounts}
            networks={definedSocialNetworks}
            onConnect={onConnect}
            onEnterDetail={onEnterDetail}
        />
    )
})

export default Accounts
