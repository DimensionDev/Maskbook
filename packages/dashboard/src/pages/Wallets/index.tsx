import { useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import {
    ChainId,
    getTokenUSDValue,
    useAssets,
    useChainId,
    useWallet,
    useWallets,
    useWeb3State,
} from '@masknet/web3-shared-evm'
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
import { PluginMessages, PluginServices } from '../../API'
import { WalletStateBar } from './components/WalletStateBar'
import { useDashboardI18N } from '../../locales'
import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'

function Wallets() {
    const wallet = useWallet()
    const wallets = useWallets()
    const navigate = useNavigate()
    const t = useDashboardI18N()
    const currentChainId = useChainId()
    const trustedERC20Tokens = useWeb3State().erc20Tokens

    const { pathname } = useLocation()
    const isWalletPath = useMatch(RoutePaths.Wallets)
    const isWalletTransferPath = useMatch(RoutePaths.WalletsTransfer)
    const isWalletHistoryPath = useMatch(RoutePaths.WalletsHistory)

    const [receiveOpen, setReceiveOpen] = useState(false)
    const [selectedChainId, setSelectedChainId] = useState<ChainId | null>(null)

    const { openDialog: openBuyDialog } = useRemoteControlledDialog(PluginMessages.Transak.buyTokenDialogUpdated)
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const networks = getRegisteredWeb3Networks()
    const { value: detailedTokens } = useAssets(
        trustedERC20Tokens.filter((x) => !selectedChainId || x.chainId === selectedChainId) || [],
        selectedChainId === null ? 'all' : selectedChainId,
    )

    useEffect(() => {
        if (isWalletPath) return
        setSelectedChainId(currentChainId)
    }, [currentChainId])

    useEffect(() => {
        if (isWalletTransferPath || isWalletHistoryPath) {
            setSelectedChainId(currentChainId)
            return
        }
        setSelectedChainId(null)
    }, [pathname])

    const balance = useMemo(() => {
        return BigNumber.sum
            .apply(
                null,
                detailedTokens.map((asset) => getTokenUSDValue(asset)),
            )
            .toNumber()
    }, [detailedTokens, selectedChainId])

    const pateTitle = useMemo(() => {
        if (wallets.length === 0) return t.create_wallet_form_title()

        if (isWalletPath) return t.wallets_assets()
        if (isWalletTransferPath) return t.wallets_transfer()
        if (isWalletHistoryPath) return t.wallets_history()

        return t.wallets()
    }, [isWalletTransferPath, isWalletHistoryPath, isWalletPath, wallets.length])

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
                        networks={networks ?? []}
                        onSelectNetwork={(chainId) => setSelectedChainId(chainId)}
                        selectedChainId={selectedChainId}
                    />
                    <Routes>
                        <Route path="/" element={<TokenAssets selectedChainId={selectedChainId} />} />
                        <Route path="transfer" element={<Transfer />} />
                        <Route
                            path="history"
                            element={<History selectedChainId={selectedChainId ?? currentChainId} />}
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
