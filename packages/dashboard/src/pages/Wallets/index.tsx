import { Box } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { getTokenUSDValue, useAssets, useTrustedERC20Tokens, useWallet, useWallets } from '@masknet/web3-shared'
import { StartUp } from './StartUp'
import { TokenAssets } from './components/TokenAssets'
import { Route, Routes, useNavigate } from 'react-router'
import { Balance } from './components/Balance'
import { Transfer } from './components/Transfer'
import { History } from './components/History'
import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { ReceiveDialog } from './components/ReceiveDialog'
import { RoutePaths } from '../../type'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../API'
import { WalletStateBar } from './components/WalletStateBar'
import { useDashboardI18N } from '../../locales'

function Wallets() {
    const wallet = useWallet()
    const wallets = useWallets()
    const navigate = useNavigate()
    const t = useDashboardI18N()

    const [receiveOpen, setReceiveOpen] = useState(false)

    const erc20Tokens = useTrustedERC20Tokens()

    const { openDialog: openBuyDialog } = useRemoteControlledDialog(PluginMessages.Transak.buyTokenDialogUpdated)
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginMessages.Swap.swapDialogUpdated)

    const { value: detailedTokens } = useAssets(erc20Tokens || [])

    const balance = useMemo(() => {
        return BigNumber.sum
            .apply(
                null,
                detailedTokens.map((asset) => getTokenUSDValue(asset)),
            )
            .toNumber()
    }, [detailedTokens])

    return (
        <PageFrame
            title={wallets.length === 0 ? t.create_wallet_form_title() : t.wallets()}
            noBackgroundFill
            primaryAction={<WalletStateBar />}>
            {wallets.length === 0 ? (
                <StartUp />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Balance
                        balance={balance}
                        onSend={() => navigate(RoutePaths.WalletsTransfer)}
                        onBuy={openBuyDialog}
                        onSwap={openSwapDialog}
                        onReceive={() => setReceiveOpen(true)}
                    />
                    <Routes>
                        <Route path="/" element={<TokenAssets />} />
                        <Route path="transfer" element={<Transfer />} />
                        <Route path="history" element={<History />} />
                    </Routes>
                </Box>
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
