import { useState } from 'react'
import { ChainId, EthereumTokenType } from '@masknet/web3-shared-evm'
import { Button, DialogContent } from '@mui/material'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox'
import type { CompoundMarket } from '../../contracts/compound/useCompound'
import { TokenAmountPanel } from '@masknet/shared'
import { useRedemCallback } from '../../contracts/compound/callCompound'

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

export function WithdrawDialog({ open, onClose, market }: SupplyDialogProps) {
    const { t } = useI18N()
    const isDashboard = location.href.includes('dashboard.html')
    const { classes } = useStyles({ isDashboard })
    const [amount, setAmount] = useState('')
    const [redeemMarket] = useRedemCallback()

    console.log(market)
    return (
        <InjectedDialog
            open={!!open}
            onClose={() => {
                onClose?.()
                // closeDialog()
            }}
            title="Withdraw">
            <DialogContent className={classes.content}>
                {!isDashboard ? (
                    <div className={classes.walletStatusBox}>
                        <WalletStatusBox />
                    </div>
                ) : null}
                <TokenAmountPanel
                    amount={amount}
                    balance={market.cToken.balance!}
                    label=""
                    token={{
                        type: EthereumTokenType.ERC20,
                        address: market.cToken.address,
                        chainId: ChainId.Mainnet,
                        name: market.cToken.name,
                        decimals: market.cToken.decimals,
                        symbol: market.cToken.symbol,
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
                        await redeemMarket(market, amount)
                        onClose?.()
                    }}>
                    Withdraw
                </Button>
            </DialogContent>
        </InjectedDialog>
    )
}
