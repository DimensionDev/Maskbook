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
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { TRADER_WEB3_CONFIG } from '../../config.js'
import { DeleteOutline } from '@mui/icons-material'
import { useSiteThemeMode } from '@masknet/plugin-infra/content-script'

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
    content: {
        padding: theme.spacing(3, 2),
        '.routeCard': {
            padding: theme.spacing(2, 1.5),
        },
        '::-webkit-scrollbar': {
            display: 'none',
            scrollbarColor: 'unset!important',
            backgroundColor: 'unset!important',
        },
        "& [id*='widget-route-expanded-container']": {
            width: 284,
        },
    },
}))
export interface ExchangeDialogProps {
    open: boolean
    onClose: () => void
    toAddress?: string
    toChainId?: number
}

export const ExchangeDialog = memo<ExchangeDialogProps>(function ExchangeDialog({
    open,
    onClose,
    toChainId,
    toAddress,
}) {
    const t = useTraderTrans()

    const { Provider } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { providerType, chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { theme, classes } = useStyles()
    const mode = useSiteThemeMode(theme)
    const [containerRef, setContainerRef] = useState<HTMLElement>()

    const widgetRef = useRef<WidgetDrawer>(null)
    const [showActions, setShowActions] = useState(true)
    const [showDelete, setShowDelete] = useState(false)
    const handleBackOrClose = useCallback(() => {
        if (widgetRef.current?.isHome) {
            onClose()
        } else {
            if (widgetRef.current?.isHistory || widgetRef.current?.isSettings) setShowActions(true)
            widgetRef.current?.navigateBack?.()
        }
    }, [onClose])

    const getSigner = useCallback(
        (requiredChainId?: ChainId) => {
            const providerType = Provider?.providerType?.getCurrentValue()
            const provider = EVMWeb3.getWeb3Provider({ providerType, chainId: requiredChainId ?? chainId, account })

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const signer = new Web3Provider(provider, 'any').getSigner()
            return signer
        },
        [Provider, chainId, account],
    )

    const widgetConfig = useMemo<WidgetConfig>(() => {
        return {
            toChain: toChainId,
            toToken: toAddress,
            integrator: 'MaskNetwork',
            variant: 'expandable',
            theme: {
                palette: {
                    primary: { main: theme.palette.maskColor.main },
                    secondary: { main: theme.palette.maskColor.primary },
                },
            },
            chains: {
                allow: TRADER_WEB3_CONFIG[NetworkPluginID.PLUGIN_EVM].supportedChainIds ?? [],
            },
            walletManagement: {
                signer: getSigner(),
                switchChain: async (chainId: ChainId) => {
                    const providerType = Provider?.providerType?.getCurrentValue()
                    await EVMWeb3.switchChain(chainId, { silent: providerType === ProviderType.MaskWallet })
                    return getSigner(chainId)
                },
                connect: async () => {
                    if (providerType === ProviderType.None) await SelectProviderModal.openAndWaitForClose()
                    return getSigner()
                },
                disconnect: async () => {},
            },
            hiddenUI: [HiddenUI.Header],
            appearance: theme.palette.mode,
            subTitleSize: 14,
            progressSize: 16,
            forceCompact: false,
            inputColor: theme.palette.maskColor.bottom,
        }
    }, [theme, providerType, getSigner, chainId, toAddress, toChainId])

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
                                setShowDelete(true)
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
                : showDelete ?
                    <DeleteOutline onClick={widgetRef.current?.deleteTransactions} />
                :   null
            }>
            <DialogContent
                className={classes.content}
                style={{ scrollbarColor: 'initial' }}
                sx={{ p: 3 }}
                ref={(_: HTMLElement) => {
                    setContainerRef(_)
                }}>
                <LiFiWidget integrator="MaskNetwork" config={{ ...widgetConfig, containerRef }} ref={widgetRef} />
            </DialogContent>
        </InjectedDialog>
    )
})
