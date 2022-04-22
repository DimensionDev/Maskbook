import { memo, useCallback, useMemo } from 'react'
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
import { SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID } from '@masknet/shared'
import { getEnumAsArray } from '@dimensiondev/kit'

const Accounts = memo(() => {
    const { t } = useI18N()

    const navigate = useNavigate()
    const { proofs, currentPersona, setSelectedAccount } = PersonaContext.useContainer()

    const accounts = useMemo(() => {
        if (!currentPersona) return []
        if (!proofs) return currentPersona.linkedProfiles

        return currentPersona.linkedProfiles.map((profile) => {
            const target = proofs.find(
                (x) =>
                    profile.identifier.userId.toLowerCase() === x.identity.toLowerCase() &&
                    profile.identifier.network.replace('.com', '') === x.platform,
            )

            return {
                ...profile,
                platform: target?.platform,
                identity: target?.identity,
                is_valid: SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID.includes(profile.identifier.network)
                    ? target?.is_valid
                    : true,
            }
        })
    }, [proofs, currentPersona])

    const definedSocialNetworks = compact(
        getEnumAsArray(EnhanceableSite).map((x) => {
            if (x.value === EnhanceableSite.Localhost) return null
            return x.value
        }),
    )

    console.log(definedSocialNetworks)

    const [, onConnect] = useAsyncFn(
        async (networkIdentifier: EnhanceableSite) => {
            if (currentPersona) {
                await Services.SocialNetwork.connectSocialNetwork(currentPersona.identifier, networkIdentifier, 'local')
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
