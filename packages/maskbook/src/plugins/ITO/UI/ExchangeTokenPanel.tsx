import { useCallback, useEffect, useState } from 'react'
import { makeStyles, createStyles, Paper, IconButton } from '@material-ui/core'
import AddIcon from '@material-ui/icons/AddOutlined'
import RemoveIcon from '@material-ui/icons/RemoveOutlined'

import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { useChainId } from '../../../web3/hooks/useChainState'
import type { TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'
import { ITO_CONSTANTS } from '../constants'
import { CONSTANTS } from '../../../web3/constants'

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
    isSell: boolean
    exchangeToken: EtherTokenDetailed | ERC20TokenDetailed | undefined
    onExchangeTokenChange: (token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => void

    onAdd: () => void
    onRemove: () => void
    dataIndex: string

    showRemove: boolean
    showAdd: boolean

    label: string
    includeTokensAddress?: string[]
    excludeTokensAddress?: string[]
    selectedTokensAddress?: string[]
    TokenAmountPanelProps: Partial<TokenAmountPanelProps>
}

export function ExchangeTokenPanel(props: ExchangetokenPanelProps) {
    const {
        onAmountChange,
        dataIndex,
        inputAmount,
        viewBalance,
        exchangeToken,
        onExchangeTokenChange,
        isSell,
        showAdd = true,
        showRemove = false,
        label,
        includeTokensAddress = [],
        excludeTokensAddress = [],
        selectedTokensAddress = [],
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

    const chainId = useChainId()
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const EXCHANGE_TOKENS = useConstant(ITO_CONSTANTS, 'EXCHANGE_TOKENS')

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
                    {...props.TokenAmountPanelProps}
                />
                {showAdd ? (
                    <IconButton onClick={onAdd} className={classes.button}>
                        <AddIcon color="primary" />
                    </IconButton>
                ) : null}
                {showRemove ? (
                    <IconButton onClick={onRemove} className={classes.button}>
                        <RemoveIcon color="secondary" />
                    </IconButton>
                ) : null}
            </Paper>
            <SelectERC20TokenDialog
                open={openSelectERC20TokenDialog}
                disableSearchBar
                includeTokens={isSell ? [] : [ETH_ADDRESS, ...includeTokensAddress, ...EXCHANGE_TOKENS]}
                excludeTokens={excludeTokensAddress}
                selectedTokens={[exchangeToken?.address ?? '', ...selectedTokensAddress]}
                onSubmit={onSelectERC20TokenDialogSubmit}
                onClose={onSelectERC20TokenDialogClose}
            />
        </>
    )
}
