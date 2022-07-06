import { makeStyles } from '@masknet/theme'
import { DialogActions, DialogContent } from '@mui/material'
import { ApplicationEntry, InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useI18N } from '../locales'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { useState } from 'react'
import { useChainId } from '@masknet/plugin-infra/web3'
import { ChainId, networkResolver, NetworkType } from '@masknet/web3-shared-evm'
import { useAsync, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../Wallet/messages'
import { protocols, PLUGIN_AZURO_ID } from './protocols'
import { AzuroIcon } from '../Azuro/icons/AzuroIcon'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { AzuroDialog } from '../Azuro/AzuroDialog'
import { PluginWalletStatusBar } from '../../../utils'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

const useStyles = makeStyles()((theme) => ({
    tabWrapper: {
        width: '100%',
        paddingBottom: theme.spacing(2),
        position: 'sticky',
        top: 0,
        zIndex: 2,
    },
    applicationImg: {
        width: 36,
        height: 36,
        marginBottom: 10,
    },
    title: {
        fontSize: 15,
    },
    disabled: {
        opacity: 0.4,
        cursor: 'default',
        pointerEvent: 'none',
    },
    applications: {
        margin: theme.spacing(2, 0, 0, 2),
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: '100px',
        gridGap: theme.spacing(1.5),
        justifyContent: 'space-between',
        height: 345,
    },
    application: {
        borderRadius: 8,
        height: 100,
        backgroundColor: theme.palette.background.default,
    },
    noProtocolContainer: {
        padding: 16,
    },
    azuroIcon: {
        fill: theme.palette.mode === 'light' ? theme.palette.common.black : theme.palette.common.white,
    },
}))

export interface PredictDialogProps {
    open: boolean
    onClose?: () => void
}

export function PredictDialog(props: PredictDialogProps) {
    const t = useI18N()
    const { open, onClose } = props
    const { classes } = useStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const [openAzuro, setOpenAzuro] = useState(false)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network: NetworkType) => networkResolver.networkChainId(network))
    }, [])

    useUpdateEffect(() => {
        setChainId(currentChainId)
    }, [currentChainId])

    return (
        <InjectedDialog open={open} title={t.plugin_predict()} onClose={onClose}>
            <DialogContent style={{ padding: 0, overflowX: 'hidden' }}>
                <div className={classes.tabWrapper}>
                    <NetworkTab
                        chainId={chainId}
                        setChainId={setChainId}
                        chains={chains.filter(Boolean) as ChainId[]}
                    />
                </div>
                <div className={classes.applications}>
                    <ApplicationEntry
                        disabled={!protocols[chainId.valueOf()]?.supportedProtocols.includes(PLUGIN_AZURO_ID)}
                        title={t.plugin_azuro()}
                        icon={<AzuroIcon fill={classes.azuroIcon} />}
                        onClick={() => setOpenAzuro(true)}
                    />
                </div>
                <AzuroDialog open={openAzuro} onClose={() => setOpenAzuro(false)} />
            </DialogContent>
            <DialogActions style={{ padding: 0, position: 'sticky', bottom: 0 }}>
                <PluginWalletStatusBar>
                    <ChainBoundary expectedChainId={chainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM} />
                </PluginWalletStatusBar>
            </DialogActions>
        </InjectedDialog>
    )
}
