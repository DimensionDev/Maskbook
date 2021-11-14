import { makeStyles } from '@masknet/theme'
import { NetworkType } from '@masknet/web3-shared-evm'
import { useStylesExtends } from '../..'

const useStyles = makeStyles()({
    icon: {
        borderRadius: '50%',
        backgroundColor: '#F7F9FA',
    },
})

export interface NetworkIconProps extends withClasses<'icon'> {
    size?: number
    networkType?: NetworkType
}

const icons: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: new URL('../../../../assets/ethereum.png', import.meta.url).toString(),
    [NetworkType.Binance]: new URL('../../../../assets/binance.png', import.meta.url).toString(),
    [NetworkType.Polygon]: new URL('../../../../assets/polygon.png', import.meta.url).toString(),
    [NetworkType.Arbitrum]: new URL('../../../../assets/arbitrum.png', import.meta.url).toString(),
    [NetworkType.xDai]: new URL('../../../../assets/xdai.png', import.meta.url).toString(),
}

export function NetworkIcon(props: NetworkIconProps) {
    const { size = 48, networkType } = props
    const classes = useStylesExtends(useStyles(), props)

    if (!networkType) return null

    return icons[networkType] ? (
        <img height={size} width={size} src={icons[networkType]} className={classes.icon} />
    ) : null
}
