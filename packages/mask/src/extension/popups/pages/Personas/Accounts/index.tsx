import { memo, useCallback } from 'react'
import { useTitle } from '../../../hook/useTitle'
import { AccountsUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useI18N } from '../../../../../utils'
import { compact } from 'lodash-unified'
import { EnhanceableSite, PopupRoutes } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'
import Services from '../../../../service'
import type { Account } from '../type'
import { useNavigate } from 'react-router-dom'
import { getEnumAsArray } from '@dimensiondev/kit'

const Accounts = memo(() => {
    const { t } = useI18N()

    const navigate = useNavigate()
    const { currentPersona, setSelectedAccount, accounts } = PersonaContext.useContainer()

    const definedSocialNetworks = compact(
        getEnumAsArray(EnhanceableSite).map((x) => {
            if (x.value === EnhanceableSite.Localhost || x.value === EnhanceableSite.OpenSea) return null
            return x.value
        }),
    )

    const [, onConnect] = useAsyncFn(
        async (networkIdentifier: EnhanceableSite) => {
            if (currentPersona) {
                await Services.SocialNetwork.connectSite(currentPersona.identifier, networkIdentifier, 'local')
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
