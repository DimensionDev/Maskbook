import { unreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import { makeStyles } from '@masknet/theme'
import { BalancerIcon } from '../../../../resources/BalancerIcon'
import { BancorIcon } from '../../../../resources/BancorIcon'
import { SashimiSwapIcon } from '../../../../resources/SashimiSwapIcon'
import { SushiSwapIcon } from '../../../../resources/SushiSwapIcon'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { ZRXIcon } from '../../../../resources/ZRXIcon'
import { DODOIcon } from '../../../../resources/DODOIcon'
import { NETSWAPIcon } from '../../../../resources/NETSWAPIcon'
import { OpenOceanIcon } from '../../../../resources/OpenOceanIcon'
import { TrisolarisIcon } from '../../../../resources/TrisolarisIcon'
import { resolveTradeProviderName } from '../../pipes'

const quickswapIcon = new URL('../../../../resources/quickswap.png', import.meta.url).toString()
const pancakeswapIcon = new URL('../../../../resources/pancakeswap.png', import.meta.url).toString()
const tethysIcon = new URL('../../../../resources/tethys.png', import.meta.url).toString()
const wannaswapIcon = new URL('../../../../resources/wannaswap.png', import.meta.url).toString()

const useStyles = makeStyles()((theme) => ({
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
    const { classes } = useStyles()
    switch (props.provider) {
        case TradeProvider.UNISWAP_V2:
            return <UniswapIcon classes={{ root: classes.icon }} />
        case TradeProvider.UNISWAP_V3:
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
            return (
                <img
                    src={quickswapIcon}
                    alt={resolveTradeProviderName(TradeProvider.QUICKSWAP)}
                    className={classes.icon}
                />
            )
        case TradeProvider.PANCAKESWAP:
            return (
                <img
                    src={pancakeswapIcon}
                    alt={resolveTradeProviderName(TradeProvider.PANCAKESWAP)}
                    className={classes.icon}
                />
            )
        case TradeProvider.TETHYS:
            return (
                <img src={tethysIcon} alt={resolveTradeProviderName(TradeProvider.TETHYS)} className={classes.icon} />
            )
        case TradeProvider.WANNASWAP:
            return (
                <img
                    src={pancakeswapIcon}
                    alt={resolveTradeProviderName(TradeProvider.WANNASWAP)}
                    className={classes.icon}
                />
            )
        case TradeProvider.DODO:
            return <DODOIcon classes={{ root: classes.icon }} />
        case TradeProvider.BANCOR:
            return <BancorIcon classes={{ root: classes.icon }} />
        case TradeProvider.NETSWAP:
            return <NETSWAPIcon classes={{ root: classes.icon }} />
        case TradeProvider.OPENOCEAN:
            return <OpenOceanIcon classes={{ root: classes.icon }} />
        case TradeProvider.TRISOLARIS:
            return <TrisolarisIcon classes={{ root: classes.icon }} />
        default:
            unreachable(props.provider)
    }
}
