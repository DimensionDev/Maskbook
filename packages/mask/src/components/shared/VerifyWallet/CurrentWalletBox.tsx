import { useCallback } from 'react'
import { ExternalLink } from 'react-feather'
import classNames from 'classnames'
import { ProviderType, useWallet } from '@masknet/web3-shared-evm'
import { Button, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    useAccount,
    useWeb3State,
    useChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useProviderType,
    useReverseAddress,
} from '@masknet/plugin-infra/web3'
import { FormattedAddress, WalletIcon } from '@masknet/shared'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { useI18N } from '../../../utils'
import Services from '../../../extension/service'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    currentAccount: {
        padding: '12px 8px',
        width: '100%',
        background: '#fff',
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
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
    },
    actionButton: {
        fontSize: 12,
        marginLeft: theme.spacing(1),
        padding: '8px 12px',
        fontWeight: 'bold',
        background: 'rgba(15, 20, 25, 1)',
        color: '#fff',
        minWidth: 70,
        borderRadius: '6px',
    },
    address: {
        fontSize: 10,
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
    isDashboard?: boolean
    disableChange?: boolean
    changeWallet: () => void
}
export function CurrentWalletBox(props: CurrentWalletBox) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const account = useAccount()
    const wallet = useWallet()
    const providerType = useProviderType()
    const providerDescriptor = useProviderDescriptor()
    const networkDescriptor = useNetworkDescriptor()
    const { Utils } = useWeb3State() ?? {}

    const { value: domain } = useReverseAddress(account)

    // #region walletconnect
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    // #endregion

    const onDisconnect = useCallback(async () => {
        switch (providerType) {
            case ProviderType.WalletConnect:
                setWalletConnectDialog({
                    open: true,
                    uri: await Services.Ethereum.createConnectionURI(),
                })
                break
            case ProviderType.Fortmatic:
                await Services.Ethereum.disconnectFortmatic(chainId)
                break
        }
    }, [chainId, providerType, setWalletConnectDialog])

    const onChange = props.changeWallet

    return account ? (
        <section className={classNames(classes.currentAccount)}>
            <WalletIcon
                size={30}
                badgeSize={16}
                networkIcon={providerDescriptor?.icon}
                providerIcon={networkDescriptor?.icon}
            />
            <div className={classes.accountInfo}>
                <div className={classes.infoRow} style={{ marginBottom: 3 }}>
                    {providerType !== ProviderType.MaskWallet ? (
                        <Typography className={classes.accountName}>
                            {domain && Utils?.formatDomainName
                                ? Utils.formatDomainName(domain)
                                : providerDescriptor?.name}
                        </Typography>
                    ) : (
                        <>
                            <Typography className={classes.accountName}>
                                {wallet?.name ?? providerDescriptor?.name}
                            </Typography>
                            {domain && Utils?.formatDomainName ? (
                                <Typography className={classes.domain}>{Utils.formatDomainName(domain)}</Typography>
                            ) : null}
                        </>
                    )}
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2" title={account}>
                        <FormattedAddress address={account} size={4} formatter={Utils?.formatAddress} />
                    </Typography>

                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(chainId, account) ?? ''}
                        target="_blank"
                        title={t('plugin_wallet_view_on_explorer')}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </div>
            </div>
            {!props.disableChange && (
                <section>
                    {providerType === ProviderType.WalletConnect || providerType === ProviderType.Fortmatic ? (
                        <ActionButtonPromise
                            className={classes.actionButton}
                            size="small"
                            variant="contained"
                            init={t('wallet_status_button_disconnect')}
                            waiting={t('wallet_status_button_disconnecting')}
                            failed={t('failed')}
                            complete={t('done')}
                            executor={onDisconnect}
                            completeIcon={<></>}
                            failIcon={<></>}
                        />
                    ) : null}
                    <Button
                        className={classNames(classes.actionButton)}
                        variant="contained"
                        size="small"
                        onClick={onChange}>
                        {t('wallet_status_button_change')}
                    </Button>
                </section>
            )}
        </section>
    ) : (
        <section className={classes.connectButtonWrapper}>
            <Button className={classNames(classes.actionButton)} variant="contained" size="small" onClick={onChange}>
                {t('plugin_wallet_on_connect')}
            </Button>
        </section>
    )
}
