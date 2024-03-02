import { useSaveStringStorage } from '@masknet/plugin-avatar'
import { Box, Typography } from '@mui/material'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { Twitter, EVMHub } from '@masknet/web3-providers'
import { MaskMessages, NetworkPluginID, type NFTAvatarEvent } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { pickBy } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { AssetPreviewer, ConfirmModal } from '@masknet/shared'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { useMaskSharedTrans } from '../../../../../shared-ui/index.js'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'
import { useAsync } from 'react-use'

export function useSaveAvatarInTwitter(identity: IdentityResolved) {
    const t = useMaskSharedTrans()
    const { account } = useChainContext()

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent | null>(null)
    const [, saveNFTAvatar] = useSaveStringStorage(NetworkPluginID.PLUGIN_EVM)

    const onSave = useCallback(async () => {
        if (!account || !identity.identifier) return

        if (!NFTEvent?.address || !NFTEvent?.tokenId) {
            MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll({
                userId: identity.identifier.userId,
                avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
                schema: SchemaType.ERC721,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
            })
            return
        }

        const avatar = await saveNFTAvatar(identity.identifier.userId, account, {
            ...NFTEvent,
            avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
        } as AvatarNextID<NetworkPluginID>).catch((error) => {
            setNFTEvent(null)
            return
        })

        if (!avatar) {
            setNFTEvent(null)
            return
        }

        const NFTDetailed = await EVMHub.getNonFungibleAsset(avatar.address ?? '', avatar.tokenId, {
            chainId: ChainId.Mainnet,
        })

        const confirmed = await ConfirmModal.openAndWaitForClose({
            title: t.plugin_avatar_setup_share_title(),
            content: (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <AssetPreviewer url={NFTDetailed?.metadata?.imageURL || NFTDetailed?.metadata?.mediaURL} />
                    <Typography mt={3} fontSize="18px">
                        {t.plugin_avatar_setup_success()}
                    </Typography>
                </Box>
            ),
            confirmLabel: t.share(),
        })
        if (confirmed) activatedSiteAdaptorUI!.utils.share?.(t.plugin_avatar_setup_pfp_share())

        MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll(
            (avatar ?? {
                userId: identity.identifier.userId,
                avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
                schema: SchemaType.ERC721,
                pluginId: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
            }) as NFTAvatarEvent,
        )

        setNFTEvent(null)
    }, [])

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
