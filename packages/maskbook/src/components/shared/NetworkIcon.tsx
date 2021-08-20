import { Image } from './Image'
import { makeStyles } from '@masknet/theme'
import { NetworkType } from '@masknet/web3-shared'
import { useStylesExtends } from '@masknet/shared'

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
    [NetworkType.Ethereum]: new URL('../../resources/wallet-network-icon/ethereum.png', import.meta.url).toString(),
    [NetworkType.Binance]: new URL('../../resources/wallet-network-icon/binance.png', import.meta.url).toString(),
    [NetworkType.Polygon]: new URL('../../resources/wallet-network-icon/polygon.png', import.meta.url).toString(),
    [NetworkType.Arbitrum]: new URL('../../resources/wallet-network-icon/arbitrum.png', import.meta.url).toString(),
}

export function NetworkIcon(props: NetworkIconProps) {
    const { size = 48, networkType } = props
    const classes = useStylesExtends(useStyles(), props)

    if (!networkType) return null

    return icons[networkType] ? (
        <Image height={size} width={size} src={icons[networkType]} className={classes.icon} />
    ) : null
}
