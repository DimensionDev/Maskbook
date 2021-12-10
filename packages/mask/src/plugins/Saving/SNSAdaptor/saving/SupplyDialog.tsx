import { useState } from 'react'
import { ChainId, EthereumTokenType, useAccount, useChainId, useChainIdValid, useWeb3 } from '@masknet/web3-shared-evm'
import { Button, DialogContent } from '@mui/material'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox'
import type { CompoundMarket } from '../../contracts/compound/useCompound'
import { TokenAmountPanel } from '@masknet/shared'
import { useSupplyCallback } from '../../contracts/compound/callCompound'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
    },
    indicator: {
        display: 'none',
    },
    content: {
        paddingTop: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface SupplyDialogProps {
    open?: boolean
    onClose?: () => void
    market: CompoundMarket
}

export function SupplyDialog({ open, onClose, market }: SupplyDialogProps) {
    const { t } = useI18N()
    const isDashboard = location.href.includes('dashboard.html')
    const { classes } = useStyles({ isDashboard })
    const currentChainId = useChainId()
    const [amount, setAmount] = useState('')
    const account = useAccount()
    const web3 = useWeb3()
    const [supplyMarket] = useSupplyCallback()
    const chainIdValid = useChainIdValid()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    return (
        <InjectedDialog
            open={!!open}
            onClose={() => {
                onClose?.()
            }}
            title="Supply">
            <DialogContent className={classes.content}>
                {!isDashboard ? (
                    <div className={classes.walletStatusBox}>
                        <WalletStatusBox />
                    </div>
                ) : null}
                <TokenAmountPanel
                    amount={amount}
                    // maxAmount={maxAmount}
                    balance={market.underlying.balance!}
                    label=""
                    token={{
                        type: EthereumTokenType.ERC20,
                        address: market.underlying.address,
                        chainId: ChainId.Mainnet,
                        name: market.underlying.name,
                        decimals: market.underlying.decimals,
                        symbol: market.underlying.symbol,
                    }}
                    onAmountChange={setAmount}
                />
                <br />
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={async () => {
                        await supplyMarket(market, amount)
                        onClose?.()
                    }}>
                    Supply
                </Button>
            </DialogContent>
        </InjectedDialog>
    )
}
