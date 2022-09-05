import { makeStyles } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import AddIcon from '@mui/icons-material/AddOutlined'
import RemoveIcon from '@mui/icons-material/RemoveOutlined'
import { IconButton, Paper } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { ERC20Input, useSelectFungibleToken } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { useFungibleTokenBalance } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
    },
    line: {
        margin: theme.spacing(1),
        display: 'flex',
        backgroundColor: theme.palette.maskColor.bottom,
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

    chainId: ChainId
    label: string
    excludeTokensAddress?: string[]
    selectedTokensAddress?: string[]
    placeholder?: string
    // TokenAmountPanelProps: Partial<TokenAmountPanelProps>
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
        chainId,
        onRemove,
        onAdd,
        placeholder,
    } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    // #region select token dialog
    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            disableNativeToken: isSell,
            blacklist: excludeTokensAddress,
            selectedTokens: [exchangeToken?.address || '', ...selectedTokensAddress],
            chainId,
        })
        if (picked) onExchangeTokenChange(picked, dataIndex)
    }, [
        isSell,
        dataIndex,
        chainId,
        exchangeToken?.address,
        excludeTokensAddress.sort((a, b) => a.localeCompare(b, 'en-US')).join(),
        selectedTokensAddress.sort((a, b) => a.localeCompare(b, 'en-US')).join(),
    ])
    // #endregion

    // #region balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
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
            <ERC20Input
                label={label}
                amount={inputAmountForUI}
                balance={disableBalance || loadingTokenBalance ? '0' : tokenBalance}
                token={exchangeToken}
                onAmountChange={onAmountChangeForUI}
                onSelectToken={onSelectTokenChipClick}
                disabled={!exchangeToken}
                placeholder={!exchangeToken ? t('plugin_ito_placeholder_when_token_unselected') : placeholder || '0.0'}
                displayMax={false}
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
