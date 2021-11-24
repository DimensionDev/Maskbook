import { useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3State } from '@masknet/web3-shared-evm'
import { StartUp } from './StartUp'
import { TokenAssets } from './components/TokenAssets'
import { Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { Balance } from './components/Balance'
import { Transfer } from './components/Transfer'
import { History } from './components/History'
import { PageFrame } from '../../components/PageFrame'
import { ReceiveDialog } from './components/ReceiveDialog'
import { RoutePaths } from '../../type'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../API'
import { WalletStateBar } from './components/WalletStateBar'
import { useDashboardI18N } from '../../locales'
import {
    getRegisteredWeb3Networks,
    useAccount,
    useChainId,
    useNetworkDescriptor,
    usePluginIDContext,
    useWallet,
    useWallets,
    useWeb3State as useWeb3PluginState,
    Web3Plugin,
} from '@masknet/plugin-infra'
import { useAsync } from 'react-use'
import { getTokenUSDValue } from './utils/getTokenUSDValue'

function Wallets() {
    const wallet = useWallet()
    const wallets = useWallets()
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const currentChainId = useChainId()
    const { Asset } = useWeb3PluginState()
    const account = useAccount()
    const { portfolioProvider } = useWeb3State()
    const network = useNetworkDescriptor()

    const { pathname } = useLocation()
    const isWalletPath = useMatch(RoutePaths.Wallets)
    const isWalletTransferPath = useMatch(RoutePaths.WalletsTransfer)
    const isWalletHistoryPath = useMatch(RoutePaths.WalletsHistory)

    const [receiveOpen, setReceiveOpen] = useState(false)

    const networks = getRegisteredWeb3Networks()
    const networkDescriptor = useNetworkDescriptor()
    const pluginId = usePluginIDContext()
    const [selectedNetwork, setSelectedNetwork] = useState<Web3Plugin.NetworkDescriptor | null>(
        networkDescriptor ?? null,
    )

    const { openDialog: openBuyDialog } = useRemoteControlledDialog(PluginMessages.Transak.buyTokenDialogUpdated)
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const { value: detailedTokens } = useAsync(
        async () => Asset?.getFungibleAssets?.(account, portfolioProvider, network!),
        [account, Asset, portfolioProvider, network],
    )

    useEffect(() => {
        if (isWalletPath) return
        setSelectedNetwork(networkDescriptor ?? null)
    }, [networkDescriptor])

    useEffect(() => {
        if (isWalletTransferPath || isWalletHistoryPath) {
            setSelectedNetwork(networkDescriptor ?? null)
            return
        }
        setSelectedNetwork(null)
    }, [pathname])

    const balance = useMemo(() => {
        return BigNumber.sum.apply(null, detailedTokens?.map((asset) => getTokenUSDValue(asset.value)) ?? []).toNumber()
    }, [detailedTokens])

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
                        onSend={() => navigate(RoutePaths.WalletsTransfer)}
                        onBuy={openBuyDialog}
                        onSwap={openSwapDialog}
                        onReceive={() => setReceiveOpen(true)}
                        networks={networks}
                        selectedNetwork={selectedNetwork}
                        onSelectNetwork={setSelectedNetwork}
                        pluginId={pluginId}
                    />
                    <Routes>
                        <Route path="/" element={<TokenAssets network={selectedNetwork} />} />
                        <Route path="transfer" element={<Transfer />} />
                        <Route
                            path="history"
                            element={<History selectedChainId={selectedNetwork?.chainId ?? currentChainId} />}
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
export { getTokenUSDValue } from './utils/getTokenUSDValue'
