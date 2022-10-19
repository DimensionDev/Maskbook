import { makeStyles } from '@masknet/theme'
import { Link, Typography, TypographyProps } from '@mui/material'
import type { NetworkPluginID } from '@masknet/shared-base'
import { SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { ReversedAddress } from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    link: {
        cursor: 'pointer',
        marginTop: 2,
        zIndex: 1,
        '&:hover': {
            textDecoration: 'none',
        },
        lineHeight: 0,
    },
}))

export interface AddressItemProps {
    socialAddress?: SocialAddress<NetworkPluginID>
    TypographyProps?: TypographyProps
    linkIconClassName?: string
    disableLinkIcon?: boolean
}

const isReversible = (type?: SocialAddressType) => {
    if (!type) return false
    return [
        SocialAddressType.KV,
        SocialAddressType.Address,
        SocialAddressType.NEXT_ID,
        SocialAddressType.TwitterBlue,
        SocialAddressType.CyberConnect,
        SocialAddressType.Leaderboard,
        SocialAddressType.Sybil,
    ].includes(type)
}

export function AddressItem({
    socialAddress,
    TypographyProps = { fontSize: '14px', fontWeight: 700 },
    linkIconClassName,
    disableLinkIcon,
}: AddressItemProps) {
    const { classes } = useStyles()
    const { Others } = useWeb3State(socialAddress?.pluginID)

    if (!socialAddress) return null

    return (
        <>
            {isReversible(socialAddress.type) ? (
                <ReversedAddress
                    TypographyProps={TypographyProps}
                    address={socialAddress.address}
                    pluginID={socialAddress.pluginID}
                />
            ) : (
                <Typography {...TypographyProps}>{Others?.formatAddress(socialAddress.address, 4)}</Typography>
            )}
            {disableLinkIcon ? null : (
                <Link
                    className={classes.link}
                    href={Others?.explorerResolver.addressLink(Others?.getDefaultChainId(), socialAddress.address)}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Icons.LinkOut size={20} className={linkIconClassName} />
                </Link>
            )}
        </>
    )
}
