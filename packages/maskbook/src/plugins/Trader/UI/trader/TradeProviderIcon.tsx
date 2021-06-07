import { unreachable } from '@dimensiondev/maskbook-shared'
import { makeStyles } from '@material-ui/core'
import { BalancerIcon } from '../../../../resources/BalancerIcon'
import { SashimiSwapIcon } from '../../../../resources/SashimiSwapIcon'
import { SushiSwapIcon } from '../../../../resources/SushiSwapIcon'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { ZRXIcon } from '../../../../resources/ZRXIcon'
import { TradeProvider } from '../../types'

const quickswapIcon = new URL('../../../../resources/quickswap.png', import.meta.url).toString()

const useStyles = makeStyles((theme) => ({
    icon: {
        width: 16,
        height: 16,
        verticalAlign: 'bottom',
    },
}))
export interface TradeProviderIconProps {
    provider: TradeProvider
}

export function TradeProviderIcon(props: TradeProviderIconProps) {
    const classes = useStyles()
    switch (props.provider) {
        case TradeProvider.UNISWAP:
            return <UniswapIcon classes={{ root: classes.icon }} />
        case TradeProvider.ZRX:
            return <ZRXIcon classes={{ root: classes.icon }} />
        case TradeProvider.SUSHISWAP:
            return <SushiSwapIcon classes={{ root: classes.icon }} />
        case TradeProvider.SASHIMISWAP:
            return <SashimiSwapIcon classes={{ root: classes.icon }} />
        case TradeProvider.BALANCER:
            return <BalancerIcon classes={{ root: classes.icon }} />
        case TradeProvider.QUICKSWAP:
            return <img src={quickswapIcon} alt="Quickswap" className={classes.icon} />
        default:
            unreachable(props.provider)
    }
}
