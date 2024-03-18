import { useCollectionByTwitterHandle } from '@masknet/shared'
import { NetworkPluginID, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Box, type IconButtonProps } from '@mui/material'
import { CollectionProjectAvatarBadge } from './CollectionProjectAvatarBadge.js'
import { ProfileAvatarBadge } from './ProfileAvatarBadge.js'

interface Props extends IconButtonProps {
    userId: string
    identity?: SocialIdentity
    socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
}
export function AvatarBadge({ userId, identity, socialAccounts }: Props) {
    const collectionList = useCollectionByTwitterHandle(userId)
    if (collectionList?.[0]) {
        return (
            <Box display="flex" alignItems="top" justifyContent="center">
                <div style={{ display: 'flex', alignItems: 'top', justifyContent: 'center' }}>
                    <CollectionProjectAvatarBadge
                        userId={userId}
                        address={collectionList[0].address ?? ''}
                        identity={identity}
                    />
                </div>
            </Box>
        )
    }

    return socialAccounts?.filter((x) => x.pluginID === NetworkPluginID.PLUGIN_EVM).length ?
            <Box display="flex" alignItems="top" justifyContent="center">
                <div style={{ display: 'flex', alignItems: 'top', justifyContent: 'center' }}>
                    <ProfileAvatarBadge userId={userId} address={socialAccounts[0]?.address} />
                </div>
            </Box>
        :   null
}
