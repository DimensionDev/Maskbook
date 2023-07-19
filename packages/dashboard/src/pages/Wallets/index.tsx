import { useEffect, useMemo, useState, useCallback } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { PluginTransakMessages } from '@masknet/plugin-transak'
import { useChainContext, useNetworkDescriptor, useNetworkContext, useWallets } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { DashboardRoutes, relativeRouteOf, CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, createNativeToken, type SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleToken, NonFungibleToken } from '@masknet/web3-shared-base'
import { useDashboardI18N } from '../../locales/index.js'
import { PageFrame } from '../../components/PageFrame/index.js'
import { Assets } from './components/Assets/index.js'
import { Balance } from './components/Balance/index.js'
import { History } from './components/History/index.js'
import { ReceiveDialog } from './components/ReceiveDialog/index.js'
import { Transfer, TransferTab } from './components/Transfer/index.js'
import { WalletStateBar } from './components/WalletStateBar/index.js'
import { useIsMatched } from './hooks/index.js'
import { Context } from './hooks/useContext.js'
import { StartUp } from './StartUp.js'

const r = relativeRouteOf(DashboardRoutes.Wallets)

function Wallets() {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { account, chainId } = useChainContext()
    const wallets = useWallets()

    const { pathname, state } = useLocation() as {
        state: {
            token?: FungibleToken<ChainId, SchemaType>
            nonFungibleToken?: NonFungibleToken<ChainId, SchemaType>
            type?: TransferTab
        } | null
        pathname: string
    }
    const isWalletPath = useIsMatched(DashboardRoutes.Wallets)
    const isWalletTransferPath = useIsMatched(DashboardRoutes.WalletsTransfer)
    const isWalletHistoryPath = useIsMatched(DashboardRoutes.WalletsHistory)

    const [receiveOpen, setReceiveOpen] = useState(false)

    const { pluginID } = useNetworkContext()
    const networks = getRegisteredWeb3Networks(pluginID).filter((x) => x.isMainnet)

    // If show one network only, set it as default network
    const defaultNetwork = networks.length !== 1 ? null : networks[0]

    const networkDescriptor = useNetworkDescriptor(
        NetworkPluginID.PLUGIN_EVM,
        (state?.type === TransferTab.Token ? state?.token?.chainId : state?.nonFungibleToken?.chainId) ??
            ChainId.Mainnet,
    )
    const [selectedNetwork, setSelectedNetwork] = useState<Web3Helper.NetworkDescriptorAll | null>(
        networkDescriptor ?? null,
    )

    const { openDialog: openBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const openSwapDialog = useCallback(() => {
        CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
            open: true,
        })
    }, [])

    useEffect(() => {
        if (isWalletPath) return
        setSelectedNetwork(networkDescriptor || defaultNetwork)
    }, [isWalletPath, networkDescriptor, defaultNetwork])

    useEffect(() => {
        if (isWalletTransferPath || isWalletHistoryPath) {
            setSelectedNetwork(networkDescriptor || defaultNetwork)
            return
        }
        setSelectedNetwork(defaultNetwork)
    }, [pathname, defaultNetwork])

    const pateTitle = useMemo(() => {
        if (!account && wallets.length === 0) return t.create_wallet_form_title()
        if (isWalletPath) return t.wallets_assets()
        if (isWalletTransferPath) return t.wallets_transfer()
        if (isWalletHistoryPath) return t.wallets_history()

        return t.wallets()
    }, [isWalletPath, isWalletHistoryPath, isWalletTransferPath, account, wallets.length])

    return (
        <PageFrame title={pateTitle} noBackgroundFill primaryAction={<WalletStateBar />}>
            {!account ? (
                <StartUp />
            ) : (
                <Context.Provider
                    initialState={{
                        setSelectedNetwork,
                        chainId: selectedNetwork?.chainId,
                        pluginID: NetworkPluginID.PLUGIN_EVM,
                        connectedChainId: chainId,
                    }}>
                    <Balance
                        onSend={() =>
                            navigate(DashboardRoutes.WalletsTransfer, {
                                state: {
                                    type: TransferTab.Token,
                                    token: createNativeToken((selectedNetwork?.chainId ?? chainId) as ChainId),
                                },
                            })
                        }
                        onBuy={openBuyDialog}
                        onSwap={openSwapDialog}
                        onReceive={() => setReceiveOpen(true)}
                        networks={networks}
                        selectedNetwork={selectedNetwork}
                        onSelectNetwork={setSelectedNetwork}
                        showOperations={pluginID === NetworkPluginID.PLUGIN_EVM}
                    />
                    <Routes>
                        <Route path="*" element={<Assets network={selectedNetwork} />} />
                        <Route path={r(DashboardRoutes.WalletsTransfer)} element={<Transfer />} />
                        <Route
                            path={r(DashboardRoutes.WalletsHistory)}
                            element={<History selectedChainId={selectedNetwork?.chainId ?? chainId} />}
                        />
                    </Routes>
                </Context.Provider>
            )}
            {account ? (
                <ReceiveDialog open={receiveOpen} address={account} onClose={() => setReceiveOpen(false)} />
            ) : null}
        </PageFrame>
    )
}

export default function () {
    return <Wallets />
}
