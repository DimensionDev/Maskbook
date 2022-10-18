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
    const { Others } = useWeb3State(socialAddress?.pluginID)

    if (!socialAddress) return null

    const reversible = isReversible(socialAddress.type)

    return (
        <>
            {reversible ? (
                <ReversedAddress
                    TypographyProps={TypographyProps}
                    address={socialAddress.address}
                    pluginId={socialAddress.pluginID}
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
