import { Icons, type GeneratedIconProps, type GeneratedIcon } from '@masknet/icons'
import { CurrencyType } from '@masknet/web3-shared-base'
import { memo } from 'react'

type FiatCurrencyType = Exclude<CurrencyType, CurrencyType.BTC | CurrencyType.ETH | CurrencyType.NATIVE>

interface FiatCurrencyIcon extends GeneratedIconProps {
    type: CurrencyType
}

const ICON_FILTER_COLOR: Record<FiatCurrencyType, string> = {
    [CurrencyType.USD]: 'drop-shadow(0px 6px 12px rgba(0, 204, 94, 0.20))',
    [CurrencyType.CNY]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
    [CurrencyType.HKD]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
    [CurrencyType.JPY]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
    [CurrencyType.EUR]: 'drop-shadow(0px 6px 12px rgba(0, 47, 159, 0.20))',
}

const CurrencyIconMap: Record<FiatCurrencyType, GeneratedIcon> = {
    [CurrencyType.USD]: Icons.America,
    [CurrencyType.CNY]: Icons.China,
    [CurrencyType.HKD]: Icons.HongKong,
    [CurrencyType.JPY]: Icons.Japan,
    [CurrencyType.EUR]: Icons.Europe,
}

export const FiatCurrencyIcon = memo(function FiatCurrencyIcon({ type, ...rest }: FiatCurrencyIcon) {
    if (!(type in CurrencyIconMap)) return null

    const Icon = CurrencyIconMap[type as FiatCurrencyType]

    return (
        <Icon
            {...rest}
            style={{
                filter: ICON_FILTER_COLOR[type as FiatCurrencyType],
                flexShrink: 0,
                flexGrow: 0,
                height: rest.size,
                width: rest.size,
                borderRadius: '50%',
            }}
        />
    )
})
