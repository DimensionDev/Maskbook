import { useReverseAddress, useWallets, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/public-api'
import { FormattedAddress, useSnackbarCallback } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Link, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../locales'

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
        fontSize: 14,
        marginRight: 6,
    },
    address: {
        fontSize: 10,
        marginRight: theme.spacing(1),
        color: theme.palette.text.secondary,
        display: 'inline-block',
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        width: 16,
        height: 16,
        marginRight: theme.spacing(1),
    },
    defaultBtn: {
        fontSize: 14,
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    delIcon: {
        width: 20,
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
    domain: {
        fontSize: 16,
        lineHeight: '18px',
        marginLeft: 6,
        padding: 4,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        color: theme.palette.common.black,
    },
}))

interface WalletItemProps {
    address: string
    isDefault?: boolean
    canDelete?: boolean
    onDelete?: any
    fallbackName?: string
    nowIdx: number
    setAsDefault?: (idx: number) => void
}

export function WalletItem({
    address,
    isDefault,
    canDelete,
    fallbackName,
    setAsDefault,
    onDelete,
    nowIdx,
}: WalletItemProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, address)
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM) ?? {}
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

    const walletName = useMemo(() => {
        if (domain && Others?.formatDomainName) {
            return Others.formatDomainName(domain)
        }
        const currentWallet = wallets.find((x) => Others?.isSameAddress(x.address, address))
        const name = currentWallet?.name
        return name !== undefined && currentWallet?.hasStoredKeyInfo ? name : fallbackName
    }, [address, domain, fallbackName])

    const getActionRender = () => {
        if (!canDelete && !isDefault)
            return (
                <Typography
                    className={classes.defaultBtn}
                    onClick={() => {
                        if (!setAsDefault) return
                        setAsDefault(nowIdx ?? 0)
                    }}>
                    {t.tip_set_as_default()}
                </Typography>
            )
        if (canDelete)
            return (
                <img
                    onClick={onDelete}
                    className={classes.delIcon}
                    src={new URL('../../assets/del.png', import.meta.url).toString()}
                />
            )
        return null
    }
    return (
        <div className={classes.currentAccount}>
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    <Typography className={classes.accountName}>{walletName}</Typography>
                    {isDefault && <Typography className={classes.defaultBadge}>{t.default()}</Typography>}
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={address}>
                        <FormattedAddress address={address} size={4} formatter={Utils?.formatAddress} />
                    </Typography>
                    <Link
                        className={classes.link}
                        underline="none"
                        component="button"
                        title={t.copy_address()}
                        onClick={onCopy}>
                        <img
                            src={new URL('../../assets/copy.png', import.meta.url).toString()}
                            className={classes.linkIcon}
                        />
                    </Link>
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(ChainId.Mainnet, address) ?? ''}
                        target="_blank"
                        title={t.view_on_explorer()}
                        rel="noopener noreferrer">
                        <img
                            src={new URL('../../assets/link.png', import.meta.url).toString()}
                            className={classes.linkIcon}
                        />
                    </Link>
                </div>
            </div>
            {getActionRender()}
        </div>
    )
}
