import { Appearance } from '@masknet/public-api'
import { SelectProviderModal, SharedContextProvider, SwapPageModals, WalletIcon } from '@masknet/shared'
import { ActionButton, applyMaskColorVars, makeStyles } from '@masknet/theme'
import {
    ChainContextProvider,
    useChainContext,
    useNetworkContext,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    useWallet,
    useWeb3State,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Background } from '../../components/SwapBackground.js'
import { Icons } from '@masknet/icons'
import { Box, Typography, alpha } from '@mui/material'
import { type ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { LiFiWidget, type WidgetConfig, type WidgetDrawer } from '@lifi/widget'
import { EVMWeb3 } from '@masknet/web3-providers'
import { Web3Provider } from '@ethersproject/providers'
import { AccountManager } from '../../components/AccountManager.js'
import { TRADER_WEB3_CONFIG } from '@masknet/plugin-trader'

const useStyles = makeStyles()((theme) => {
    return {
        page: {
            minHeight: '100vh',
            maxWidth: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        background: {
            zIndex: -100,
            position: 'fixed',
            top: 0,
            left: 0,
        },
        header: {
            position: 'fixed',
            top: 0,
            left: 0,
            padding: '14px 21px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
        },
        connect: {
            border: `1px solid ${theme.palette.maskColor.secondaryBottom}`,
            borderRadius: 99,
            boxShadow: `0px 4px 30px 0px ${alpha(theme.palette.common.black, 0.1)}`,
            background: alpha(theme.palette.maskColor.white, 0.1),
            padding: '5px 8px 5px 5px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
        },
        walletName: {
            color: theme.palette.maskColor.main,
            fontSize: 14,
            lineHeight: '18px',
            fontWeight: 700,
        },
        container: {
            border: `1px solid ${theme.palette.maskColor.secondaryBottom}`,
            boxShadow: `0px 4px 30px 0px ${alpha(theme.palette.common.black, 0.1)}`,
            background: alpha(theme.palette.maskColor.white, 0.1),
            borderRadius: 12,
            padding: theme.spacing(2),
            minWidth: 392,
            minHeight: 494,
            maxHeight: '70vh',
            display: 'flex',
            overflow: 'auto',
            position: 'relative',
        },
        powerBy: {
            position: 'fixed',
            bottom: 12,
            right: 20,
            fontSize: 14,
        },
    }
})

export default function SwapPage() {
    const t = useMaskSharedTrans()
    const { classes, theme } = useStyles()

    const [anchorEl, setAnchorEl] = useState<HTMLElement>()
    const [containerRef, setContainerRef] = useState<HTMLElement>()
    const { pluginID } = useNetworkContext()
    const { account, chainId, providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { Provider } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const providerDescriptor = useProviderDescriptor(pluginID)
    const networkDescriptor = useNetworkDescriptor(pluginID, chainId)
    const wallet = useWallet()
    const { data: domain } = useReverseAddress(pluginID, account)
    const Utils = useWeb3Utils()

    const walletName = useMemo(() => {
        if (domain) return domain
        if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name
        return Utils.formatAddress(account, 4)
    }, [account, domain, providerType, wallet?.name, Utils.formatAddress])

    const init = useCallback(() => {
        applyMaskColorVars(document.body, Appearance.light)
    }, [])

    const widgetRef = useRef<WidgetDrawer>(null)

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
            integrator: 'Mask Network',
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
                signer: account ? getSigner() : undefined,
                switchChain:
                    account ?
                        async (chainId: ChainId) => {
                            const providerType = Provider?.providerType?.getCurrentValue()
                            await EVMWeb3.switchChain(chainId, { silent: providerType === ProviderType.MaskWallet })
                            return getSigner(chainId)
                        }
                    :   undefined,
                connect: async () => {
                    if (providerType === ProviderType.None) await SelectProviderModal.openAndWaitForClose()
                    return getSigner()
                },
                disconnect: async () => {},
            },
            appearance: theme.palette.mode,
            containerStyle: {
                maxHeight: '100%',
                overflow: 'auto',
            },
        }
    }, [theme, providerType, getSigner])

    return (
        <SharedContextProvider>
            <ChainContextProvider chainId={chainId}>
                <div className={classes.page} ref={init}>
                    <div className={classes.background}>
                        <Background />
                    </div>
                    <header className={classes.header}>
                        <Icons.Mask width={140} height={40} variant={'light'} />
                        {account ?
                            <Box className={classes.connect} onClick={(event) => setAnchorEl(event.currentTarget)}>
                                <WalletIcon
                                    size={30}
                                    badgeSize={12}
                                    mainIcon={providerDescriptor?.icon ?? networkDescriptor?.icon}
                                    badgeIcon={providerDescriptor?.icon ? networkDescriptor?.icon : undefined}
                                    iconFilterColor={providerDescriptor?.iconFilterColor}
                                />
                                <Typography className={classes.walletName}>{walletName}</Typography>
                            </Box>
                        :   <ActionButton
                                variant="roundedContained"
                                onClick={() =>
                                    SelectProviderModal.open({ requiredSupportPluginID: NetworkPluginID.PLUGIN_EVM })
                                }>
                                {t.connect()}
                            </ActionButton>
                        }
                        <AccountManager
                            open={!!anchorEl}
                            onClose={() => setAnchorEl(undefined)}
                            anchorEl={anchorEl}
                            walletName={walletName}
                        />
                    </header>

                    <Box
                        className={classes.container}
                        ref={(_: HTMLElement) => {
                            setContainerRef(_)
                        }}>
                        <LiFiWidget
                            integrator="MaskNetwork"
                            config={{ ...widgetConfig, containerRef }}
                            ref={widgetRef}
                        />
                    </Box>
                    <Typography className={classes.powerBy}>
                        {t.powered_by()} <strong>LI.FI</strong>
                    </Typography>
                </div>
            </ChainContextProvider>
            <SwapPageModals />
        </SharedContextProvider>
    )
}
