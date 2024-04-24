import { pickBy } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import { InMemoryStorages } from '@masknet/shared-base'
import { useSaveStringStorage } from '@masknet/plugin-avatar'
import { MaskMessages, NetworkPluginID, type NFTAvatarEvent } from '@masknet/shared-base'
import { getAvatarId } from '../../utils/user.js'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { useAsync } from 'react-use'
import type { AvatarNextID } from '@masknet/web3-providers/types'

const clearStorages = () => {
    InMemoryStorages.FacebookNFTEventOnMobile.storage.userId.setValue('')
    InMemoryStorages.FacebookNFTEventOnMobile.storage.address.setValue('')
    InMemoryStorages.FacebookNFTEventOnMobile.storage.tokenId.setValue('')
}

export function useSaveAvatarInFacebook(identity: IdentityResolved) {
    const { account } = useChainContext()

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent | null>(null)
    const [, saveNFTAvatar] = useSaveStringStorage(NetworkPluginID.PLUGIN_EVM)

    const onSave = useCallback(async () => {
        if (!account || !identity.identifier) return
        const storages = InMemoryStorages.FacebookNFTEventOnMobile.storage

        if (NFTEvent?.address && NFTEvent?.tokenId && NFTEvent?.avatarId) {
            try {
                const savedAvatar = await saveNFTAvatar(identity.identifier.userId, account, {
                    ...NFTEvent,
                    avatarId: getAvatarId(identity.avatar ?? ''),
                } as AvatarNextID<NetworkPluginID>)

                setNFTEvent(null)
                if (savedAvatar) return savedAvatar
                return
            } catch (error) {
                setNFTEvent(null)
                return
            }
        } else if (storages.address.value && storages.userId.value && storages.tokenId.value) {
            try {
                const avatarMetadata = {
                    nickname: '',
                    imageUrl: '',
                    userId: storages.userId.value,
                    tokenId: storages.tokenId.value,
                    address: storages.address.value,
                    avatarId: getAvatarId(identity.avatar ?? ''),
                    chainId: storages.chainId.value,
                    pluginID: storages.pluginID.value,
                    schema: storages.schema.value,
                } as AvatarNextID<NetworkPluginID>
                const savedAvatar = await saveNFTAvatar(storages.userId.value, account, avatarMetadata)
                clearStorages()
                if (savedAvatar) return avatarMetadata
                return
            } catch (error) {
                clearStorages()
                return
            }
        }
        return
    }, [NFTEvent])

    useEffect(() => {
        return MaskMessages.events.NFTAvatarUpdated.on((data) =>
            setNFTEvent((prev) => {
                if (!prev) return data
                return { ...prev, ...pickBy<NFTAvatarEvent>(data, (item) => !!item) }
            }),
        )
    }, [])

    const { value } = useAsync(() => {
        return onSave()
    }, [identity.avatar])

    return value
}
