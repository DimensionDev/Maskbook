import { NetworkPluginID, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Box, type IconButtonProps } from '@mui/material'
import { ProfileAvatarBadge } from './ProfileAvatarBadge.js'

interface Props extends IconButtonProps {
    userId: string
    identity?: SocialIdentity
    socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
}
export function AvatarBadge({ userId, socialAccounts }: Props) {
    return socialAccounts?.filter((x) => x.pluginID === NetworkPluginID.PLUGIN_EVM).length ?
            <Box display="flex" alignItems="top" justifyContent="center">
                <div style={{ display: 'flex', alignItems: 'top', justifyContent: 'center' }}>
                    <ProfileAvatarBadge userId={userId} address={socialAccounts[0]?.address} />
                </div>
            </Box>
        :   null
}
