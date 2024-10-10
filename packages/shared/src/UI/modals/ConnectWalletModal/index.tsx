import { Icons } from '@masknet/icons'
import { NetworkPluginID, getSiteType, pluginIDsSettings, type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext, useProviderDescriptor } from '@masknet/web3-hooks-base'
import { getConnection, getUtils } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box, DialogContent, Typography, dialogClasses } from '@mui/material'
import { useRef, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { Spinner } from '../../components/Spinner.js'
import { WalletIcon } from '../../components/WalletIcon/index.js'
import { InjectedDialog } from '../../contexts/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        minHeight: 'auto !important',
        [`.${dialogClasses.paper}`]: {
            minHeight: 'unset !important',
            height: 400,
            width: 600,
        },
    },
    dialogContent: {
        padding: 0,
        flexDirection: 'column',
        display: 'flex',
        alignItems: 'center',
    },
    spinner: {
        position: 'absolute',
    },
    walletIcon: {
        position: 'absolute',
        inset: 0,
        margin: 'auto',
    },
    errorIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    retryButton: {
        fontSize: 12,
        backgroundColor: theme.palette.maskColor.publicMain,
        color: theme.palette.maskColor.white,
        marginTop: theme.spacing(1.5),
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

export function ConnectWalletModal({
    ref,
}: SingletonModalProps<ConnectWalletModalOpenProps, ConnectWalletModalCloseProps>) {
    const connectionRef = useRef<{
        pluginID: NetworkPluginID
        networkType: Web3Helper.NetworkTypeAll
        providerType: Web3Helper.ProviderTypeAll
    }>(undefined)
    const { pluginID, providerType, networkType } = connectionRef.current ?? {}

    const providerDescriptor = useProviderDescriptor(pluginID, providerType)

    const { classes, theme } = useStyles()

    const { setPluginID } = useNetworkContext()
    const { setNetworkType, setProviderType } = useChainContext()

    // Reset connection error
    const [tick, setTick] = useState(0)
    const [{ loading, error }, onConnect] = useAsyncFn(async () => {
        if (!connectionRef.current) throw new Error('Failed to connect to provider. No connection info provided')

        const { pluginID, providerType, networkType } = connectionRef.current

        const Utils = getUtils<NetworkPluginID>(pluginID)
        const Web3 = getConnection<NetworkPluginID>(pluginID, { providerType })
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
    }, [tick])

    const [open, dispatch] = useSingletonModal(ref, {
        async onOpen(props, dispatch) {
            setTick((v) => v + 1)
            connectionRef.current = {
                pluginID: props.pluginID ?? NetworkPluginID.PLUGIN_EVM,
                networkType: props.networkType,
                providerType: props.providerType,
            }
            const connected = await onConnect()
            if (connected) dispatch.close(true)
        },
    })

    if (!open) return null

    // Do not show loading for WalletConnect
    if (!pluginID || !providerType || !networkType || providerType === ProviderType.WalletConnect) return null

    const providerName = providerDescriptor?.name || '...'
    const { maskColor } = theme.palette
    const isCanceled = error?.message === 'User rejected the request.'

    return (
        <InjectedDialog
            title={<Trans>Connect with {providerName}</Trans>}
            open={open}
            onClose={() => dispatch?.close(false)}
            maxWidth="sm"
            className={classes.dialog}>
            <DialogContent className={classes.dialogContent}>
                <Box width={90} height={90} position="relative" mt={9}>
                    <Spinner
                        className={classes.spinner}
                        variant={
                            loading ? 'loading'
                            : error ?
                                'error'
                            :   'loading'
                        }
                    />
                    {error && !loading ?
                        <Icons.ColorfulClose className={classes.errorIcon} size={24} color={maskColor.danger} />
                    :   null}
                    <WalletIcon
                        className={classes.walletIcon}
                        size={60}
                        badgeSize={12}
                        mainIcon={providerDescriptor?.icon}
                    />
                </Box>
                <Typography
                    fontWeight={700}
                    fontSize={16}
                    mt={1.5}
                    color={error && !loading ? maskColor.danger : undefined}>
                    <Trans>Requesting Connection</Trans>
                </Typography>
                <Typography fontWeight={400} mt={1.5}>
                    {isCanceled && !loading ?
                        <Trans>You canceled the request.</Trans>
                    :   <Trans>Check {providerName} to confirm connect.</Trans>}
                </Typography>
                {error ?
                    <ActionButton
                        variant="roundedContained"
                        loading={loading}
                        color="primary"
                        onClick={onConnect}
                        disabled={loading}
                        className={classes.retryButton}>
                        <Trans>Retry</Trans>
                    </ActionButton>
                :   null}
            </DialogContent>
        </InjectedDialog>
    )
}
