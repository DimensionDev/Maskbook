import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTraderTrans } from '../../locales/i18n_generated.js'
import { LiFiWidget, HiddenUI, type WidgetConfig } from '@lifi/widget'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { Web3Provider } from '@ethersproject/providers'
import { EVMWeb3 } from '@masknet/web3-providers'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { Icons } from '@masknet/icons'
import { useChainContext, useNetworks } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, getRPCConstant } from '@masknet/web3-shared-evm'
import { reduce } from 'lodash-es'

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
    const { providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { theme, classes } = useStyles()
    const [containerRef, setContainerRef] = useState<HTMLElement>()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const widgetRef = useRef<{
        navigateToTransaction?: () => void
        navigateToSettings?: () => void
        navigateBack?: () => void
        isOpen(): void
        toggleDrawer(): void
        openDrawer(): void
        closeDrawer(): void
        isHome: boolean
    }>(null)

    const handleBackOrClose = useCallback(() => {
        if (widgetRef.current?.isHome) {
            onClose()
        } else {
            widgetRef.current?.navigateBack?.()
        }
    }, [onClose])

    const getSigner = useCallback(() => {
        const provider = EVMWeb3.getWeb3Provider({ providerType })

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return new Web3Provider(provider, 'any').getSigner()
    }, [providerType])

    const widgetConfig = useMemo<WidgetConfig>(() => {
        const rpcs = reduce(
            networks,
            (acc, current) => {
                const urls = getRPCConstant(current.chainId, 'RPC_URLS') || []
                acc[current.chainId] = urls
                return acc
            },
            {} as Record<ChainId, string[]>,
        )

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
                connect: async () => {
                    return getSigner()
                },
                disconnect: async () => {},
            },
            hiddenUI: [HiddenUI.Header],
            appearance: theme.palette.mode,
            sdkConfig: {
                rpcs,
            },
        }
    }, [theme])

    return (
        <InjectedDialog
            open={open}
            onClose={handleBackOrClose}
            title={t.plugin_trader_tab_exchange()}
            titleTail={
                <Box className={classes.icons}>
                    <Icons.History
                        size={24}
                        className={classes.icon}
                        onClick={() => {
                            widgetRef.current?.navigateToTransaction?.()
                        }}
                    />
                    <Icons.WalletSetting
                        size={24}
                        className={classes.icon}
                        onClick={() => widgetRef.current?.navigateToSettings?.()}
                    />
                </Box>
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
