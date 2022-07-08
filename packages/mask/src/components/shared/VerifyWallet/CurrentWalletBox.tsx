import {
    useAccount,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { FormattedAddress, WalletIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Account, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Button, Link, Typography } from '@mui/material'
import { ExternalLink } from 'react-feather'
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
    connectButton: {
        fontSize: 12,
        marginLeft: theme.spacing(1),
        padding: theme.spacing(1, 2),
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
    wallet: Account<ChainId> & {
        providerType: ProviderType
    }
    walletName?: string
    changeWallet: () => void
    notInPop?: boolean
}
export function CurrentWalletBox(props: CurrentWalletBox) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { wallet, walletName, notInPop, changeWallet } = props
    const { providerType } = wallet
    const providerDescriptor = useProviderDescriptor(NetworkPluginID.PLUGIN_EVM, providerType)
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM)
    const frontAccount = useAccount(NetworkPluginID.PLUGIN_EVM)
    const account = notInPop ? frontAccount : wallet.account
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet.account)
    return account ? (
        <section className={classes.currentAccount}>
            <WalletIcon
                size={30}
                badgeSize={12}
                mainIcon={providerDescriptor?.icon}
                badgeIcon={networkDescriptor?.icon}
            />
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    {providerType !== ProviderType.MaskWallet ? (
                        <Typography className={classes.accountName}>
                            {domain && Others?.formatDomainName
                                ? Others.formatDomainName(domain)
                                : providerDescriptor?.name}
                        </Typography>
                    ) : (
                        <>
                            <Typography className={classes.accountName}>
                                {walletName ?? providerDescriptor?.name}
                            </Typography>
                        </>
                    )}
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={account}>
                        <FormattedAddress address={account} size={4} formatter={Others?.formatAddress} />
                    </Typography>

                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.addressLink?.(wallet.chainId, account) ?? ''}
                        target="_blank"
                        title={t('plugin_wallet_view_on_explorer')}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </div>
            </div>
            <Button className={classes.actionButton} variant="contained" size="small" onClick={changeWallet}>
                {t('wallet_status_button_change')}
            </Button>
        </section>
    ) : (
        <section className={classes.connectButtonWrapper}>
            <Button
                className={classes.connectButton}
                color="primary"
                variant="contained"
                size="small"
                onClick={changeWallet}>
                {t('plugin_wallet_on_connect')}
            </Button>
        </section>
    )
}
