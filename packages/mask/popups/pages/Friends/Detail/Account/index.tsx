import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles, TextOverflowTooltip } from '@masknet/theme'
import { NextIDPlatform, formatPersonaName } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { PlatformIconMap, PlatformUrlMap, type SupportedPlatforms } from '../../common.js'

interface AccountProps {
    platform: SupportedPlatforms
    userId?: string
    displayName?: string
}

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '119px',
        height: '86px',
        borderRadius: '8px',
        ':hover': {
            boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        },
    },
    iconBlack: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
    },
    userId: {
        display: 'flex',
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: 700,
        lineHeight: '16px',
        minWidth: 0,
    },
    name: {
        flexGrow: 1,
        minWidth: 0,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

export const Account = memo<AccountProps>(function Account({ userId, displayName, platform }) {
    const { classes } = useStyles()
    if (!userId) return null
    const Icon = PlatformIconMap[platform]
    const name =
        platform === NextIDPlatform.Ethereum ? formatEthereumAddress(userId, 4)
        : platform === NextIDPlatform.Farcaster && displayName ? displayName
        : formatPersonaName(userId)
    return (
        <Box
            padding="12px"
            display="flex"
            flexDirection="column"
            gap="10px"
            alignItems="center"
            className={classes.container}>
            <Icon size={40} />
            <Box className={classes.userId}>
                <TextOverflowTooltip title={name}>
                    <span className={classes.name}>{name}</span>
                </TextOverflowTooltip>
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
