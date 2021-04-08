import { v4 as uuid } from 'uuid'
import { useCallback, useEffect, useState } from 'react'
import { makeStyles, createStyles, Paper, IconButton } from '@material-ui/core'
import AddIcon from '@material-ui/icons/AddOutlined'
import RemoveIcon from '@material-ui/icons/RemoveOutlined'

import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import type { TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { EthereumMessages, SelectTokenDialogEvent } from '../../Ethereum/messages'

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
    inputAmount: string
    onAmountChange: (amount: string, key: string) => void

    disableEther: boolean
    disableBalance: boolean
    disableRemoveButton: boolean
    disableShowButton: boolean

    exchangeToken?: EtherTokenDetailed | ERC20TokenDetailed
    onExchangeTokenChange: (token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => void

    onAdd: () => void
    onRemove: () => void
    dataIndex: string

    label: string
    excludeTokensAddress?: string[]
    selectedTokensAddress?: string[]
    TokenAmountPanelProps: Partial<TokenAmountPanelProps>
}

export function ExchangeTokenPanel(props: ExchangetokenPanelProps) {
    const {
        inputAmount,
        onAmountChange,

        disableEther,
        disableBalance,
        disableShowButton = true,
        disableRemoveButton = false,

        exchangeToken,
        onExchangeTokenChange,

        label,
        excludeTokensAddress = [],
        selectedTokensAddress = [],

        onAdd,
        onRemove,
        dataIndex,
    } = props

    const classes = useStyles()

    //#region select token dialog
    const [id] = useState(uuid())
    const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                if (ev.token.type !== EthereumTokenType.Ether && ev.token.type !== EthereumTokenType.ERC20) return
                onExchangeTokenChange(ev.token, dataIndex)
            },
            [id, dataIndex],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            type: EthereumTokenType.ERC20,
            disableEther,
            FixedTokenListProps: {
                blacklist: excludeTokensAddress,
                selectedTokens: [exchangeToken?.address ?? '', ...selectedTokensAddress],
            },
        })
    }, [id, disableEther, exchangeToken, excludeTokensAddress.sort().join(), selectedTokensAddress.sort().join()])
    //#endregion

    //#region balance
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
        <Paper className={classes.line}>
            <TokenAmountPanel
                classes={{ root: classes.input }}
                label={label}
                amount={inputAmountForUI}
                disableBalance={disableBalance}
                balance={disableBalance || loadingTokenBalance ? '0' : tokenBalance}
                token={exchangeToken}
                onAmountChange={onAmountChangeForUI}
                SelectTokenChip={{
                    loading: false,
                    ChipProps: {
                        onClick: onSelectTokenChipClick,
                    },
                }}
                TextFieldProps={{
                    disabled: !exchangeToken,
                }}
                {...props.TokenAmountPanelProps}
            />
            {disableShowButton ? (
                <IconButton onClick={onAdd} className={classes.button}>
                    <AddIcon color="primary" />
                </IconButton>
            ) : null}
            {disableRemoveButton ? (
                <IconButton onClick={onRemove} className={classes.button}>
                    <RemoveIcon color="secondary" />
                </IconButton>
            ) : null}
        </Paper>
    )
}
