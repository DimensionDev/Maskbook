import { makeStyles } from '@masknet/theme'
import { NetworkType } from '@masknet/web3-shared-evm'
import { useStylesExtends } from '../..'
const useStyles = makeStyles()((theme) => ({
    icon: {
        borderRadius: '50%',
        backgroundColor: '#F7F9FA',
    },
    border: {
        border: `1px solid ${theme.palette.background.default}`,
    },
}))

export interface NetworkIconProps extends withClasses<'icon'> {
    size?: number
    networkType?: NetworkType
    bordered?: boolean
}

const icons: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: new URL('./wallet-network-icon/ethereum.png', import.meta.url).toString(),
    [NetworkType.Binance]: new URL('./wallet-network-icon/binance.png', import.meta.url).toString(),
    [NetworkType.Polygon]: new URL('./wallet-network-icon/polygon.png', import.meta.url).toString(),
    [NetworkType.Arbitrum]: new URL('./wallet-network-icon/arbitrum.png', import.meta.url).toString(),
    [NetworkType.xDai]: new URL('./wallet-network-icon/xdai.png', import.meta.url).toString(),
}

export function NetworkIcon(props: NetworkIconProps) {
    const { size = 48, networkType } = props
    const classes = useStylesExtends(useStyles(), props)
    if (!networkType) return null

    return icons[networkType] ? (
        <img
            height={size}
            width={size}
            src={icons[networkType]}
            className={props.bordered ? `${classes.icon} ${classes.border}` : classes.icon}
        />
    ) : null
}
