import { Fragment, useCallback, useEffect, useState } from 'react'
import { InputAdornment } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { v4 as uuid } from 'uuid'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { useI18N } from '../../../utils'
import { ITO_EXCHANGE_RATION_MAX } from '../constants'
import {
    ExchangeTokenAndAmountState,
    ExchangeTokenAndAmountActionType,
    useExchangeTokenAndAmount,
} from './hooks/useExchangeTokenAmountstate'
import { ExchangeTokenPanel } from './ExchangeTokenPanel'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    arrow: {
        display: 'flex',
        justifyContent: 'center',
    },
    adornment: {
        color: theme.palette.text.secondary,
    },
}))

export interface ExchangeTokenPanelGroupProps {
    token: FungibleToken<ChainId, SchemaType> | undefined
    origin: ExchangeTokenAndAmountState[]
    onTokenAmountChange: (data: ExchangeTokenAndAmountState[]) => void
    chainId: ChainId
}

export function ExchangeTokenPanelGroup(props: ExchangeTokenPanelGroupProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { onTokenAmountChange, chainId } = props
    const [selectedTokensAddress, setSelectedTokensAddress] = useState<string[]>([])
    const [exchangeTokenArray, dispatchExchangeTokenArray] = useExchangeTokenAndAmount(props.origin)

    const onAdd = useCallback(() => {
        if (exchangeTokenArray.length > ITO_EXCHANGE_RATION_MAX) return
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
        (token: FungibleToken<ChainId, SchemaType>, key: string) => {
            dispatchExchangeTokenArray({
                type: ExchangeTokenAndAmountActionType.UPDATE_TOKEN,
                token,
                key,
            })

            dispatchExchangeTokenArray({
                type: ExchangeTokenAndAmountActionType.UPDATE_AMOUNT,
                amount: '',
                key,
            })
        },
        [dispatchExchangeTokenArray],
    )

    useEffect(() => {
        onTokenAmountChange(exchangeTokenArray)
        setSelectedTokensAddress(exchangeTokenArray.map((x) => x.token?.address ?? ''))
    }, [exchangeTokenArray, onTokenAmountChange])

    return (
        <>
            {exchangeTokenArray.map((item, idx) => {
                return (
                    <Fragment key={idx}>
                        <ExchangeTokenPanel
                            chainId={chainId}
                            label={idx ? t('plugin_ito_swap_ration_label') : t('plugin_ito_sell_total_amount')}
                            dataIndex={item.key}
                            disableBalance={idx !== 0}
                            isSell={idx === 0}
                            inputAmount={item.amount}
                            selectedTokensAddress={selectedTokensAddress}
                            onAmountChange={onAmountChange}
                            exchangeToken={item.token}
                            onExchangeTokenChange={onTokenChange}
                            showRemove={idx > 0 && idx < exchangeTokenArray.length && exchangeTokenArray.length !== 2}
                            showAdd={idx === exchangeTokenArray.length - 1 && idx < ITO_EXCHANGE_RATION_MAX}
                            onRemove={() =>
                                dispatchExchangeTokenArray({
                                    type: ExchangeTokenAndAmountActionType.REMOVE,
                                    key: item.key,
                                })
                            }
                            onAdd={onAdd}
                            TokenAmountPanelProps={{
                                InputProps: idx
                                    ? {
                                          startAdornment: props.token ? (
                                              <InputAdornment position="start" className={classes.adornment}>
                                                  1{props.token?.symbol}=
                                              </InputAdornment>
                                          ) : (
                                              ''
                                          ),
                                      }
                                    : {},
                            }}
                        />
                        {idx === 0 ? (
                            <div className={classes.arrow}>
                                <ArrowDownwardIcon color="disabled" />
                            </div>
                        ) : null}
                    </Fragment>
                )
            })}
        </>
    )
}
