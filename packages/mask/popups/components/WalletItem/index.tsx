import { Trans } from '@lingui/react/macro'
import { FormattedAddress } from '@masknet/shared'
import {
    ImportSource,
    NetworkPluginID,
    PersistentStorages,
    PopupRoutes,
    PrivyEnvGuard,
    type Wallet,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useReverseAddress } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm'
import {
    Box,
    ListItem,
    Radio,
    Tooltip,
    Typography,
    listItemSecondaryActionClasses,
    type ListItemProps,
} from '@mui/material'
import { useWallets } from '@privy-io/react-auth'
import { memo, useCallback, useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { WalletBalance } from '../index.js'
import { WalletAvatar } from '../WalletAvatar/index.js'
import { Icons } from '@masknet/icons'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1),
        display: 'flex',
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
        [`& .${listItemSecondaryActionClasses.root}`]: {
            right: 0,
        },
    },
    address: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
    },
    mainLine: {
        color: theme.palette.maskColor.main,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
    },
    name: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    text: {
        marginLeft: 6,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 6,
    },
    badge: {
        fontSize: 12,
        fontWeight: 700,
        display: 'inline-block',
        padding: '2px 4px',
        boxSizing: 'border-box',
        borderRadius: 4,
        lineHeight: '16px',
        height: 20,
        backgroundColor: theme.palette.maskColor.bg,
        marginLeft: theme.spacing(1),
        color: theme.palette.maskColor.second,
    },
    balance: {
        textAlign: 'left',
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontSize: 12,
        marginLeft: theme.spacing(2),
    },
    tooltip: {
        width: 240,
    },
}))

interface WalletItemProps extends Omit<ListItemProps, 'onSelect'> {
    wallet: Wallet
    isSelected: boolean
    onSelect(wallet: Wallet): void
    hiddenTag?: boolean
}

export const WalletItem = memo<WalletItemProps>(
    PrivyEnvGuard(function WalletItem({ wallet, onSelect, isSelected, className, hiddenTag, ...rest }) {
        const { classes, cx } = useStyles()
        const navigate = useNavigate()
        const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet.address)

        const handleSelect = useCallback(() => {
            onSelect(wallet)
        }, [wallet])

        const extraName = domain && domain !== wallet.name ? ` (${formatDomainName(domain)})` : ''
        const { wallets: fireflyWallets } = useWallets()
        const isFireflyWallet = useMemo(
            () => fireflyWallets.some((w) => isSameAddress(w.address, wallet.address)),
            [fireflyWallets, wallet.address],
        )
        const fireflyAccount = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)

        const walletName = wallet.name || (isFireflyWallet ? fireflyAccount.displayName : `${wallet.name}${extraName}`)
        return (
            <ListItem
                className={cx(classes.item, className)}
                onClick={handleSelect}
                secondaryAction={<Radio sx={{ marginLeft: 0.75 }} checked={isSelected} />}
                {...rest}>
                <WalletAvatar address={wallet.address} size={24} />
                <Box className={classes.text}>
                    <Box width={180} overflow="auto">
                        <Typography className={classes.mainLine} component="div">
                            <Typography className={classes.name}>{walletName}</Typography>
                            {wallet.source === ImportSource.LocalGenerated || hiddenTag ? null : (
                                <Typography component="span" className={classes.badge}>
                                    <Trans>Imported</Trans>
                                </Typography>
                            )}
                        </Typography>
                        <Typography className={classes.address}>
                            <Tooltip title={wallet.address} placement="right" classes={{ tooltip: classes.tooltip }}>
                                <span>
                                    <FormattedAddress
                                        address={wallet.address}
                                        size={4}
                                        formatter={formatEthereumAddress}
                                    />
                                </span>
                            </Tooltip>
                            {isFireflyWallet ?
                                <Icons.QrcodeIcon
                                    size={16}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(
                                            urlcat(PopupRoutes.SyncTwitterCookies, {
                                                address: wallet.address,
                                                name: walletName,
                                            }),
                                        )
                                    }}
                                />
                            :   null}
                        </Typography>
                    </Box>
                    <WalletBalance className={classes.balance} skeletonWidth={60} account={wallet.address} />
                </Box>
            </ListItem>
        )
    }),
)
