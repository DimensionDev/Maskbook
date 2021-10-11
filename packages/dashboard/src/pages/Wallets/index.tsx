import { PageFrame } from '../../components/DashboardFrame'
import {
    ChainId,
    getTokenUSDValue,
    useAssets,
    useChainDetailed,
    useTrustedERC20Tokens,
    useWallet,
    useWallets,
} from '@masknet/web3-shared'
import { StartUp } from './StartUp'
import { TokenAssets } from './components/TokenAssets'
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom'
import { Balance } from './components/Balance'
import { Transfer } from './components/Transfer'
import { History } from './components/History'
import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { ReceiveDialog } from './components/ReceiveDialog'
import { RoutePaths } from '../../type'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages, PluginServices } from '../../API'
import { WalletStateBar } from './components/WalletStateBar'
import { useDashboardI18N } from '../../locales'
import { useAsync } from 'react-use'

function Wallets() {
    const wallet = useWallet()
    const wallets = useWallets()
    const navigate = useNavigate()
    const chain = useChainDetailed()
    const t = useDashboardI18N()

    const isWalletPath = useMatch(RoutePaths.Wallets)
    const isWalletTransferPath = useMatch(RoutePaths.WalletsTransfer)
    const isWalletHistoryPath = useMatch(RoutePaths.WalletsHistory)

    const [receiveOpen, setReceiveOpen] = useState(false)
    const [selectedChainId, setSelectedChainId] = useState<ChainId | null>(null)

    const erc20Tokens = useTrustedERC20Tokens()

    const { openDialog: openBuyDialog } = useRemoteControlledDialog(PluginMessages.Transak.buyTokenDialogUpdated)
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const { value: detailedTokens } = useAssets(erc20Tokens || [], 'all')
    const { value: networks } = useAsync(async () => PluginServices.Wallet.getSupportedNetworks(), [])

    const balance = useMemo(() => {
        return BigNumber.sum
            .apply(
                null,
                detailedTokens.map((asset) => getTokenUSDValue(asset)),
            )
            .toNumber()
    }, [detailedTokens])

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
                        chainName={chain?.name ?? ''}
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
                        <Route path="history" element={<History />} />
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
