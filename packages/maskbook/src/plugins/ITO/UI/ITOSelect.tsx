import { makeStyles, createStyles, Paper, IconButton } from '@material-ui/core'
import { useCallback, useState } from 'react'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'

import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        line: {
            margin: theme.spacing(1),
            display: 'flex',
        },
        input: {
            flex: 1,
        },
        button: {
            borderRadius: 10,
        },
    }),
)

export interface ExchangeTokenItem {
    token: EtherTokenDetailed | ERC20TokenDetailed | null
    amount: string
}

export interface ExchangetokenPanelUIProps {
    onChange: () => void
    onAdd: () => void
    index: number
    showRemove: boolean
    showAdd: boolean
    label?: string
    exchangeItem: ExchangeTokenItem
    onRemove: (index: number, exchangeItem: ExchangeTokenItem | null) => void
}

function ExchangeTokenPanelUI(props: ExchangetokenPanelUIProps) {
    const { onChange, showAdd = true, showRemove = false, label, exchangeItem, onRemove, onAdd } = props

    const classes = useStyles()
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

    const [amount, setAmount] = useState('')

    return (
        <>
            <div>
                <Paper className={classes.line}>
                    <TokenAmountPanel
                        classes={{ root: classes.input }}
                        label={props.label}
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
                    {showAdd ? (
                        <IconButton onClick={onAdd} className={classes.button}>
                            <AddIcon />
                        </IconButton>
                    ) : (
                        ''
                    )}
                    {showRemove ? (
                        <IconButton onclick={onRemove} className={classes.button}>
                            <RemoveIcon />
                        </IconButton>
                    ) : (
                        ''
                    )}
                </Paper>
            </div>
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[token?.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}

export interface ITOExchangeTokenPanelProps {
    onChange: () => void
    exchangetokenPanelUIProps: Partial<ExchangetokenPanelUIProps>
}
export function ITOExchangeTokenPanel(props: ITOExchangeTokenPanelProps) {
    const [exchangeTokenArray, setExchangeTokens] = useState([])
    const onRemove = useCallback((index: number) => {
        exchangeTokenArray.splice(index, 1)
    }, [])
    const onAdd = useCallback(() => {
        console.log('onAdd')
        exchangeTokenArray.push({
            amount: '0',
            token: null,
        })
    }, [])

    if (!exchangeTokenArray || exchangeTokenArray.length === 0) {
        onAdd()
    }
    return exchangeTokenArray.map((exchangeToken, idx) => {
        return (
            <ExchangeTokenPanelUI
                exchangeToken={exchangeToken}
                onChangeToken={}
                index={idx}
                showRemove={idx < exchangeTokenArray.length && exchangeTokenArray.length !== 1}
                showAdd={idx === exchangeTokenArray.length - 1}
                {...props.exchangetokenPanelUIProps}
                onRemove={onRemove}
                onAdd={onAdd}
            />
        )
    })
}
