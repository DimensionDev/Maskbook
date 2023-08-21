import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { NextIDPlatform } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { formatUserId } from '../SocialAccount/index.js'
import { PlatformIconMap, PlatformUrlMap, type SupportedPlatforms } from '../../common.js'

interface AccountProps {
    platform: SupportedPlatforms
    userId?: string
}

const useStyles = makeStyles()((theme) => ({
    iconBlack: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
    userId: {
        display: 'flex',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '18px',
    },
}))

export const Account = memo<AccountProps>(function Account({ userId, platform }) {
    const { classes } = useStyles()
    const Icon = PlatformIconMap[platform]

    if (!userId) return null

    return (
        <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
            <Icon size={30} />
            <Box className={classes.userId}>
                {platform === NextIDPlatform.Ethereum ? formatEthereumAddress(userId, 4) : formatUserId(userId)}
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={PlatformUrlMap[platform] + userId}
                    className={classes.iconBlack}>
                    <Icons.LinkOut size={16} />
                </Link>
            </Box>
        </Box>
    )
})
