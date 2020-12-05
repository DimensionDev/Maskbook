import { makeStyles, createStyles, Paper, IconButton, Typography } from '@material-ui/core'
import { useCallback, useReducer, useState } from 'react'
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

export interface ExchangeTokenItem {
    inputToken: EtherTokenDetailed | ERC20TokenDetailed | null
    inputAmount: string

    outputToken: EtherTokenDetailed | ERC20TokenDetailed | null
    outputAmount: string
    index: number
}

export interface ExchangetokenPanelProps {
    onChange: (item: ExchangeTokenItem) => void
    onAdd: (index: number) => void
    index: number
    showRemove: boolean
    showAdd: boolean
    amount: string
    setAmount: () => void
    token: EtherTokenDetailed | ERC20TokenDetailed | undefined
    setToken: () => void
    label?: string
    exchangeItem?: ExchangeTokenItem
    tokenAmountPanelProps: Partial<TokenAmountPanelProps>
    onRemove: (index: number) => void
}

export function ExchangeTokenPanel(props: ExchangetokenPanelProps) {
    const { onChange, showAdd = true, showRemove = false, label, onRemove, onAdd, token, setToken } = props

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
                excludeTokens={[token?.address]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}

export interface ITOExchangeTokenPanelProps {
    onChange: () => void
    token: EtherTokenDetailed | ERC20TokenDetailed | null
    exchangetokenPanelProps: Partial<ExchangetokenPanelProps>
}
export function ITOExchangeTokenPanel(props: ITOExchangeTokenPanelProps) {
    const [exchangeTokenArray, dispatchExchangeTokenArray] = useReducer((state, action) => {
        switch (action.type) {
            case 'add':
                return [
                    ...state,
                    {
                        id: action.key,
                    },
                ]
            case 'remove':
                return state.filter((_, index) => index !== action.index)
            default:
                return state
        }
    }, [])

    const onAdd = useCallback(() => {
        dispatchExchangeTokenArray({
            type: 'add',
            key: uuid(),
        })
    }, [])

    if (exchangeTokenArray && exchangeTokenArray.length === 0) {
        onAdd()
    }

    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const [token = etherTokenDetailed, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>()

    const [amount, setAmount] = useState('')
    return exchangeTokenArray.map((item, idx) => {
        return (
            <ExchangeTokenPanel
                key={item.key}
                exchangeToken={}
                onChange={}
                token={token}
                setToken={setToken}
                showRemove={idx < exchangeTokenArray.length && exchangeTokenArray.length !== 1}
                showAdd={idx === exchangeTokenArray.length - 1}
                {...props.exchangetokenPanelProps}
                onRemove={() => dispatchExchangeTokenArray({ type: 'remove', index: idx })}
                onAdd={onAdd}
                tokenAmountPanelProps={{
                    InputProps: {
                        startAdornment: <Typography>1{props.token?.symbol}=</Typography>,
                    },
                }}
            />
        )
    })
}
