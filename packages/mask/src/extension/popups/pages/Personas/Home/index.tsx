import { memo, useCallback } from 'react'
import { initData, PersonaContext } from '../hooks/usePersonaContext'
import { useNavigate } from 'react-router-dom'
import { PersonaHomeUI } from './UI'
import {
    ECKeyIdentifier,
    EMPTY_LIST,
    EnhanceableSite,
    NextIDAction,
    PopupRoutes,
    ProfileIdentifier,
} from '@masknet/shared-base'
import Services from '../../../../service'
import { SOCIAL_MEDIA_ICON_MAPPING } from '@masknet/shared'
import { compact } from 'lodash-unified'
import { definedSocialNetworkUIs } from '../../../../../social-network/define'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import urlcat from 'urlcat'
import { MethodAfterPersonaSign } from '../../Wallet/type'
import type { UnbindStatus } from '../components/ProfileList'

const PersonaHome = memo(() => {
    const { currentPersona, setDeletingPersona, personas } = PersonaContext.useContainer()
    const navigate = useNavigate()

    const onChangeCurrentPersona = useCallback(
        (identifier: ECKeyIdentifier) => Services.Settings.setCurrentPersonaIdentifier(identifier),
        [],
    )

    const definedSocialNetworks = compact(
        [...definedSocialNetworkUIs.values()].map(({ networkIdentifier }) => {
            if (networkIdentifier === EnhanceableSite.Localhost) return null
            return networkIdentifier
        }),
    )

    const onConnectProfile = useCallback(
        async (network: string) => {
            if (currentPersona) await Services.SocialNetwork.connectSocialNetwork(currentPersona.identifier, network)
        },
        [currentPersona],
    )

    const onConnectNextID = useCallback(
        async (profile: ProfileIdentifier) => {
            if (currentPersona) {
                await Services.SocialNetwork.connectSocialNetwork(
                    currentPersona.identifier,
                    profile.network,
                    'nextID',
                    profile,
                )
            }
        },
        [currentPersona],
    )

    const { value: profilesWithNextID = initData.profiles, retry: refreshProfileList } = useAsyncRetry(
        Services.Identity.queryOwnedProfileInformationWithNextID,
        [currentPersona],
    )

    const [{ loading: confirmLoading }, onConfirmDisconnect] = useAsyncFn(
        async (unbind: UnbindStatus) => {
            // fetch signature payload
            try {
                if (!currentPersona) return
                const publicHexKey = currentPersona.publicHexKey

                if (!publicHexKey || !unbind || !unbind.identity || !unbind.platform) return
                const result = await NextIDProof.createPersonaPayload(
                    publicHexKey,
                    NextIDAction.Delete,
                    unbind.identity,
                    unbind.platform,
                )
                if (!result) return
                navigate(
                    urlcat(PopupRoutes.PersonaSignRequest, {
                        requestID: Math.random().toString().slice(3),
                        message: result.signPayload,
                        identifier: currentPersona.identifier.toText(),
                        method: MethodAfterPersonaSign.DISCONNECT_NEXT_ID,
                        profileIdentifier: unbind.identifier.toText(),
                        platform: unbind.platform,
                        identity: unbind.identity,
                        createdAt: result.createdAt,
                        uuid: result.uuid,
                    }),
                )
            } catch {
                console.log('Disconnect failed')
            }
        },
        [currentPersona?.identifier, refreshProfileList],
    )

    return (
        <PersonaHomeUI
            confirmLoading={confirmLoading}
            onConfirmDisconnect={onConfirmDisconnect}
            onConnectNextID={onConnectNextID}
            onConnectProfile={onConnectProfile}
            onDisconnectProfile={Services.Identity.detachProfile}
            profilesWithNextID={profilesWithNextID ?? EMPTY_LIST}
            openProfilePage={Services.SocialNetwork.openProfilePage}
            SOCIAL_MEDIA_ICON_MAPPING={SOCIAL_MEDIA_ICON_MAPPING}
            definedSocialNetworks={definedSocialNetworks}
            currentPersona={currentPersona}
            personas={personas}
            onDeletePersona={setDeletingPersona}
            onChangeCurrentPersona={onChangeCurrentPersona}
        />
    )
})

export default PersonaHome
