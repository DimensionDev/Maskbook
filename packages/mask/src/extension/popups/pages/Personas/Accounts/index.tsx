import { memo, useCallback, useMemo } from 'react'
import { useTitle } from '../../../hook/useTitle'
import { AccountsUI } from './UI'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useI18N } from '../../../../../utils'
import { compact, isEqual, unionWith } from 'lodash-unified'
import { EMPTY_LIST, EnhanceableSite, PopupRoutes, ProfileIdentifier } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'
import Services from '../../../../service'
import type { Account } from '../type'
import { useNavigate } from 'react-router-dom'
import { NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP } from '@masknet/shared'
import { getEnumAsArray } from '@dimensiondev/kit'

const Accounts = memo(() => {
    const { t } = useI18N()

    const navigate = useNavigate()
    const { proofs, currentPersona, setSelectedAccount } = PersonaContext.useContainer()

    const accounts = useMemo(() => {
        if (!currentPersona) return EMPTY_LIST

        const localProfiles = currentPersona.linkedProfiles.map<Account>((profile) => ({
            ...profile,
            identity: profile.identifier.userId,
        }))

        if (!proofs) return localProfiles

        const remoteProfiles = proofs
            .filter((x) => !!NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP[x.platform])
            .map<Account>((x) => {
                return {
                    ...x,
                    identifier: ProfileIdentifier.of(
                        NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP[x.platform],
                        x.identity,
                    ).unwrap(),
                }
            })

        return unionWith(localProfiles, remoteProfiles, (a, b) => isEqual(a.identity, b.identity))
    }, [proofs, currentPersona])

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
