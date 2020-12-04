import { makeStyles, createStyles, Paper, IconButton, Typography } from '@material-ui/core'
import { useCallback, useState, useEffect } from 'react'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'

import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import type { TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'

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

export interface ExchangetokenPanelProps {
    onChange?: (item: ExchangeTokenItem, index: number) => void
    onAdd: () => void
    index: number
    showRemove: boolean
    showAdd: boolean
    label?: string
    exchangeItem?: ExchangeTokenItem
    tokenAmountPanelProps: Partial<TokenAmountPanelProps>
    onRemove: (index: number) => void
}

export function ExchangeTokenPanel(props: ExchangetokenPanelProps) {
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

    useEffect(() => {
        if (exchangeItem) {
            setToken(exchangeItem.token)
        }
    }, [exchangeItem])

    //#endregion
    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    //#endregion

    const onRemoveClicked = useCallback(() => {
        onRemove(props.index)
    }, [])

    const setAmount = (amount: string) => {
        console.log(amount)
    }
    return (
        <>
            <Paper className={classes.line}>
                <TokenAmountPanel
                    classes={{ root: classes.input }}
                    label={props.label}
                    amount={exchangeItem?.amount}
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
                    <IconButton onClick={onRemoveClicked} className={classes.button}>
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
    const [exchangeTokenArray, setExchangeTokenArray] = useState([])

    const onRemove = (index) => {
        console.log('onRemove')
        const arr = [...exchangeTokenArray]
        arr.splice(index, 1)
        setExchangeTokenArray(arr)
    }

    const onAdd = useCallback(() => {
        console.log('onAdd')
        const arr = [...exchangeTokenArray]
        arr.push({
            amount: '0',
            token: null,
        })
        setExchangeTokenArray(arr)
    }, [])

    if (!exchangeTokenArray || exchangeTokenArray.length === 0) {
        onAdd()
    }

    const AddExchangeToken = (item: ExchangeTokenItem, index: number) => {
        const arr = [...exchangeTokenArray]
        arr[index] = item
        setExchangeTokenArray(arr)
    }

    return exchangeTokenArray.map((exchangeToken, idx) => {
        return (
            <ExchangeTokenPanel
                exchangeToken={exchangeToken}
                onChange={AddExchangeToken}
                index={idx}
                showRemove={idx < exchangeTokenArray.length && exchangeTokenArray.length !== 1}
                showAdd={idx === exchangeTokenArray.length - 1}
                {...props.exchangetokenPanelProps}
                onRemove={onRemove}
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
