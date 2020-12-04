import { makeStyles, createStyles } from '@material-ui/core'
import { useCallback, useState } from 'react'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'

import { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
        },

        input: {},
        iconButton: {},
    }),
)

export interface ExchangeTokens {
    token: EtherTokenDetailed | ERC20TokenDetailed
    amount: string
}

export interface ITOExchangeTokenPanelProps {
    exchangeTokenArray: ExchangeTokens[]
}

function ExchangeTokenPanel(exchangeToken: ExchangeTokens | null) {
    //#region select token
    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const [token = etherTokenDetailed, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>()
    const [openSelectERC20TokenDialog, setOpenSelectERC20TokenDialog] = useState(false)
    const onTokenChipClick = useCallback(() => {
        setOpenSelectERC20TokenDialog(true)
    }, [])
    const onSelectERC20TokenDialogClose = useCallback(() => {
        setOpenSelectERC20TokenDialog(false)
    }, [])
    const onSelectERC20TokenDialogSubmit = useCallback(
        (token: EtherTokenDetailed | ERC20TokenDetailed) => {
            setToken(token)
            onSelectERC20TokenDialogClose()
        },
        [onSelectERC20TokenDialogClose],
    )
    //#endregion
    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    //#endregion

    return (
        <>
            <TokenAmountPanel
                classes={{ root: classes.input }}
                label="Swap Ration"
                amount={amount}
                balance={tokenBalance}
                token={token}
                onAmountChange={setAmount}
                SelectTokenChip={{
                    loading: loadingTokenBalance,
                    ChipProps: {
                        onClick: onTokenChipClick,
                    },
                }}
            />
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[token?.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}

export function ITOExchangeTokenPanel(props: ITOExchangeTokenPanelProps) {
    const { exchangeTokenArray } = props

    const { amount, setAmount } = useState('0')

    if (exchangeTokenArray.length === 0) {
        return ExchangeTokenPanel()
    }

    return exchangeTokenArray.map((exchangeToken, idx) => {})
}
