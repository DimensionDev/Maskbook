import { makeStyles } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { AddOutlined as AddIcon, RemoveOutlined as RemoveIcon } from '@mui/icons-material'
import { IconButton, Paper } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { FungibleTokenInput, SelectFungibleTokenModal } from '@masknet/shared'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { useI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    line: {
        margin: theme.spacing(1),
        display: 'flex',
        backgroundColor: theme.palette.maskColor.bottom,
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
    const t = useI18N()
    const { classes } = useStyles()
    // #region select token dialog
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await SelectFungibleTokenModal.openAndWaitForClose({
            disableNativeToken: isSell,
            blacklist: excludeTokensAddress,
            selectedTokens: [exchangeToken?.address || '', ...selectedTokensAddress],
            chainId,
            pluginID: NetworkPluginID.PLUGIN_EVM,
        })
        if (!picked) return
        onExchangeTokenChange(picked as FungibleToken<ChainId, SchemaType>, dataIndex)
    }, [
        isSell,
        dataIndex,
        chainId,
        exchangeToken?.address,
        excludeTokensAddress.sort((a, b) => a.localeCompare(b, 'en-US')).join(','),
        selectedTokensAddress.sort((a, b) => a.localeCompare(b, 'en-US')).join(','),
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
            <FungibleTokenInput
                label={label}
                amount={inputAmountForUI}
                balance={disableBalance || loadingTokenBalance ? '0' : tokenBalance}
                token={exchangeToken}
                onAmountChange={onAmountChangeForUI}
                onSelectToken={onSelectTokenChipClick}
                disabled={!exchangeToken}
                placeholder={!exchangeToken ? t.plugin_ito_placeholder_when_token_unselected() : placeholder || '0.0'}
                disableMax
                disableBalance={disableBalance}
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
