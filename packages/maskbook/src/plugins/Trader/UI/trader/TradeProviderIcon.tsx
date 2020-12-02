import { createStyles, makeStyles } from '@material-ui/core'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { ZRXIcon } from '../../../../resources/ZRXIcon'
import { unreachable } from '../../../../utils/utils'
import { TradeProvider } from '../../types'

const useStyles = makeStyles((theme) =>
    createStyles({
        uniswap: {
            width: 16,
            height: 16,
            verticalAlign: 'bottom',
        },
        zrx: {
            width: 16,
            height: 16,
            verticalAlign: 'bottom',
        },
    }),
)
export interface TradeProviderIconProps {
    provider: TradeProvider
}

export function TradeProviderIcon(props: TradeProviderIconProps) {
    const classes = useStyles()

    switch (props.provider) {
        case TradeProvider.UNISWAP:
            return <UniswapIcon classes={{ root: classes.uniswap }} />
        case TradeProvider.ZRX:
            return <ZRXIcon classes={{ root: classes.zrx }} />
        default:
            unreachable(props.provider)
    }
}
