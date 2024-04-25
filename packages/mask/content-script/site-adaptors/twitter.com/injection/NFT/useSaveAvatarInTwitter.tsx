import { useSaveStringStorage } from '@masknet/plugin-avatar'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { Twitter } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useCallback } from 'react'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { useAsync } from 'react-use'

export function useSaveAvatarInTwitter(identity: IdentityResolved) {
    const { account } = useChainContext()

    const [, saveNFTAvatar] = useSaveStringStorage(NetworkPluginID.PLUGIN_EVM)

    const onSave = useCallback(async () => {
        if (!account || !identity.identifier) return

        try {
            return await saveNFTAvatar(identity.identifier.userId, account, {
                avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
            } as AvatarNextID<NetworkPluginID>)
        } catch (error) {
            return
        }
    }, [account, identity])

    const { value } = useAsync(() => {
        return onSave()
    }, [identity.avatar])

    return value
}
