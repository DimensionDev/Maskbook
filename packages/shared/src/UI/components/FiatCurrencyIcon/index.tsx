import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { CurrencyType } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

type FiatCurrencyType = CurrencyType.USD | CurrencyType.CNY | CurrencyType.HKD | CurrencyType.JPY

interface FiatCurrencyIcon extends GeneratedIconProps {
    type: CurrencyType
}

const ICON_FILTER_COLOR: Record<FiatCurrencyType, string> = {
    [CurrencyType.USD]: 'drop-shadow(0px 6px 12px rgba(0, 204, 94, 0.20))',
    [CurrencyType.CNY]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
    [CurrencyType.HKD]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
    [CurrencyType.JPY]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
}

export function FiatCurrencyIcon({ type, ...rest }: FiatCurrencyIcon) {
    const icon = useMemo(() => {
        switch (type) {
            case CurrencyType.USD:
                return <Icons.USD {...rest} />
            case CurrencyType.CNY:
                return <Icons.CNY {...rest} />
            case CurrencyType.HKD:
                return <Icons.HKD {...rest} />
            case CurrencyType.JPY:
                return <Icons.JPY {...rest} />
            default:
                return null
        }
    }, [type])

    return (
        <div style={{ filter: ICON_FILTER_COLOR[type as FiatCurrencyType], height: rest.size, width: rest.size }}>
            {icon}
        </div>
    )
}
