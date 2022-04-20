import { ExternalLink } from 'react-feather'
import classNames from 'classnames'
import { ChainId, ProviderType, NetworkType } from '@masknet/web3-shared-evm'
import { Button, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    useWeb3State,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    Web3Plugin,
} from '@masknet/plugin-infra/web3'
import { FormattedAddress, WalletIcon } from '@masknet/shared'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    currentAccount: {
        padding: '12px 8px 12px 12px',
        width: '100%',
        background: theme.palette.background.input,
        boxSizing: 'border-box',
        marginBottom: theme.spacing(2),
        display: 'flex',
        borderRadius: 8,
        alignItems: 'center',
    },

    accountInfo: {
        flexGrow: 1,
        marginLeft: theme.spacing(1),
    },
    accountName: {
        fontSize: 14,
        marginRight: 4,
        fontWeight: 'bold',
        lineHeight: '18px',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
    },
    actionButton: {
        boxSizing: 'border-box',
        fontSize: 12,
        lineHeight: '16px',
        padding: '8px 12px',
        fontWeight: 'bold',
        background: theme.palette.text.primary,
        color: theme.palette.background.paper,
        borderRadius: '6px',
        minWidth: 'unset',
        width: '69px',
    },
    address: {
        fontSize: 10,
        lineHeight: 1,
        marginRight: theme.spacing(1),
        display: 'inline-block',
        color: theme.palette.text.secondary,
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
    twitterProviderBorder: {
        width: 14,
        height: 14,
    },
    connectButtonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: theme.spacing(2, 0),
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
interface CurrentWalletBox {
    wallet: Web3Plugin.ConnectionResult<ChainId, NetworkType, ProviderType>
    walletName?: string
    changeWallet: () => void
    account?: string
}
export function CurrentWalletBox(props: CurrentWalletBox) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { wallet, walletName, account } = props
    const providerDescriptor = useProviderDescriptor(wallet.providerType)
    const networkDescriptor = useNetworkDescriptor(wallet.networkType)
    const { Utils } = useWeb3State() ?? {}
    const { value: domain } = useReverseAddress(wallet.account)

    return (
        <section className={classNames(classes.currentAccount)}>
            <WalletIcon
                size={30}
                badgeSize={12}
                networkIcon={providerDescriptor?.icon}
                providerIcon={networkDescriptor?.icon}
            />
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    {wallet.providerType !== ProviderType.MaskWallet ? (
                        <Typography className={classes.accountName}>
                            {domain && Utils?.formatDomainName
                                ? Utils.formatDomainName(domain)
                                : providerDescriptor?.name}
                        </Typography>
                    ) : (
                        <>
                            <Typography className={classes.accountName}>
                                {walletName ?? providerDescriptor?.name}
                            </Typography>
                            {domain && Utils?.formatDomainName ? (
                                <Typography className={classes.domain}>{Utils.formatDomainName(domain)}</Typography>
                            ) : null}
                        </>
                    )}
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={wallet.account}>
                        <FormattedAddress
                            address={account ? account : wallet.account}
                            size={4}
                            formatter={Utils?.formatAddress}
                        />
                    </Typography>

                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(wallet.chainId, wallet.account) ?? ''}
                        target="_blank"
                        title={t('plugin_wallet_view_on_explorer')}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </div>
            </div>
            <Button
                className={classNames(classes.actionButton)}
                variant="contained"
                size="small"
                onClick={props.changeWallet}>
                {t('wallet_status_button_change')}
            </Button>
        </section>
    )
}
