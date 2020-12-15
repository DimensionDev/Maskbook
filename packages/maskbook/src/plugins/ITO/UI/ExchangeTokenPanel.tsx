import { makeStyles, createStyles, Paper, IconButton } from '@material-ui/core'
import { useCallback, useEffect, useState } from 'react'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'

import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import AddIcon from '@material-ui/icons/AddOutlined'
import RemoveIcon from '@material-ui/icons/RemoveOutlined'
import type { TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { v4 as uuid } from 'uuid'
import { ITO_EXCHANGE_RATION_MAX } from '../constants'
import { ExchangeTokenAndAmountActionType, useExchangeTokenAndAmount } from '../api/useExchangeTokenAmountstate'
import { useI18N } from '../../../utils/i18n-next-ui'

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
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        flow: {
            margin: theme.spacing(1),
            textAlign: 'center',
        },
        button: {
            margin: theme.spacing(1),
            borderRadius: 10,
        },
    }),
)

export interface ExchangetokenPanelProps {
    onAmountChange: (amount: string, key: string) => void
    inputAmount: string

    viewBalance: boolean

    exchangeToken: EtherTokenDetailed | ERC20TokenDetailed | undefined
    onExchangeTokenChange: (token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => void

    onAdd: () => void
    onRemove: () => void
    dataIndex: string

    showRemove: boolean
    showAdd: boolean

    label: string
    excludeTokensAddress?: string[]

    tokenAmountPanelProps: Partial<TokenAmountPanelProps>
}

export function ExchangeTokenPanel(props: ExchangetokenPanelProps) {
    const {
        onAmountChange,
        dataIndex,
        inputAmount,
        viewBalance,
        exchangeToken,
        onExchangeTokenChange,

        showAdd = true,
        showRemove = false,
        label,

        excludeTokensAddress = [],
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
    }, [inputAmount, setInputAmountForUI])

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
                    label={label}
                    amount={inputAmountForUI}
                    viewBalance={viewBalance}
                    balance={viewBalance ? tokenBalance : '0'}
                    token={exchangeToken}
                    onAmountChange={onAmountChangeForUI}
                    SelectTokenChip={{
                        loading: false,
                        ChipProps: {
                            onClick: onTokenChipClick,
                        },
                    }}
                    TextFieldProps={{
                        disabled: !exchangeToken,
                    }}
                    {...props.tokenAmountPanelProps}
                />
                {showAdd ? (
                    <IconButton onClick={onAdd} className={classes.button}>
                        <AddIcon color="primary" />
                    </IconButton>
                ) : (
                    ''
                )}
                {showRemove ? (
                    <IconButton onClick={onRemove} className={classes.button}>
                        <RemoveIcon color="secondary" />
                    </IconButton>
                ) : (
                    ''
                )}
            </Paper>
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                excludeTokens={[exchangeToken?.address ?? '', ...excludeTokensAddress]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}

export interface ExchangeTokenPanelGroupProps {
    originToken: EtherTokenDetailed | ERC20TokenDetailed | undefined
    onTokenAmountChange: (data: any) => void
}

export function ExchangeTokenPanelGroup(props: ExchangeTokenPanelGroupProps) {
    const classes = useStyles()
    const { t } = useI18N()
    const { onTokenAmountChange } = props
    const { value: token } = useEtherTokenDetailed()
    const [excludeTokensAddress, setexcludeTokensAddress] = useState<string[]>([])
    const [exchangeTokenArray, dispatchExchangeTokenArray] = useExchangeTokenAndAmount(token)

    const onAdd = useCallback(() => {
        if (exchangeTokenArray.length > ITO_EXCHANGE_RATION_MAX) {
            return
        }
        dispatchExchangeTokenArray({
            type: ExchangeTokenAndAmountActionType.ADD,
            key: uuid(),
            token: undefined,
            amount: '0',
        })
    }, [dispatchExchangeTokenArray, exchangeTokenArray.length])

    const onAmountChange = useCallback(
        (amount: string, key: string) => {
            dispatchExchangeTokenArray({
                type: ExchangeTokenAndAmountActionType.UPDATE_AMOUNT,
                amount,
                key,
            })
        },
        [dispatchExchangeTokenArray],
    )

    const onTokenChange = useCallback(
        (token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => {
            dispatchExchangeTokenArray({
                type: ExchangeTokenAndAmountActionType.UPDATE_TOKEN,
                token,
                key,
            })
        },
        [dispatchExchangeTokenArray],
    )

    function isETH(token?: EtherTokenDetailed | ERC20TokenDetailed) {
        return token?.address === '0x0000000000000000000000000000000000000000'
    }
    useEffect(() => {
        onTokenAmountChange(exchangeTokenArray)
        const addresses = exchangeTokenArray
            .filter((item) => !isETH(item?.token))
            .map((item) => item?.token?.address ?? '')
        setexcludeTokensAddress(addresses)
    }, [exchangeTokenArray, onTokenAmountChange, setexcludeTokensAddress])

    return (
        <>
            {exchangeTokenArray.map((item, idx) => {
                return (
                    <ExchangeTokenPanel
                        label={idx ? t('plugin_ito_swap_ration_label') : t('plugin_ito_sell_total_amount')}
                        dataIndex={item.key}
                        viewBalance={idx === 0}
                        inputAmount={item.amount}
                        excludeTokensAddress={excludeTokensAddress}
                        onAmountChange={onAmountChange}
                        exchangeToken={item.token}
                        onExchangeTokenChange={onTokenChange}
                        showRemove={idx > 0 && idx < exchangeTokenArray.length && exchangeTokenArray.length !== 2}
                        showAdd={idx === exchangeTokenArray.length - 1 && idx < ITO_EXCHANGE_RATION_MAX}
                        onRemove={() =>
                            dispatchExchangeTokenArray({ type: ExchangeTokenAndAmountActionType.REMOVE, key: item.key })
                        }
                        onAdd={onAdd}
                        tokenAmountPanelProps={{
                            InputProps: idx
                                ? {
                                      startAdornment: props.originToken ? `1${props.originToken?.symbol}=` : '',
                                  }
                                : {},
                        }}
                    />
                )
            })}
        </>
    )
}
