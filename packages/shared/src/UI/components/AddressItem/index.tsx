import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Link, TypographyProps } from '@mui/material'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { SocialAddress } from '@masknet/web3-shared-base'
import { ReversedAddress } from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    link: {
        cursor: 'pointer',
        zIndex: 1,
        '&:hover': {
            textDecoration: 'none',
        },
        lineHeight: 0,
    },
}))

export interface AddressItemProps {
    socialAddress?: Omit<SocialAddress<NetworkPluginID>, 'type'>
    TypographyProps?: TypographyProps
    linkIconClassName?: string
    disableLinkIcon?: boolean
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
            <ReversedAddress
                TypographyProps={TypographyProps}
                address={socialAddress.address}
                pluginID={socialAddress.pluginID}
            />
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
