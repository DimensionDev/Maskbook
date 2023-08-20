import { memo, type ReactNode } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { NextIDPlatform, formatPersonaName } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { url } from '../../ContactCard/Account/index.js'
import type { SupportedPlatforms } from '../../ContactCard/Account/index.js'

interface AccountProps {
    userId?: string
    platform: SupportedPlatforms
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
    },
}))

const IconMap: Record<SupportedPlatforms, ReactNode> = {
    [NextIDPlatform.LENS]: <Icons.Lens size={40} />,
    [NextIDPlatform.Ethereum]: <Icons.ETH size={40} />,
    [NextIDPlatform.ENS]: <Icons.ENS size={40} />,
    [NextIDPlatform.GitHub]: <Icons.GitHub size={40} />,
    [NextIDPlatform.Farcaster]: <Icons.Farcaster size={40} />,
    [NextIDPlatform.SpaceId]: <Icons.SpaceId size={40} />,
    [NextIDPlatform.Unstoppable]: <Icons.Unstoppable size={40} />,
    [NextIDPlatform.Keybase]: <Icons.Keybase size={40} />,
}

export const Account = memo<AccountProps>(function Account({ userId, platform }) {
    const { classes } = useStyles()
    if (!userId) return null
    const icon = IconMap[platform]
    return (
        <Box
            padding="12px"
            display="flex"
            flexDirection="column"
            gap="10px"
            alignItems="center"
            className={classes.container}>
            {icon}
            <Box className={classes.userId}>
                {platform === NextIDPlatform.Ethereum ? formatEthereumAddress(userId, 4) : formatPersonaName(userId)}
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={url[platform] + userId}
                    className={classes.iconBlack}>
                    <Icons.LinkOut size={16} />
                </Link>
            </Box>
        </Box>
    )
})
