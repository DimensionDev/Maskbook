import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTraderTrans } from '../../locales/i18n_generated.js'
import { LiFiWidget, HiddenUI, type WidgetConfig, type WidgetDrawer } from '@lifi/widget'
import { InjectedDialog, SelectProviderModal } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { Web3Provider } from '@ethersproject/providers'
import { EVMWeb3 } from '@masknet/web3-providers'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { Icons } from '@masknet/icons'
import { useChainContext, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, ProviderType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    icons: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    icon: {
        width: 24,
        height: 24,
        cursor: 'pointer',
    },
}))
export interface ExchangeDialogProps {
    open: boolean
    onClose: () => void
}

export const ExchangeDialog = memo<ExchangeDialogProps>(function ExchangeDialog({ open, onClose }) {
    const t = useTraderTrans()
    const { Provider } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { theme, classes } = useStyles()
    const [containerRef, setContainerRef] = useState<HTMLElement>()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const widgetRef = useRef<WidgetDrawer>(null)
    const [showActions, setShowActions] = useState(true)

    const handleBackOrClose = useCallback(() => {
        if (widgetRef.current?.isHome) {
            onClose()
        } else {
            if (widgetRef.current?.isHistory || widgetRef.current?.isSettings) setShowActions(true)
            widgetRef.current?.navigateBack?.()
        }
    }, [onClose])

    const getSigner = useCallback(() => {
        const providerType = Provider?.providerType?.getCurrentValue()
        const provider = EVMWeb3.getWeb3Provider({ providerType })

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const signer = new Web3Provider(provider, 'any').getSigner()
        return signer
    }, [Provider])

    const widgetConfig = useMemo<WidgetConfig>(() => {
        return {
            integrator: 'Mask Network',
            variant: 'expandable',
            theme: {
                palette: {
                    primary: { main: theme.palette.maskColor.main },
                    secondary: { main: theme.palette.maskColor.primary },
                },
            },
            walletManagement: {
                signer: getSigner(),
                beforeSwitchChain: async (chainId: ChainId) => {
                    const providerType = Provider?.providerType?.getCurrentValue()
                    if (providerType === ProviderType.MaskWallet) {
                        await EVMWeb3.switchChain(chainId, { silent: true })
                    }

                    return
                },
                connect: async () => {
                    if (providerType === ProviderType.None) await SelectProviderModal.openAndWaitForClose()
                    return getSigner()
                },
                disconnect: async () => {},
            },
            hiddenUI: [HiddenUI.Header],
            appearance: theme.palette.mode,
        }
    }, [theme, providerType])

    return (
        <InjectedDialog
            open={open}
            onClose={handleBackOrClose}
            title={t.plugin_trader_tab_exchange()}
            titleTail={
                showActions ?
                    <Box className={classes.icons}>
                        <Icons.History
                            size={24}
                            className={classes.icon}
                            onClick={() => {
                                setShowActions(false)
                                widgetRef.current?.navigateToTransaction?.()
                            }}
                        />
                        <Icons.WalletSetting
                            size={24}
                            className={classes.icon}
                            onClick={() => {
                                setShowActions(false)
                                widgetRef.current?.navigateToSettings?.()
                            }}
                        />
                    </Box>
                :   null
            }>
            <DialogContent
                sx={{ p: 3 }}
                ref={(_: HTMLElement) => {
                    setContainerRef(_)
                }}>
                <LiFiWidget integrator="MaskNetwork" config={{ ...widgetConfig, containerRef }} ref={widgetRef} />
            </DialogContent>
        </InjectedDialog>
    )
})
