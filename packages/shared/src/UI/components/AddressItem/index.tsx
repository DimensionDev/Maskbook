import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Link, TypographyProps } from '@mui/material'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { SocialAccount } from '@masknet/web3-shared-base'
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
    socialAccount?: SocialAccount
    TypographyProps?: TypographyProps
    linkIconClassName?: string
    disableLinkIcon?: boolean
}

export function AddressItem({
    socialAccount,
    TypographyProps = { fontSize: '14px', fontWeight: 700 },
    linkIconClassName,
    disableLinkIcon,
}: AddressItemProps) {
    const { classes } = useStyles()
    const { Others } = useWeb3State(socialAccount?.pluginID)

    if (!socialAccount) return null

    return (
        <>
            <ReversedAddress
                TypographyProps={TypographyProps}
                address={socialAccount.address}
                pluginID={socialAccount.pluginID}
            />
            {disableLinkIcon ? null : (
                <Link
                    className={classes.link}
                    href={Others?.explorerResolver.addressLink(Others?.getDefaultChainId(), socialAccount.address)}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Icons.LinkOut size={20} className={linkIconClassName} />
                </Link>
            )}
        </>
    )
}
