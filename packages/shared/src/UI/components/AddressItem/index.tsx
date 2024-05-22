import { first } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Box, Link, Typography, type TypographyProps } from '@mui/material'
import { SocialAddressType, type SocialAccount } from '@masknet/shared-base'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatDomainName, isEnsSubdomain } from '@masknet/web3-shared-evm'
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

interface OverrideTypographyProps extends Omit<TypographyProps, 'component'> {
    component?: string
}

export interface AddressItemProps {
    socialAccount?: SocialAccount<Web3Helper.ChainIdAll>
    TypographyProps?: OverrideTypographyProps
    linkIconClassName?: string
    disableLinkIcon?: boolean
    onClick?: (ev: React.MouseEvent) => void
    isMenu?: boolean
}

const defaultTypography = { fontSize: '14px', fontWeight: 700 }
export function AddressItem({
    socialAccount,
    TypographyProps = defaultTypography,
    linkIconClassName,
    disableLinkIcon,
    onClick,
    isMenu = false,
}: AddressItemProps) {
    const { classes } = useStyles()
    const Utils = useWeb3Utils(socialAccount?.pluginID)

    if (!socialAccount) return null

    const preferAddress =
        !socialAccount.label ||
        isEnsSubdomain(socialAccount.label) ||
        socialAccount.supportedAddressTypes?.includes(SocialAddressType.Firefly) || // Label from Firefly is not reliable
        isSameAddress(socialAccount.label, socialAccount.address)

    const formattedDomain = formatDomainName(socialAccount.label)

    return (
        <>
            <Box onClick={(ev: React.MouseEvent) => onClick?.(ev)}>
                {preferAddress ?
                    <ReversedAddress
                        {...TypographyProps}
                        address={socialAccount.address}
                        pluginID={socialAccount.pluginID}
                    />
                :   <ShadowRootTooltip title={formattedDomain === socialAccount.label ? '' : socialAccount.label}>
                        <Typography fontSize="14px" fontWeight={700} {...TypographyProps}>
                            {formattedDomain}
                        </Typography>
                    </ShadowRootTooltip>
                }
            </Box>
            {disableLinkIcon ? null : (
                <Link
                    className={classes.link}
                    href={Utils.explorerResolver.addressLink(
                        first(socialAccount.supportedChainIds) ?? Utils.getDefaultChainId(),
                        socialAccount.address,
                    )}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Icons.LinkOut size={20} className={linkIconClassName} />
                </Link>
            )}
            {isMenu ?
                <Icons.ArrowDrop className={classes.arrowDropIcon} onClick={onClick} />
            :   null}
        </>
    )
}
