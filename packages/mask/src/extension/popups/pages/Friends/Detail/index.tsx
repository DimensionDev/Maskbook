import { ECKeyIdentifier } from '@masknet/shared-base'
import { memo, useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCurrentPersona } from '../../../../../components/DataSource/useCurrentPersona.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import Services from '../../../../service.js'
import { FriendsDetailUI } from './UI.js'
import { useQueryClient, useMutation, type InfiniteData } from '@tanstack/react-query'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { type Friend } from '../../../hook/useFriends.js'

export const FriendsDetail = memo(function FriendsDetail() {
    const location = useLocation()
    const { t } = useI18N()
    const { showSnackbar } = usePopupCustomSnackbar()
    const { avatar, profiles, nextId, publicKey, isLocal } = location.state
    const [deleted, setDeleted] = useState(false)
    const currentPersona = useCurrentPersona()
    const rawPublicKey = currentPersona?.identifier.rawPublicKey
    const queryClient = useQueryClient()

    const handleDelete = useCallback(async () => {
        const personaIdentifier = ECKeyIdentifier.fromHexPublicKeyK256(nextId).expect(
            `${nextId} should be a valid hex public key in k256`,
        )
        if (currentPersona) await Services.Identity.deletePersonaRelation(personaIdentifier, currentPersona?.identifier)
        await Services.Identity.deletePersona(personaIdentifier, 'safe delete')
    }, [nextId, queryClient, currentPersona])

    const { mutate: onDelete, isLoading } = useMutation({
        mutationFn: handleDelete,
        onMutate: async () => {
            await queryClient.cancelQueries(['relation-records', rawPublicKey])
            await queryClient.cancelQueries(['friends', rawPublicKey])
            queryClient.setQueryData(
                ['friends', rawPublicKey],
                (
                    oldData:
                        | InfiniteData<{
                              friends: Friend[]
                              nextPageOffset: number
                          }>
                        | undefined,
                ) => {
                    if (!oldData) return undefined
                    return {
                        ...oldData,

                        pages: oldData.pages.map((page) => {
                            return {
                                friends: page.friends.filter((friend) => friend.persona.publicKeyAsHex !== nextId),
                                nextPageOffset: page.nextPageOffset,
                            }
                        }),
                    }
                },
            )
            showSnackbar(t('popups_encrypted_friends_deleted_successfully'), { variant: 'success' })
            setDeleted(true)
        },
        onSettled: () => {
            queryClient.invalidateQueries(['relation-records', rawPublicKey])
            queryClient.invalidateQueries(['friends', rawPublicKey])
        },
    })

    return (
        <FriendsDetailUI
            avatar={avatar}
            profiles={profiles}
            nextId={nextId}
            publicKey={publicKey}
            isLocal={isLocal ? !deleted : false}
            onDelete={onDelete}
            deleting={isLoading}
        />
    )
})
