import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { NextIDPlatform, formatPersonaName } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { safeUnreachable } from '@masknet/kit'
import { url } from '../../ContactCard/Account/index.js'
import type { SupportedPlatforms } from '../../ContactCard/Account/index.js'

interface AccountProps {
    userId?: string
    icon: SupportedPlatforms
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

export const Account = memo<AccountProps>(function Account({ userId, icon }) {
    const { classes } = useStyles()
    return (
        userId && (
            <Box
                padding="12px"
                display="flex"
                flexDirection="column"
                gap="10px"
                alignItems="center"
                className={classes.container}>
                {(() => {
                    switch (icon) {
                        case NextIDPlatform.LENS:
                            return <Icons.Lens width={40} height={40} />
                        case NextIDPlatform.Ethereum:
                            return <Icons.ETH width={40} height={40} />
                        case NextIDPlatform.ENS:
                            return <Icons.ENS width={40} height={40} />
                        case NextIDPlatform.GitHub:
                            return <Icons.GitHub width={40} height={40} />
                        case NextIDPlatform.Farcaster:
                            return <Icons.Farcaster width={40} height={40} />
                        case NextIDPlatform.SpaceId:
                            return <Icons.SpaceId width={40} height={40} />
                        case NextIDPlatform.Unstoppable:
                            return <Icons.Unstoppable width={40} height={40} />
                        case NextIDPlatform.Keybase:
                            return <Icons.Keybase width={40} height={40} />
                        default:
                            safeUnreachable(icon)
                            return null
                    }
                })()}
                <Box className={classes.userId}>
                    {icon === 'ethereum' ? formatEthereumAddress(userId, 4) : formatPersonaName(userId)}
                    <Link
                        underline="none"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={url[icon] + userId}
                        className={classes.iconBlack}>
                        <Icons.LinkOut size={16} />
                    </Link>
                </Box>
            </Box>
        )
    )
})
