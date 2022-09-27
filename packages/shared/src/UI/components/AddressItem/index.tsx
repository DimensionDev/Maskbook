import { makeStyles } from '@masknet/theme'
import { Link, Typography, TypographyProps } from '@mui/material'
import { NetworkPluginID, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { ReversedAddress } from '../../../index.js'
import { Icons } from '@masknet/icons'
import { useWeb3State } from '@masknet/plugin-infra/web3'

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
    linkIcon: {
        color: theme.palette.maskColor.second,
        margin: '0px 2px 0 2px',
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
    const reversible = [SocialAddressType.KV, SocialAddressType.ADDRESS, SocialAddressType.NEXT_ID].includes(type)
    return reversible
}

export function AddressItem({
    socialAddress,
    TypographyProps = { fontSize: '14px', fontWeight: 700 },
    linkIconClassName,
    disableLinkIcon,
}: AddressItemProps) {
    const { classes } = useStyles()
    const { Others } = useWeb3State(socialAddress?.networkSupporterPluginID)

    if (!socialAddress) return null

    const reversible = isReversible(socialAddress.type)

    return (
        <>
            {reversible ? (
                <ReversedAddress
                    TypographyProps={TypographyProps}
                    address={socialAddress.address}
                    pluginId={socialAddress.networkSupporterPluginID}
                />
            ) : (
                <Typography {...TypographyProps}>{socialAddress.label}</Typography>
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
