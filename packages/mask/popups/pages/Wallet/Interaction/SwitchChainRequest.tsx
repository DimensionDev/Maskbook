import { makeStyles } from '@masknet/theme'
import type { InteractionItemProps } from './interaction.js'
import { Alert, IconButton, Link, Typography } from '@mui/material'
import { useChainId, useNetwork, useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useTitle } from 'react-use'
import { NetworkIcon } from '@masknet/shared'
import { KeyboardArrowRightRounded } from '@mui/icons-material'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useEffect } from 'react'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyle = makeStyles()({
    title: { fontSize: 28, marginTop: 16 },
    origin: {
        border: '1px solid gray',
        textAlign: 'center',
        borderRadius: 10,
        fontSize: 'large',
        padding: '0.25em',
        margin: '1em 0.5em',
    },
    container: { display: 'flex', alignItems: 'center' },
    icon: { width: 72, height: 72 },
    network: { flex: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' },
    arrow: { flex: 1 },
})
export function SwitchChainRequest(props: InteractionItemProps) {
    const { _ } = useLingui()
    const { setConfirmAction } = props
    const { classes } = useStyle()
    const origin = props.currentRequest.origin
    const { Network, Message } = useWeb3State()
    const currentChainId = useChainId()
    const currentNetwork = useNetwork()
    const nextChainId = Number.parseInt(props.currentRequest.request.arguments.params[0].chainId, 16)
    const nextNetwork = useNetwork(NetworkPluginID.PLUGIN_EVM, nextChainId)

    useTitle(_(msg`Connect with Mask Wallet`))
    useEffect(() => {
        props.setConfirmDisabled(!nextNetwork)
    }, [!nextNetwork])

    if (!origin) return null
    setConfirmAction(async () => {
        if (!nextNetwork) return
        await Network!.switchNetwork(nextNetwork.ID)
        await EVMWeb3.switchChain(nextNetwork.chainId, {
            providerType: ProviderType.MaskWallet,
        })

        await Message!.approveRequestWithResult(props.currentRequest.ID, { result: null, jsonrpc: '2.0', id: 0 })
        // After a chain switch, old requests should be dropped according to https://eips.ethereum.org/EIPS/eip-3326
        await Message!.rejectRequests({ keepChainUnrelated: true, keepNonceUnrelated: true })
    })

    return (
        <>
            <Typography variant="h1" className={classes.title}>
                <Trans>Allow this site to switch the network?</Trans>
            </Typography>
            <Typography variant="h2" className={classes.origin}>
                {origin.startsWith('https://') ? origin.slice('https://'.length) : origin}
            </Typography>
            {nextNetwork ? null : (
                <Alert sx={{ marginBottom: 1 }} severity="error">
                    <Trans>Cannot switch to a unknown network.</Trans>
                </Alert>
            )}
            <div className={classes.container}>
                <div className={classes.network}>
                    <IconButton
                        component={Link}
                        href={currentNetwork?.explorerUrl.url}
                        target="_blank"
                        rel="noopener noreferrer">
                        <NetworkIcon
                            className={classes.icon}
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                            chainId={currentChainId}
                            network={currentNetwork}
                            size={16}
                        />
                    </IconButton>
                </div>
                <KeyboardArrowRightRounded fontSize="large" className={classes.arrow} />
                <div className={classes.network}>
                    <IconButton
                        component={Link}
                        href={nextNetwork?.explorerUrl.url}
                        target="_blank"
                        rel="noopener noreferrer">
                        <NetworkIcon
                            className={classes.icon}
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                            chainId={nextChainId}
                            network={nextNetwork}
                            size={16}
                        />
                    </IconButton>
                </div>
            </div>
            <div className={classes.container}>
                <div className={classes.network}>
                    <Link href={currentNetwork?.explorerUrl.url} target="_blank" rel="noopener noreferrer">
                        {currentNetwork?.fullName ?? 'Unknown Network'}
                    </Link>
                    <Typography>
                        <Trans>Chain ID: {currentNetwork?.chainId ?? currentChainId}</Trans>
                    </Typography>
                </div>
                <div className={classes.arrow} />
                <div className={classes.network}>
                    <Link href={nextNetwork?.explorerUrl.url} target="_blank" rel="noopener noreferrer">
                        {nextNetwork?.fullName ?? 'Unknown Network'}
                    </Link>
                    <Typography>
                        <Trans>Chain ID: {nextNetwork?.chainId ?? nextChainId}</Trans>
                    </Typography>
                </div>
            </div>
        </>
    )
}
