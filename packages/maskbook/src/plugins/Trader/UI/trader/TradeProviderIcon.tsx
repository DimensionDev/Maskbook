import { OneInchIcon } from '../../../../resources/OneInchIcon'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { ZRXIcon } from '../../../../resources/ZRXIcon'
import { unreachable } from '../../../../utils/utils'
import { TradeProvider } from '../../types'

export interface TradeProviderIconProps {
    provider: TradeProvider
}

export function TradeProviderIcon(props: TradeProviderIconProps) {
    switch (props.provider) {
        case TradeProvider.UNISWAP:
            return <UniswapIcon />
        case TradeProvider.ZRX:
            return <ZRXIcon />
        case TradeProvider.ONE_INCH:
            return <OneInchIcon />
        default:
            unreachable(props.provider)
    }
}
