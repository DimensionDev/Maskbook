import { Image } from '../../components/shared/Image'
import { makeStyles } from '@material-ui/core'
import { WalletNetworkType } from '../../web3/types'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles(() => ({
    networkIcon: {
        height: 48,
        width: 48,
    },
}))

export interface WalletConnectIconProps extends withClasses<never> {
    size?: number
    networkType?: WalletNetworkType
}

const ethereumIcon = new URL('../../resources/wallet-network-icon/ethereum.png', import.meta.url).toString()
const binanceIcon = new URL('../../resources/wallet-network-icon/binance.png', import.meta.url).toString()
const polygonIcon = new URL('../../resources/wallet-network-icon/binance.png', import.meta.url).toString()

export function WalletNetworkIcon(props: WalletConnectIconProps) {
    const { size = 48, networkType } = props
    const classes = useStylesExtends(useStyles(), props)

    switch (networkType) {
        case WalletNetworkType.Ethereum:
            return <Image height={size} width={size} src={ethereumIcon} className={classes.networkIcon} />
        case WalletNetworkType.Binance:
            return <Image height={size} width={size} src={binanceIcon} className={classes.networkIcon} />
        case WalletNetworkType.Polygon:
            return <Image height={size} width={size} src={polygonIcon} className={classes.networkIcon} />
        default:
            return null
    }
}
