import { memo } from 'react'
import { Box, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { formatPersonaName } from '@masknet/shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

interface AccountProps {
    userId: string
    icon: string
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
        <Box
            padding="12px"
            display="flex"
            flexDirection="column"
            gap="10px"
            alignItems="center"
            className={classes.container}>
            {(() => {
                switch (icon) {
                    case 'lens':
                        return <Icons.Lens width={40} height={40} />
                    case 'ethereum':
                        return <Icons.ETH width={40} height={40} />
                    case 'ens':
                        return <Icons.ENS width={40} height={40} />
                    case 'github':
                        return <Icons.GitHub width={40} height={40} />
                    case 'farcaster':
                        return <Icons.Farcaster width={40} height={40} />
                    case 'space_id':
                        return <Icons.SpaceId width={40} height={40} />
                    case 'unstoppabledomains':
                        return <Icons.Unstoppable width={40} height={40} />
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
