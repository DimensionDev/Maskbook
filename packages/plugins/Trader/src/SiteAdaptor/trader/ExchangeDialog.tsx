import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTraderTrans } from '../../locales/i18n_generated.js'
import { LiFiWidget, HiddenUI, type WidgetConfig } from '@lifi/widget'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { Web3Provider } from '@ethersproject/providers'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { Icons } from '@masknet/icons'
import { useAppearance } from '@lifi/widget/stores/index.js'

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
    const [mode] = useAppearance()
    const { theme, classes } = useStyles()
    const [containerRef, setContainerRef] = useState<HTMLElement>()
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

    const widgetConfig = useMemo<WidgetConfig>(
        () => ({
            integrator: 'Mask Network',
            variant: 'expandable',
            theme: {
                palette: {
                    primary: { main: theme.palette.maskColor.main },
                    secondary: { main: theme.palette.maskColor.primary },
                },
            },
            walletManagement: {
                connect: async () => {
                    const provider = EVMWeb3.getWeb3Provider({ providerType: ProviderType.MetaMask })

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const signer = new Web3Provider(provider, 'any').getSigner()
                    return signer
                },
                disconnect: async () => {},
            },
            hiddenUI: [HiddenUI.Header],
            appearance: theme.palette.mode,
        }),
        [theme],
    )

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
