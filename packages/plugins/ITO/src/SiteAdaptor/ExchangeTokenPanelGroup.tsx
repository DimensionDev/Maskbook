import { Fragment, useCallback, useEffect, type Dispatch } from 'react'
import { makeStyles } from '@masknet/theme'
import { v4 as uuid } from 'uuid'
import { ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material'
import { ITO_EXCHANGE_RATION_MAX } from '../constants.js'
import {
    type ExchangeTokenAndAmountState,
    ExchangeTokenAndAmountActionType,
    type ExchangeTokenAndAmountAction,
} from './hooks/useExchangeTokenAmountstate.js'
import { ExchangeTokenPanel } from './ExchangeTokenPanel.js'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    arrow: {
        display: 'flex',
        justifyContent: 'center',
    },
}))

export interface ExchangeTokenPanelGroupProps {
    token: FungibleToken<ChainId, SchemaType> | undefined
    dispatchExchangeTokenList: Dispatch<ExchangeTokenAndAmountAction>
    exchangeTokenList: ExchangeTokenAndAmountState[]
    chainId: ChainId
}

export function ExchangeTokenPanelGroup(props: ExchangeTokenPanelGroupProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const { dispatchExchangeTokenList, exchangeTokenList, chainId } = props

    const onAdd = useCallback(() => {
        if (exchangeTokenList.length > ITO_EXCHANGE_RATION_MAX) return
        dispatchExchangeTokenList({
            type: ExchangeTokenAndAmountActionType.ADD,
            key: uuid(),
            token: undefined,
            amount: '0',
        })
    }, [dispatchExchangeTokenList, exchangeTokenList])

    const onAmountChange = useCallback(
        (amount: string, key: string) => {
            dispatchExchangeTokenList({
                type: ExchangeTokenAndAmountActionType.UPDATE_AMOUNT,
                amount,
                key,
            })
        },
        [dispatchExchangeTokenList],
    )

    const onTokenChange = useCallback(
        (token: FungibleToken<ChainId, SchemaType>, key: string) => {
            dispatchExchangeTokenList({
                type: ExchangeTokenAndAmountActionType.UPDATE_TOKEN,
                token,
                key,
            })

            dispatchExchangeTokenList({
                type: ExchangeTokenAndAmountActionType.UPDATE_AMOUNT,
                amount: '',
                key,
            })
        },
        [dispatchExchangeTokenList],
    )

    const onTokenRemove = useCallback(
        (item: ExchangeTokenAndAmountState) => {
            dispatchExchangeTokenList({
                type: ExchangeTokenAndAmountActionType.REMOVE,
                key: item.key,
            })
        },
        [dispatchExchangeTokenList],
    )

    useEffect(() => {
        dispatchExchangeTokenList({ type: ExchangeTokenAndAmountActionType.CLEAR })
    }, [chainId])

    return (
        <>
            {exchangeTokenList.map((item, idx) => {
                return (
                    <Fragment key={idx}>
                        <ExchangeTokenPanel
                            chainId={chainId}
                            label={idx ? t.plugin_ito_swap_ration_label() : t.plugin_ito_sell_total_amount()}
                            dataIndex={item.key}
                            disableBalance={idx !== 0}
                            isSell={idx === 0}
                            inputAmount={item.amount}
                            selectedTokensAddress={exchangeTokenList.map((x) => x.token?.address ?? '')}
                            onAmountChange={onAmountChange}
                            exchangeToken={item.token}
                            onExchangeTokenChange={onTokenChange}
                            showRemove={idx > 0 && idx < exchangeTokenList.length && exchangeTokenList.length !== 2}
                            showAdd={idx === exchangeTokenList.length - 1 && idx < ITO_EXCHANGE_RATION_MAX}
                            onRemove={() => onTokenRemove(item)}
                            onAdd={onAdd}
                            placeholder={idx ? `1${props.token?.symbol}=` : undefined}
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
