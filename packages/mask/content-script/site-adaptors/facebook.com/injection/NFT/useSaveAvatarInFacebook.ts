import { pickBy } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useSaveStringStorage } from '@masknet/plugin-avatar'
import { MaskMessages, NetworkPluginID, type NFTAvatarEvent } from '@masknet/shared-base'
import { getAvatarId } from '../../utils/user.js'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { useAsync } from 'react-use'
import type { AvatarNextID } from '@masknet/web3-providers/types'

export function useSaveAvatarInFacebook(identity: IdentityResolved) {
    const { account } = useChainContext()

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent | null>(null)
    const saveNFTAvatar = useSaveStringStorage(NetworkPluginID.PLUGIN_EVM)

    const onSave = useCallback(async () => {
        if (!account || !identity.identifier) return

        const isNFTEventValid = NFTEvent?.address && NFTEvent?.tokenId && NFTEvent?.avatarId
        if (!isNFTEventValid) return

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
    }, [account, NFTEvent, identity])

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
