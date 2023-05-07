import { Icons } from '@masknet/icons'
import { useReverseAddress, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { FormattedAddress, useSnackbarCallback } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Link, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    currentAccount: {
        padding: theme.spacing(1.5),
        display: 'flex',
        border: `1px solid ${theme.palette.background.default}`,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accountInfo: {
        fontSize: 16,
        flexGrow: 1,
        marginLeft: theme.spacing(1),
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
    },
    accountName: {
        fontWeight: 700,
        marginRight: 6,
    },
    address: {
        fontSize: 10,
        marginRight: theme.spacing(1),
        color: theme.palette.text.secondary,
        display: 'inline-block',
    },
    link: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(0.5),
    },
    actionBtn: {
        fontSize: 14,
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    defaultBadge: {
        padding: '2px 4px',
        borderRadius: 4,
        fontSize: 12,
        backgroundColor: 'rgba(28, 104, 243, 0.1)',
        color: '#1C68F3',
        fontWeight: 700,
        marginLeft: 4,
    },
    disabled: {
        cursor: 'default',
        color: theme.palette.maskColor.third,
    },
}))

interface WalletItemProps {
    address: string
    isDefault?: boolean
    deletable?: boolean
    onDelete?: () => void
    fallbackName?: string
    onSetDefault?: (address: string) => void
}

export function WalletItem({ address, isDefault, deletable, fallbackName, onSetDefault, onDelete }: WalletItemProps) {
    const { classes, cx } = useStyles()
    const t = useI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, address)
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(formatEthereumAddress(address))
        },
        [],
        undefined,
        undefined,
        undefined,
        t.tip_copy_success_of_wallet_addr(),
    )
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)

    const formattedName = domain ? Others?.formatDomainName(domain) : null
    const walletName = useMemo(() => {
        if (formattedName) return formattedName
        const currentWallet = wallets.find((x) => isSameAddress(x.address, address))
        const name = currentWallet?.name
        return name !== undefined && currentWallet?.hasStoredKeyInfo ? name : fallbackName
    }, [address, formattedName, fallbackName])

    const action = deletable ? (
        <Icons.Trash onClick={onDelete} size={24} className={classes.actionBtn} />
    ) : (
        <Typography
            className={cx(classes.actionBtn, isDefault ? classes.disabled : undefined)}
            onClick={() => {
                if (isDefault) return
                onSetDefault?.(address)
            }}>
            {t.tip_set_as_default()}
        </Typography>
    )

    return (
        <div className={classes.currentAccount}>
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    <Typography className={classes.accountName}>{walletName}</Typography>
                    {isDefault ? <Typography className={classes.defaultBadge}>{t.default()}</Typography> : null}
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={address}>
                        <FormattedAddress address={address} size={4} formatter={Others?.formatAddress} />
                    </Typography>
                    <Link
                        className={classes.link}
                        underline="none"
                        component="button"
                        title={t.copy_address()}
                        onClick={onCopy}>
                        <Icons.Copy size={16} />
                    </Link>
                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.addressLink?.(ChainId.Mainnet, address) ?? ''}
                        target="_blank"
                        title={t.view_on_explorer()}
                        rel="noopener noreferrer">
                        <Icons.LinkOut size={16} />
                    </Link>
                </div>
            </div>
            {action}
        </div>
    )
}
