import { Icons } from '@masknet/icons'
import { WalletIcon, useSharedTrans } from '@masknet/shared'
import {
    NetworkPluginID,
    Sniffings,
    getSiteType,
    pluginIDsSettings,
    type SingletonModalRefCreator,
} from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { ActionButton, LoadingBase, MaskColorVar, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useNetworkContext,
    useNetworkDescriptor,
    useProviderDescriptor,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { getUtils, getWeb3Connection } from '@masknet/web3-providers'
import type { Connection } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box, Card, DialogContent, Link, Paper, Typography, dialogClasses } from '@mui/material'
import { forwardRef, useRef } from 'react'
import { Trans } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { InjectedDialog } from '../../contexts/index.js'

const useStyles = makeStyles<{ contentBackground?: string }>()((theme, props) => ({
    dialog: {
        minHeight: 'auto !important',
        [`.${dialogClasses.paper}`]: {
            minHeight: 'unset !important',
        },
    },
    dialogContent: {
        padding: theme.spacing(2),
    },

    cardContent: {
        padding: theme.spacing('22px', '12px'),
        borderRadius: 8,
        background: props.contentBackground ?? theme.palette.background.default,
    },
    tipContent: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: MaskColorVar.warningBackground,
        padding: '13px 12px',
        borderRadius: 8,
    },
    tipContentText: {
        color: MaskColorVar.warning,
        fontSize: 13,
        marginLeft: 8.5,
    },
    tipLink: {
        color: MaskColorVar.warning,
        textDecoration: 'underline',
    },
    connectWith: {
        fontSize: '14px',
        color: Sniffings.is_dashboard_page ? '#07101B' : theme.palette.common.black,
        fontWeight: 700,
    },
    error: {
        paddingRight: theme.spacing(1),
    },
    progressIcon: {
        fontSize: 14,
        color: theme.palette.common.white,
    },
    progress: {
        color: theme.palette.common.black,
    },
    warningTriangleIcon: {
        fontSize: 20,
    },
    retryButton: {
        fontSize: 12,
        backgroundColor: theme.palette.maskColor.publicMain,
        color: theme.palette.maskColor.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
    },
}))

export interface ConnectWalletModalOpenProps {
    pluginID: NetworkPluginID
    networkType: Web3Helper.NetworkTypeAll
    providerType: Web3Helper.ProviderTypeAll
}

export type ConnectWalletModalCloseProps = boolean

export const ConnectWalletModal = forwardRef<
    SingletonModalRefCreator<ConnectWalletModalOpenProps, ConnectWalletModalCloseProps>
>((props, ref) => {
    const t = useSharedTrans()

    const connectionRef = useRef<{
        pluginID: NetworkPluginID
        networkType: Web3Helper.NetworkTypeAll
        providerType: Web3Helper.ProviderTypeAll
    }>()
    const { pluginID, providerType, networkType } = connectionRef.current ?? {}

    const providerDescriptor = useProviderDescriptor(pluginID, providerType)
    const networkDescriptor = useNetworkDescriptor(pluginID, networkType)

    const { classes } = useStyles({ contentBackground: providerDescriptor?.backgroundGradient })

    const Utils = useWeb3Utils(pluginID)
    const { setPluginID } = useNetworkContext()
    const { setNetworkType, setProviderType } = useChainContext()

    const [{ loading, value: connected, error }, onConnect] = useAsyncFn(async () => {
        if (!connectionRef.current) throw new Error('Failed to connect to provider. No connection info provided')

        const { pluginID, providerType, networkType } = connectionRef.current

        const Utils = getUtils<NetworkPluginID>(pluginID)
        const Web3 = getWeb3Connection<NetworkPluginID>(pluginID, { providerType }) as Connection<NetworkPluginID>
        const chainId = Utils.networkResolver.networkChainId(networkType)
        if (!chainId) throw new Error(`Failed to connect to provider. Invalid chainId for network type: ${networkType}`)

        try {
            const account = await Web3.connect({
                chainId,
                providerType,
            })
            setPluginID(pluginID)
            setNetworkType(networkType)
            setProviderType(providerType)
            if (!account) throw new Error('Failed to build connection.')
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to connect to provider. Unknown reason')
        }

        const site = getSiteType()

        if (pluginID && site) {
            pluginIDsSettings.value = {
                ...pluginIDsSettings.value,
                [site]: pluginID,
            }
        }

        return true
    }, [])

    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props) {
            connectionRef.current = {
                pluginID: props.pluginID ?? NetworkPluginID.PLUGIN_EVM,
                networkType: props.networkType,
                providerType: props.providerType,
            }

            const connected = await onConnect()
            if (connected === true) dispatch?.close(true)
        },
    })

    if (!open) return null

    if (!pluginID || !providerType || !networkType) return null

    return (
        <InjectedDialog
            title={t.plugin_wallet_dialog_title()}
            open={open}
            onClose={() => dispatch?.close(false)}
            maxWidth="sm"
            className={classes.dialog}>
            <DialogContent className={classes.dialogContent}>
                <Paper elevation={0}>
                    <Card className={`${classes.cardContent} dashboard-style`} elevation={0}>
                        <Box display="flex" alignItems="center">
                            <WalletIcon
                                size={30}
                                badgeSize={12}
                                mainIcon={providerDescriptor?.icon}
                                badgeIcon={networkDescriptor?.icon}
                            />
                            <Box display="flex" flex={1} flexDirection="column" sx={{ marginLeft: 2 }}>
                                <Typography className={classes.connectWith}>
                                    {loading ?
                                        t.plugin_wallet_connect_to()
                                    : connected ?
                                        t.plugin_wallet_connected_to()
                                    :   t.plugin_wallet_connect_to()}{' '}
                                    {Utils.providerResolver.providerName(providerType)}
                                </Typography>
                                {loading ?
                                    <Box display="flex" alignItems="center">
                                        <LoadingBase
                                            className={classes.progressIcon}
                                            size={14}
                                            sx={{ marginRight: 1 }}
                                        />
                                        <Typography variant="body2" className={classes.progress}>
                                            {t.initializing()}
                                        </Typography>
                                    </Box>
                                :   null}
                                {!loading && error ?
                                    <Typography className={classes.error} color="red" variant="body2">
                                        {(
                                            error.message?.includes('Already processing eth_requestAccounts') ||
                                            error.message?.includes(
                                                "Request of type 'wallet_requestPermissions' already pending for origin",
                                            )
                                        ) ?
                                            t.plugin_wallet_metamask_error_already_request()
                                        :   error.message ?? 'Something went wrong.'}
                                    </Typography>
                                :   null}
                            </Box>
                            {!connected && error ?
                                <ActionButton
                                    loading={loading}
                                    color="primary"
                                    onClick={onConnect}
                                    disabled={loading}
                                    className={classes.retryButton}>
                                    {t.plugin_wallet_connect_to_retry()}
                                </ActionButton>
                            :   null}
                        </Box>
                    </Card>
                </Paper>
                {providerDescriptor?.type === ProviderType.WalletConnect ? null : (
                    <Card className={classes.tipContent} elevation={0}>
                        <Icons.WarningTriangle className={classes.warningTriangleIcon} />
                        <Typography className={classes.tipContentText} variant="body2">
                            <Trans
                                i18nKey="plugin_wallet_connect_tip"
                                components={{
                                    providerLink:
                                        Utils.providerResolver.providerHomeLink(providerType) ?
                                            <Link
                                                className={classes.tipLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={Utils.providerResolver.providerHomeLink(providerType)}
                                            />
                                        :   <span />,
                                }}
                                values={{
                                    providerName: Utils.providerResolver.providerName(providerType),
                                    providerShortenLink: Utils.providerResolver.providerShortenLink(providerType),
                                }}
                            />
                        </Typography>
                    </Card>
                )}
            </DialogContent>
        </InjectedDialog>
    )
})
