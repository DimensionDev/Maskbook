import { first } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Link, Typography, type TypographyProps } from '@mui/material'
import { SocialAddressType, type SocialAccount } from '@masknet/shared-base'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isEnsSubdomain } from '@masknet/web3-shared-evm'
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
    onClick?: (ev: React.MouseEvent) => void
    isMenu?: boolean
}

export function AddressItem({
    socialAccount,
    TypographyProps = { fontSize: '14px', fontWeight: 700 },
    linkIconClassName,
    disableLinkIcon,
    onClick,
    isMenu = false,
}: AddressItemProps) {
    const { classes } = useStyles()
    const Others = useWeb3Others(socialAccount?.pluginID)

    if (!socialAccount) return null

    const preferAddress =
        !socialAccount.label ||
        isEnsSubdomain(socialAccount.label) ||
        socialAccount.supportedAddressTypes?.includes(SocialAddressType.Firefly) || // Label from Firefly is not reliable
        isSameAddress(socialAccount.label, socialAccount.address)

    return (
        <>
            <Box onClick={(ev: React.MouseEvent) => onClick?.(ev)}>
                {preferAddress ? (
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
                    href={Others.explorerResolver.addressLink(
                        first(socialAccount.supportedChainIds) ?? Others.getDefaultChainId(),
                        socialAccount.address,
                    )}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Icons.LinkOut size={20} className={linkIconClassName} />
                </Link>
            )}
            {isMenu ? <Icons.ArrowDrop className={classes.arrowDropIcon} onClick={onClick} /> : null}
        </>
    )
}
