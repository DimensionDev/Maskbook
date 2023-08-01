import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { type NextIDPlatform, formatPersonaName } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

interface AccountProps {
    icon: NextIDPlatform
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
const url = {
    twitter: 'https://twitter.com/',
    ens: 'https://app.ens.domains/name/',
    unstoppabledomains: 'https://ud.me/',
    github: 'https://github.com/',
    space_id: 'https://space.storage/',
    farcaster: 'https://www.farcaster.xyz/',
    lens: 'https://lenster.xyz/',
    ethereum: 'https://etherscan.io/address/',
}

export const Account = memo<AccountProps>(({ userId, icon }) => {
    const { classes } = useStyles()
    return (
        <Box width="156px" padding="4px" display="flex" gap="10px" alignItems="center">
            {(() => {
                switch (icon) {
                    case 'lens':
                        return <Icons.Lens width={30} height={30} />
                    case 'ethereum':
                        return <Icons.ETH width={30} height={30} />
                    case 'ens':
                        return <Icons.ENS width={30} height={30} />
                    case 'github':
                        return <Icons.GitHub width={30} height={30} />
                    case 'farcaster':
                        return <Icons.Farcaster width={30} height={30} />
                    case 'space_id':
                        return <Icons.SpaceId width={30} height={30} />
                    case 'unstoppabledomains':
                        return <Icons.Unstoppable width={30} height={30} />
                    default:
                        return null
                }
            })()}
            <Box className={classes.userId}>
                {icon === 'ethereum' ? formatEthereumAddress(userId, 4) : formatPersonaName(userId)}
                <Link
                    underline="none"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={url[icon as keyof typeof url] + userId}
                    className={classes.iconBlack}>
                    <Icons.LinkOut size={16} />
                </Link>
            </Box>
        </Box>
    )
})
