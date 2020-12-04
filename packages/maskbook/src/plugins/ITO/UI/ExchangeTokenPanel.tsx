import { makeStyles, createStyles, Paper, IconButton, Typography } from '@material-ui/core'
import { useCallback, useEffect, useReducer, useState } from 'react'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'

import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import type { TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { v4 as uuid } from 'uuid'

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

export interface ExchangeTokenAmount {
    token: EtherTokenDetailed | ERC20TokenDetailed
    amount: string
}

interface stateExchangeTokeAmount extends ExchangeTokenAmount {
    id: string
}

export interface ExchangetokenPanelUIProps {
    onAmountChange: (amount: string, key: string) => void
    inputAmount: string

    exchangeToken: EtherTokenDetailed | ERC20TokenDetailed | undefined
    onExchangeTokenChange: (token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => void

    onAdd: () => void
    onRemove: () => void

    dataIndex: string

    showRemove: boolean
    showAdd: boolean

    label?: string

    tokenAmountPanelProps: Partial<TokenAmountPanelProps>
}

export function ExchangeTokenPanelUI(props: ExchangetokenPanelUIProps) {
    const {
        onAmountChange,
        dataIndex,
        inputAmount,

        exchangeToken,
        onExchangeTokenChange,

        showAdd = true,
        showRemove = false,
        label,
        onRemove,
        onAdd,
    } = props

    const classes = useStyles()
    //#region select token

    const [openSelectERC20TokenDialog, setOpenSelectERC20TokenDialog] = useState(false)
    const onTokenChipClick = useCallback(() => {
        setOpenSelectERC20TokenDialog(true)
    }, [])
    const onSelectERC20TokenDialogClose = useCallback(() => {
        setOpenSelectERC20TokenDialog(false)
    }, [])
    const onSelectERC20TokenDialogSubmit = useCallback(
        (token: EtherTokenDetailed | ERC20TokenDetailed) => {
            onExchangeTokenChange(token, dataIndex)
            onSelectERC20TokenDialogClose()
        },
        [dataIndex, onExchangeTokenChange, onSelectERC20TokenDialogClose],
    )

    //#endregion
    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        exchangeToken?.type ?? EthereumTokenType.Ether,
        exchangeToken?.address ?? '',
    )
    //#endregion

    const [inputAmountForUI, setInputAmountForUI] = useState('')
    useEffect(() => {
        setInputAmountForUI(inputAmount)
    }, [inputAmount])

    const onAmountChangeForUI = useCallback(
        (amount: string) => {
            onAmountChange(amount, dataIndex)
        },
        [dataIndex, onAmountChange],
    )
    return (
        <>
            <Paper className={classes.line}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label={props.label ?? ''}
                    amount={inputAmountForUI}
                    balance={tokenBalance}
                    token={exchangeToken}
                    onAmountChange={onAmountChangeForUI}
                    SelectTokenChip={{
                        loading: loadingTokenBalance,
                        ChipProps: {
                            onClick: onTokenChipClick,
                        },
                    }}
                    {...props.tokenAmountPanelProps}
                />
                {showAdd ? (
                    <IconButton onClick={onAdd} className={classes.button}>
                        <AddIcon />
                    </IconButton>
                ) : (
                    ''
                )}
                {showRemove ? (
                    <IconButton onClick={onRemove} className={classes.button}>
                        <RemoveIcon />
                    </IconButton>
                ) : (
                    ''
                )}
            </Paper>
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[exchangeToken?.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}

export interface ExchangeTokenPanelProps {
    originToken: EtherTokenDetailed | ERC20TokenDetailed | undefined
    onChange: (data: any) => void
    exchangetokenPanelProps: Partial<ExchangetokenPanelUIProps>
}
export function ExchangeTokenPanel(props: ExchangeTokenPanelProps) {
    const { onChange } = props

    const [exchangeTokenArray, dispatchExchangeTokenArray] = useReducer((state, action) => {
        switch (action.type) {
            case 'add':
                return [
                    ...state,
                    {
                        id: action.key,
                        token: action.token,
                        amount: action.amount,
                    },
                ]
            case 'remove':
                return state.filter((item) => item.id !== action.key)

            case 'update_amount': {
                console.log(action)

                state = state.map((item) => (item.id === action.key ? { ...item, amount: action.amount } : item))
                return state
            }

            case 'update_token': {
                return state.map((item) => (item.id === action.key ? { ...item, token: action.token } : item))
            }
            default:
                return state
        }
    }, [])

    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const [token = etherTokenDetailed, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>()

    const onAdd = useCallback(() => {
        dispatchExchangeTokenArray({
            type: 'add',
            key: uuid(),
            token: {
                address: '0x',
                decimals: 18,
                symbol: 'MASK',
                name: 'Ether',
            },
            amount: '0',
        })
    }, [])

    if (exchangeTokenArray && exchangeTokenArray.length === 0) {
        onAdd()
    }

    const onAmountChange = useCallback((amount: string, key: string) => {
        dispatchExchangeTokenArray({
            type: 'update_amount',
            amount,
            key,
        })
    }, [])

    const onTokenChange = useCallback((token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => {
        dispatchExchangeTokenArray({
            type: 'update_token',
            token,
            key,
        })
    }, [])

    useEffect(() => {
        if (exchangeTokenArray?.length > 0) {
            const arr = exchangeTokenArray.map((item) => [item.amount, item.token])
            onChange(arr)
        }
    }, [exchangeTokenArray, onChange])

    return exchangeTokenArray.map((item, idx) => {
        return (
            <ExchangeTokenPanelUI
                dataIndex={item.id}
                inputAmount={item.amount}
                onAmountChange={onAmountChange}
                exchangeToken={item.token}
                onExchangeTokenChange={onTokenChange}
                showRemove={idx < exchangeTokenArray.length && exchangeTokenArray.length !== 1}
                showAdd={idx === exchangeTokenArray.length - 1}
                {...props.exchangetokenPanelProps}
                onRemove={() => dispatchExchangeTokenArray({ type: 'remove', key: item.id })}
                onAdd={onAdd}
                tokenAmountPanelProps={{
                    InputProps: {
                        startAdornment: <Typography>1{props.originToken?.symbol}=</Typography>,
                    },
                }}
            />
        )
    })
}
