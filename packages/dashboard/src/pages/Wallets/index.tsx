import {
    getRegisteredWeb3Networks,
    useAccount,
    useChainId,
    useNetworkDescriptor,
    useWallet,
    useWallets,
    useWeb3State as useWeb3PluginState,
    useCurrentWeb3NetworkPluginID,
    useFungibleAssets,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { DashboardRoutes, relativeRouteOf } from '@masknet/shared-base'
import { FungibleToken, NetworkDescriptor, NetworkPluginID } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { PluginMessages } from '../../API'
import { PageFrame } from '../../components/PageFrame'
import { useDashboardI18N } from '../../locales'
import { Assets } from './components/Assets'
import { Balance } from './components/Balance'
import { History } from './components/History'
import { ReceiveDialog } from './components/ReceiveDialog'
import { Transfer } from './components/Transfer'
import { WalletStateBar } from './components/WalletStateBar'
import { useIsMatched } from './hooks'
import { StartUp } from './StartUp'
import { getTokenUSDValue } from './utils/getTokenUSDValue'

const r = relativeRouteOf(DashboardRoutes.Wallets)

function Wallets() {
    const t = useDashboardI18N()
    const wallet = useWallet()
    const wallets = useWallets()
    const navigate = useNavigate()
    const chainId = useChainId()
    const { Asset } = useWeb3PluginState()
    const account = useAccount()
    const network = useNetworkDescriptor()

    const { pathname } = useLocation()
    const isWalletPath = useIsMatched(DashboardRoutes.Wallets)
    const isWalletTransferPath = useIsMatched(DashboardRoutes.WalletsTransfer)
    const isWalletHistoryPath = useIsMatched(DashboardRoutes.WalletsHistory)

    const [receiveOpen, setReceiveOpen] = useState(false)

    const networks = getRegisteredWeb3Networks()
    const pluginId = useCurrentWeb3NetworkPluginID()
    const networkDescriptor = useNetworkDescriptor() as Web3Helper.NetworkDescriptorAll
    const [selectedNetwork, setSelectedNetwork] = useState<Web3Helper.NetworkDescriptorAll | null>(
        networkDescriptor ?? null,
    )

    // const { openDialog: openBuyDialog } = useRemoteControlledDialog(PluginMessages.Transak.buyTokenDialogUpdated)
    // const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const detailedTokens: FungibleToken<number, string>[] = []
    // const { value: detailedTokens } = useAsync(
    //     async () => Asset?.getFungibleAssets?.(chainId, account, network!),
    //     [account, Asset, network],
    // )
    const fungibleAssets = useFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    const renderNetworks = useMemo(() => {
        return networks.filter((x) => pluginId === x.networkSupporterPluginID && x.isMainnet)
    }, [networks, pluginId])

    // If show one network only, set it as default network
    const defaultNetwork = useMemo(() => {
        if (renderNetworks.length !== 1) return null
        return renderNetworks[0]
    }, [renderNetworks])

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

    const balance = useMemo(() => {
        if (!detailedTokens || !detailedTokens.length) return 0

        const values = detailedTokens
            .filter((x) => (selectedNetwork ? x.chainId === selectedNetwork.chainId : true))
            .map((y) => getTokenUSDValue(y.value))
        return BigNumber.sum(...values).toNumber()
    }, [selectedNetwork, detailedTokens])

    const pateTitle = useMemo(() => {
        if (wallets.length === 0) return t.create_wallet_form_title()

        if (isWalletPath) return t.wallets_assets()
        if (isWalletTransferPath) return t.wallets_transfer()
        if (isWalletHistoryPath) return t.wallets_history()

        return t.wallets()
    }, [isWalletPath, isWalletHistoryPath, isWalletTransferPath, wallets.length])

    return (
        <PageFrame title={pateTitle} noBackgroundFill primaryAction={<WalletStateBar />}>
            {!wallet ? (
                <StartUp />
            ) : (
                <>
                    <Balance
                        balance={balance}
                        onSend={() => navigate(DashboardRoutes.WalletsTransfer)}
                        // onBuy={openBuyDialog}
                        // onSwap={openSwapDialog}
                        onBuy={() => {}}
                        onSwap={() => {}}
                        onReceive={() => setReceiveOpen(true)}
                        networks={renderNetworks}
                        selectedNetwork={selectedNetwork}
                        onSelectNetwork={setSelectedNetwork}
                        showOperations={pluginId === NetworkPluginID.PLUGIN_EVM}
                    />
                    <Routes>
                        <Route path="*" element={<Assets network={selectedNetwork} />} />
                        <Route path={r(DashboardRoutes.WalletsTransfer)} element={<Transfer />} />
                        <Route
                            path={r(DashboardRoutes.WalletsHistory)}
                            element={<History selectedChainId={selectedNetwork?.chainId ?? chainId} />}
                        />
                    </Routes>
                </>
            )}
            {wallet ? (
                <ReceiveDialog
                    open={receiveOpen}
                    chainName="Ethereum"
                    walletAddress={wallet.address ?? ''}
                    onClose={() => setReceiveOpen(false)}
                />
            ) : null}
        </PageFrame>
    )
}

export default function () {
    return <Wallets />
}
