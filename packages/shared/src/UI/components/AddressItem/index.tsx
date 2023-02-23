import { first } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Link, Typography, TypographyProps } from '@mui/material'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { SocialAccount } from '@masknet/web3-shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
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
    arrowDropIcon: {
        color: theme.palette.maskColor.dark,
    },
}))

export interface AddressItemProps {
    socialAccount?: SocialAccount<Web3Helper.ChainIdAll>
    TypographyProps?: TypographyProps
    linkIconClassName?: string
    disableLinkIcon?: boolean
    onClick?: (event: any) => void
}

export function AddressItem({
    socialAccount,
    TypographyProps = { fontSize: '14px', fontWeight: 700 },
    linkIconClassName,
    disableLinkIcon,
    onClick,
}: AddressItemProps) {
    const { classes } = useStyles()
    const { Others } = useWeb3State(socialAccount?.pluginID)

    if (!socialAccount) return null

    return (
        <>
            <Box onClick={(event) => onClick?.(event)}>
                {!socialAccount.label || isSameAddress(socialAccount.label, socialAccount.address) ? (
                    <ReversedAddress
                        {...TypographyProps}
                        address={socialAccount.address}
                        pluginID={socialAccount.pluginID}
                    />
                ) : (
                    <Typography fontSize="14px" fontWeight={700} {...TypographyProps}>
                        {socialAccount.label}
                    </Typography>
                )}
            </Box>
            {disableLinkIcon ? null : (
                <Link
                    className={classes.link}
                    href={Others?.explorerResolver.addressLink(
                        first(socialAccount.supportedChainIds) ?? Others?.getDefaultChainId(),
                        socialAccount.address,
                    )}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Icons.LinkOut size={20} className={linkIconClassName} />
                </Link>
            )}
            <Icons.ArrowDrop className={classes.arrowDropIcon} onClick={(event) => onClick?.(event)} />
        </>
    )
}
