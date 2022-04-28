import { useNetworkDescriptor, useProviderDescriptor, useWeb3State } from '@masknet/plugin-infra/web3'
import { ReversedAddress, WalletIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress, useAccount, useChainIdValid, useWallet } from '@masknet/web3-shared-evm'
import { Box, CircularProgress, Link, Typography } from '@mui/material'
import { useState } from 'react'
import { DownIcon } from '../../assets/Down'
import { LinkIcon } from '../../assets/Link'
import { LockWalletIcon } from '../../assets/Lock'
import { MaskFilledIcon } from '../../assets/MaskFilled'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    address: {
        display: 'flex',
        alignItems: 'center',
    },
    domain: {
        marginLeft: theme.spacing(1),
    },
    link: {
        lineHeight: 0,
    },
    linkIcon: {
        width: 14,
        height: 14,
    },
    name: {
        display: 'flex',
    },
    pending: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 177, 0, 0.1)',
    },
    icon: {
        filter: 'drop-shadow(0px 6px 12px rgba(28, 104, 243, 0.2))',
    },
}))

interface WalletUIProps {
    iconSize?: number
    badgeSize?: number
    onClick?: () => void
}

export function WalletUI(props: WalletUIProps) {
    const { iconSize = 24, badgeSize = 10, onClick } = props
    const { classes } = useStyles()
    const { Utils } = useWeb3State()
    const account = useAccount()
    const selectedWallet = useWallet()
    const chainIdValid = useChainIdValid()
    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()
    const [pending, setPending] = useState(false)
    const [lock, setLock] = useState(false)

    const isWalletValid = !!account || selectedWallet || chainIdValid
    return (
        <Box className={classes.root} onClick={onClick}>
            {isWalletValid ? (
                <WalletIcon
                    classes={{ root: classes.icon }}
                    size={iconSize}
                    badgeSize={badgeSize}
                    networkIcon={providerDescriptor?.icon}
                    providerIcon={networkDescriptor?.icon}
                    isBorderColorNotDefault
                />
            ) : (
                <MaskFilledIcon size={iconSize} />
            )}
            <Box className={classes.domain}>
                <Box className={classes.name}>
                    <Typography variant="body1" color="textPrimary" fontSize={14} fontWeight={700}>
                        <ReversedAddress address={account} />
                    </Typography>
                    <DownIcon />
                </Box>
                <Box className={classes.address}>
                    <Typography variant="body2" color="textSecondary" fontSize={14}>
                        {formatEthereumAddress(account, 4)}
                    </Typography>
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(1, account) ?? ''}
                        target="_blank"
                        title="View on Explorer"
                        rel="noopener noreferrer">
                        <LinkIcon className={classes.linkIcon} />
                    </Link>
                    {lock ? <LockWalletIcon className={classes.linkIcon} /> : null}
                    {pending ? (
                        <Box className={classes.pending}>
                            <Typography variant="body1" color="#FFB100">
                                Pending
                            </Typography>
                            <CircularProgress size={14} color="error" sx={{ color: '#FFB100' }} />
                        </Box>
                    ) : null}
                </Box>
            </Box>
        </Box>
    )
}
