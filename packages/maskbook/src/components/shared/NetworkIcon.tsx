import { Image } from './Image'
import { makeStyles } from '@material-ui/core'
import { NetworkType } from '@masknet/web3-shared'
import { useStylesExtends } from '../custom-ui-helper'
import { safeUnreachable } from '@dimensiondev/kit'

const useStyles = makeStyles(() => ({
    icon: {
        borderRadius: '50%',
        backgroundColor: '#F7F9FA',
    },
}))

export interface NetworkIconProps extends withClasses<'icon'> {
    size?: number
    networkType?: NetworkType
}

const EthereumIcon = new URL('../../resources/wallet-network-icon/ethereum.png', import.meta.url).toString()
const BinanceIcon = new URL('../../resources/wallet-network-icon/binance.png', import.meta.url).toString()
const PolygonIcon = new URL('../../resources/wallet-network-icon/polygon.png', import.meta.url).toString()
const AribitrumIcon = new URL('../../resources/wallet-network-icon/arbitrum.png', import.meta.url).toString()

export function NetworkIcon(props: NetworkIconProps) {
    const { size = 48, networkType } = props
    const classes = useStylesExtends(useStyles(), props)

    if (!networkType) return null

    switch (networkType) {
        case NetworkType.Ethereum:
            return <Image height={size} width={size} src={EthereumIcon} className={classes.icon} />
        case NetworkType.Binance:
            return <Image height={size} width={size} src={BinanceIcon} className={classes.icon} />
        case NetworkType.Polygon:
            return <Image height={size} width={size} src={PolygonIcon} className={classes.icon} />
        case NetworkType.Arbitrum:
            return <Image height={size} width={size} src={AribitrumIcon} className={classes.icon} />
        default:
            safeUnreachable(networkType)
            return null
    }
}
