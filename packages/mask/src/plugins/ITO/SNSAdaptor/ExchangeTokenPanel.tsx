import { makeStyles } from '@masknet/theme'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import AddIcon from '@mui/icons-material/AddOutlined'
import RemoveIcon from '@mui/icons-material/RemoveOutlined'
import { IconButton, Paper } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { usePickToken } from '@masknet/shared'
import { useI18N } from '../../../utils'
import type { TokenAmountPanelProps } from '../../../web3/UI/TokenAmountPanel'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { useFungibleTokenBalance } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
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
        backgroundColor: theme.palette.background.default,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            margin: theme.spacing(0),
            padding: theme.spacing(0, 0, 0, 0.5),
        },
    },
}))

export interface ExchangeTokenPanelProps {
    onAmountChange: (amount: string, key: string) => void
    inputAmount: string

    disableBalance: boolean
    isSell: boolean
    exchangeToken: FungibleToken<ChainId, SchemaType> | undefined
    onExchangeTokenChange: (token: FungibleToken<ChainId, SchemaType>, key: string) => void

    onAdd: () => void
    onRemove: () => void
    dataIndex: string

    showRemove: boolean
    showAdd: boolean

    label: string
    excludeTokensAddress?: string[]
    selectedTokensAddress?: string[]
    TokenAmountPanelProps: Partial<TokenAmountPanelProps>
}

export function ExchangeTokenPanel(props: ExchangeTokenPanelProps) {
    const {
        onAmountChange,
        dataIndex,
        inputAmount,
        disableBalance,
        exchangeToken,
        onExchangeTokenChange,
        isSell,
        showAdd = true,
        showRemove = false,
        label,
        excludeTokensAddress = [],
        selectedTokensAddress = [],
        onRemove,
        onAdd,
    } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    // #region select token dialog
    const pickToken = usePickToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await pickToken({
            disableNativeToken: isSell,
            blacklist: excludeTokensAddress,
            selectedTokens: [exchangeToken?.address || '', ...selectedTokensAddress],
        })
        if (picked) onExchangeTokenChange(picked, dataIndex)
    }, [
        isSell,
        dataIndex,
        exchangeToken?.address,
        // eslint-disable-next-line @dimensiondev/array/no-implicit-sort
        excludeTokensAddress.sort().join(),
        // eslint-disable-next-line @dimensiondev/array/no-implicit-sort
        selectedTokensAddress.sort().join(),
    ])
    // #endregion

    // #region balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        exchangeToken?.schema ?? SchemaType.Native,
        exchangeToken?.address ?? '',
    )
    // #endregion

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
                    placeholder: !exchangeToken ? t('plugin_ito_placeholder_when_token_unselected') : '0.0',
                }}
                {...props.TokenAmountPanelProps}
            />
            {showAdd ? (
                <IconButton size="large" onClick={onAdd} className={classes.button}>
                    <AddIcon color="primary" />
                </IconButton>
            ) : null}
            {showRemove ? (
                <IconButton size="large" onClick={onRemove} className={classes.button}>
                    <RemoveIcon color="error" />
                </IconButton>
            ) : null}
        </Paper>
    )
}
