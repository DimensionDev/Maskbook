import { Box, Button } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'
import { useWallets, useTrustedERC20Tokens, useAssets, getTokenUSDValue, useWallet } from '@dimensiondev/web3-shared'
import { StartUp } from './StartUp'
import { TokenAssets } from './components/TokenAssets'
import { Route, Switch, useRouteMatch } from 'react-router'
import { Balance } from './components/Balance'
import { Routes } from '../../type'
import { Transfer } from './components/Transfer'
import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { ReceiveDialog } from './components/ReceiveDialog'

function Wallets() {
    const wallet = useWallet()
    const wallets = useWallets()
    const [receiveOpen, setReceiveOpen] = useState(false)
    const { path } = useRouteMatch()

    const erc20Tokens = useTrustedERC20Tokens()

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
            title={wallets.length === 0 ? 'Create a Wallet' : 'Market'}
            noBackgroundFill
            primaryAction={<Button>Connect Wallet</Button>}>
            {wallets.length === 0 ? (
                <StartUp />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Balance
                        balance={balance}
                        onSend={() => {}}
                        onBuy={() => {}}
                        onSwap={() => {}}
                        onReceive={() => setReceiveOpen(true)}
                    />
                    <Switch>
                        <Route exact path={path} children={<TokenAssets />}></Route>
                        <Route exact path={Routes.WalletsTransfer} children={<Transfer />} />
                    </Switch>
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
