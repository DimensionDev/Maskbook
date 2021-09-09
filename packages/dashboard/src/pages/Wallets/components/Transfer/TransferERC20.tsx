import { MaskTextField } from '@masknet/theme'
import { Box, Button, Stack } from '@material-ui/core'
import { memo, useCallback, useMemo, useState } from 'react'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    isGreaterThan,
    isZero,
    TransactionStateType,
    useFungibleTokenBalance,
    useGasPrice,
    useTokenTransferCallback,
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { TokenAmountPanel } from '@masknet/shared'
import { SelectTokenDialog } from '../SelectTokenDialog'
import { useDashboardI18N } from '../../../../locales'
import { EthereumAddress } from 'wallet.ts'

interface TransferERC20Props {
    token: FungibleTokenDetailed
}

export const TransferERC20 = memo<TransferERC20Props>(({ token }) => {
    const t = useDashboardI18N()
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [memo, setMemo] = useState('')
    const [selectedToken, setToken] = useState<FungibleTokenDetailed>(token)
    const [isSelectToken, setSelectToken] = useState(false)

    // gas price
    const { value: gasPrice = '0' } = useGasPrice()

    // balance
    const { value: tokenBalance = '0', retry: tokenBalanceRetry } = useFungibleTokenBalance(
        selectedToken?.type ?? EthereumTokenType.Native,
        selectedToken?.address ?? '',
    )

    // transfer amount
    const transferAmount = useMemo(() => {
        let amount_ = new BigNumber(amount || '0')
        amount_ =
            selectedToken.type === EthereumTokenType.Native
                ? amount_.minus(new BigNumber(30000).multipliedBy(gasPrice))
                : amount_
        return amount_.toFixed()
    }, [tokenBalance, gasPrice, selectedToken?.type, amount])

    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        selectedToken.type,
        selectedToken.address,
        transferAmount,
        address,
        memo,
    )

    console.log(transferState)

    const onTransfer = useCallback(async () => {
        await transferCallback()
    }, [transferCallback])

    //#region validation
    const validationMessage = useMemo(() => {
        if (!transferAmount || isZero(transferAmount)) return t.wallets_transfer_error_amount_absence()
        if (isGreaterThan(transferAmount, tokenBalance))
            return t.wallets_transfer_error_insufficient_balance({ symbol: selectedToken.symbol ?? '' })
        if (!address) return t.wallets_transfer_error_address_absence()
        if (!EthereumAddress.isValid(address)) return t.wallets_transfer_error_invalid_address()
        return ''
    }, [transferAmount, address, tokenBalance, selectedToken])
    //#endregion

    return (
        <Stack direction="row" justifyContent="center" mt={4}>
            <Stack maxWidth={640} minWidth={500} alignItems="center">
                <Box width="100%">
                    <MaskTextField
                        onChange={(e) => setAddress(e.currentTarget.value)}
                        label={t.wallets_transfer_to_address()}
                    />
                </Box>
                <Box mt={2} width="100%">
                    <TokenAmountPanel
                        amount={amount}
                        maxAmount={transferAmount}
                        balance={tokenBalance}
                        label={t.wallets_transfer_amount()}
                        token={selectedToken}
                        onAmountChange={setAmount}
                        SelectTokenChip={{
                            loading: false,
                            ChipProps: {
                                onClick: () => setSelectToken(true),
                            },
                        }}
                    />
                </Box>
                <Box mt={2} width="100%">
                    <MaskTextField onChange={(e) => setMemo(e.currentTarget.value)} label={t.wallets_transfer_memo()} />
                </Box>
                <Box mt={4}>
                    <Button
                        sx={{ width: 240 }}
                        disabled={
                            !!validationMessage || transferState.type === TransactionStateType.WAIT_FOR_CONFIRMING
                        }
                        onClick={onTransfer}>
                        {validationMessage || t.wallets_transfer_send()}
                    </Button>
                </Box>
            </Stack>
            {isSelectToken && (
                <SelectTokenDialog
                    onSelect={(token) => {
                        setToken(token!)
                        setSelectToken(false)
                    }}
                    open={isSelectToken}
                    onClose={() => setSelectToken(false)}
                />
            )}
        </Stack>
    )
})
