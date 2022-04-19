import { makeStyles, getMaskColor } from '@masknet/theme'
import { Link, Typography } from '@mui/material'
import { useCopyToClipboard } from 'react-use'
import { useSnackbarCallback, FormattedAddress } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { Copy, ExternalLink } from 'react-feather'
import { useProviderDescriptor, useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { isSameAddress, ProviderType, useProviderType, useWallets } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    currentAccount: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
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
        fontSize: 16,
        marginRight: 6,
    },
    address: {
        fontSize: 14,
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
        marginRight: theme.spacing(1),
    },
    defaultBtn: {
        fontSize: 16,
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
        fontSize: 14,
        backgroundColor: 'rgba(28, 104, 243, 0.1)',
        color: getMaskColor(theme).primary,
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

interface WalletComProps {
    address: string
    isDefault?: boolean
    canDelete?: boolean
    onDelete?: any
    index?: number
    setAsDefault?: (idx: number) => void
}

export function WalletCom({ address, isDefault, canDelete, index, setAsDefault, onDelete }: WalletComProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const providerType = useProviderType()
    const { value: domain } = useReverseAddress(address)
    const providerDescriptor = useProviderDescriptor()
    const { Utils } = useWeb3State() ?? {}
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(address)
        },
        [],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_wallet_addr'),
    )
    const walletName = useWallets().find((x) => isSameAddress(x.address, address))?.name
    const getActionRender = () => {
        if (!canDelete && !isDefault)
            return (
                <div
                    className={classes.defaultBtn}
                    onClick={() => {
                        if (!setAsDefault) return
                        setAsDefault(index ?? 0)
                    }}>
                    Set as default
                </div>
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
                    {providerType !== ProviderType.MaskWallet ? (
                        <Typography className={classes.accountName}>
                            {domain && Utils?.formatDomainName
                                ? Utils.formatDomainName(domain)
                                : providerDescriptor?.name}
                        </Typography>
                    ) : (
                        <>
                            <Typography className={classes.accountName}>{walletName ?? 'Wallet ' + index}</Typography>
                            {domain && Utils?.formatDomainName ? (
                                <Typography className={classes.domain}>{Utils.formatDomainName(domain)}</Typography>
                            ) : null}
                        </>
                    )}
                    <Typography className={classes.accountName}>{walletName ?? 'Wallet ' + index}</Typography>
                    {isDefault && <div className={classes.defaultBadge}>Default</div>}
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={address}>
                        <FormattedAddress address={address} size={4} formatter={Utils?.formatAddress} />
                    </Typography>
                    <Link
                        className={classes.link}
                        underline="none"
                        component="button"
                        title={t('wallet_status_button_copy_address')}
                        onClick={onCopy}>
                        <Copy className={classes.linkIcon} size={14} />
                    </Link>
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(1, address) ?? ''}
                        target="_blank"
                        title={t('plugin_wallet_view_on_explorer')}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </div>
            </div>
            {getActionRender()}
        </div>
    )
}
