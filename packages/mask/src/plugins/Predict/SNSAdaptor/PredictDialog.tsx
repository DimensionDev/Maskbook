import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { ApplicationEntry, InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST, isDashboardPage } from '@masknet/shared-base'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
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

const useStyles = makeStyles()((theme) => ({
    walletStatusBox: {
        margin: '8px 8px 24px 8px',
    },
    tabWrapper: {
        margin: '0 8px 0 8px',
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
        margin: '24px 8px 24px 8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: '100px',
        gridGap: theme.spacing(1.5),
        justifyContent: 'space-between',
        height: 324,
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
    const isDashboard = isDashboardPage()
    const { classes } = useStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const [openAzuro, setOpenAzuro] = useState(false)
    // const pluginID = useCurrentWeb3NetworkPluginID()

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network: NetworkType) => networkResolver.networkChainId(network))
    }, [])

    useUpdateEffect(() => {
        setChainId(currentChainId)
    }, [currentChainId])

    return (
        <>
            <InjectedDialog open={open} title={t.plugin_predict()} onClose={onClose}>
                <DialogContent>
                    {!isDashboard ? (
                        <div className={classes.walletStatusBox}>
                            <WalletStatusBox />
                        </div>
                    ) : null}
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
                </DialogContent>
            </InjectedDialog>
            <AzuroDialog open={openAzuro} onClose={() => setOpenAzuro(false)} />
        </>
    )
}
