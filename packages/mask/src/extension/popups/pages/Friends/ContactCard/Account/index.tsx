import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { NextIDPlatform, formatPersonaName } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { safeUnreachable } from '@masknet/kit'

export type SupportedPlatforms =
    | NextIDPlatform.Ethereum
    | NextIDPlatform.GitHub
    | NextIDPlatform.ENS
    | NextIDPlatform.LENS
    | NextIDPlatform.SpaceId
    | NextIDPlatform.Farcaster
    | NextIDPlatform.Unstoppable
interface AccountProps {
    icon: SupportedPlatforms
    userId: string
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
export const url: Record<SupportedPlatforms, string> = {
    [NextIDPlatform.ENS]: 'https://app.ens.domains/name/',
    [NextIDPlatform.Unstoppable]: 'https://ud.me/',
    [NextIDPlatform.GitHub]: 'https://github.com/',
    [NextIDPlatform.SpaceId]: 'https://space.storage/',
    [NextIDPlatform.Farcaster]: 'https://www.farcaster.xyz/',
    [NextIDPlatform.LENS]: 'https://lenster.xyz/',
    [NextIDPlatform.Ethereum]: 'https://etherscan.io/address/',
}

export const Account = memo<AccountProps>(function Account({ userId, icon }) {
    const { classes } = useStyles()
    return (
        <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
            {(() => {
                switch (icon) {
                    case NextIDPlatform.LENS:
                        return <Icons.Lens width={30} height={30} />
                    case NextIDPlatform.Ethereum:
                        return <Icons.ETH width={30} height={30} />
                    case NextIDPlatform.ENS:
                        return <Icons.ENS width={30} height={30} />
                    case NextIDPlatform.GitHub:
                        return <Icons.GitHub width={30} height={30} />
                    case NextIDPlatform.Farcaster:
                        return <Icons.Farcaster width={30} height={30} />
                    case NextIDPlatform.SpaceId:
                        return <Icons.SpaceId width={30} height={30} />
                    case NextIDPlatform.Unstoppable:
                        return <Icons.Unstoppable width={30} height={30} />
                    default:
                        safeUnreachable(icon)
                        return null
                }
            })()}
            <Box className={classes.userId}>
                {icon === NextIDPlatform.Ethereum ? formatEthereumAddress(userId, 4) : formatPersonaName(userId)}
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
})
