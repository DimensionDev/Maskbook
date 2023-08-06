import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { unreachable } from '@masknet/kit'
import { FiatCurrencyType } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

interface FiatCurrencyIcon extends GeneratedIconProps {
    type: FiatCurrencyType
}

const ICON_FILTER_COLOR: Record<FiatCurrencyType, string> = {
    [FiatCurrencyType.USD]: 'drop-shadow(0px 6px 12px rgba(0, 204, 94, 0.20))',
    [FiatCurrencyType.CNY]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
    [FiatCurrencyType.HKD]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
    [FiatCurrencyType.JPY]: 'drop-shadow(0px 6px 12px rgba(243, 0, 0, 0.20))',
}

export function FiatCurrencyIcon({ type, ...rest }: FiatCurrencyIcon) {
    const icon = useMemo(() => {
        switch (type) {
            case FiatCurrencyType.USD:
                return <Icons.USD {...rest} />
            case FiatCurrencyType.CNY:
                return <Icons.CNY {...rest} />
            case FiatCurrencyType.HKD:
                return <Icons.HKD {...rest} />
            case FiatCurrencyType.JPY:
                return <Icons.JPY {...rest} />
            default:
                unreachable(type)
        }
    }, [type])

    return <div style={{ filter: ICON_FILTER_COLOR[type], height: rest.size, width: rest.size }}>{icon}</div>
}
