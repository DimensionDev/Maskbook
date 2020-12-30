import { useCallback, useEffect, useState } from 'react'
import { makeStyles, createStyles } from '@material-ui/core'
import { v4 as uuid } from 'uuid'

import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { ITO_EXCHANGE_RATION_MAX } from '../constants'
import {
    ExchangeTokenAndAmountState,
    ExchangeTokenAndAmountActionType,
    useExchangeTokenAndAmount,
} from '../hooks/useExchangeTokenAmountstate'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ExchangeTokenPanel } from './ExchangeTokenPanel'

const useStyles = makeStyles((theme) => createStyles({}))

export interface ExchangeTokenPanelGroupProps {
    token: EtherTokenDetailed | ERC20TokenDetailed | undefined
    onTokenAmountChange: (data: ExchangeTokenAndAmountState[]) => void
}

export function ExchangeTokenPanelGroup(props: ExchangeTokenPanelGroupProps) {
    const classes = useStyles()
    const { t } = useI18N()
    const { onTokenAmountChange } = props
    const { value: token } = useEtherTokenDetailed()
    const [selectedTokensAddress, setSelectedTokensAddress] = useState<string[]>([])
    const [exchangeTokenArray, dispatchExchangeTokenArray] = useExchangeTokenAndAmount(token)

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
        (token: EtherTokenDetailed | ERC20TokenDetailed, key: string) => {
            dispatchExchangeTokenArray({
                type: ExchangeTokenAndAmountActionType.UPDATE_TOKEN,
                token,
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
                    <ExchangeTokenPanel
                        label={idx ? t('plugin_ito_swap_ration_label') : t('plugin_ito_sell_total_amount')}
                        dataIndex={item.key}
                        viewBalance={idx === 0}
                        isSell={idx === 0}
                        inputAmount={item.amount}
                        selectedTokensAddress={selectedTokensAddress}
                        onAmountChange={onAmountChange}
                        exchangeToken={item.token}
                        onExchangeTokenChange={onTokenChange}
                        showRemove={idx > 0 && idx < exchangeTokenArray.length && exchangeTokenArray.length !== 2}
                        showAdd={idx === exchangeTokenArray.length - 1 && idx < ITO_EXCHANGE_RATION_MAX}
                        onRemove={() =>
                            dispatchExchangeTokenArray({ type: ExchangeTokenAndAmountActionType.REMOVE, key: item.key })
                        }
                        onAdd={onAdd}
                        TokenAmountPanelProps={{
                            InputProps: idx
                                ? {
                                      startAdornment: props.token ? `1${props.token?.symbol}=` : '',
                                  }
                                : {},
                        }}
                    />
                )
            })}
        </>
    )
}
