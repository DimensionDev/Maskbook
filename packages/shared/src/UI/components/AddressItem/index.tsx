import { makeStyles } from '@masknet/theme'
import { Link, Typography, TypographyProps } from '@mui/material'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { ReversedAddress } from '../../..'
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
    },
    linkIcon: {
        color: theme.palette.maskColor.second,
        margin: '0px 2px 0 2px',
    },
}))

export interface AddressItemProps {
    identityAddress?: SocialAddress<NetworkPluginID>
    reverse?: boolean
    TypographyProps?: TypographyProps
    iconProps?: string
}

export function AddressItem({
    identityAddress,
    reverse = true,
    TypographyProps = { fontSize: '14px', fontWeight: 700 },
    iconProps,
}: AddressItemProps) {
    const { classes } = useStyles()
    const { Others } = useWeb3State(identityAddress?.networkSupporterPluginID)

    if (!identityAddress) return null

    return (
        <>
            <Typography>
                {reverse ? (
                    <ReversedAddress
                        TypographyProps={TypographyProps}
                        address={identityAddress.address}
                        pluginId={identityAddress.networkSupporterPluginID}
                    />
                ) : (
                    <Typography {...TypographyProps}>{identityAddress.label}</Typography>
                )}
            </Typography>
            <Link
                className={classes.link}
                href={Others?.explorerResolver.addressLink(Others?.getDefaultChainId(), identityAddress.address)}
                target="_blank"
                rel="noopener noreferrer">
                <Icons.LinkOut size={20} className={iconProps} />
            </Link>
        </>
    )
}
