import { ChainId, getChainDetailed, getNetworkTypeFromChainId } from '@masknet/web3-shared-evm'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { NetworkIcon, useStylesExtends } from '@masknet/shared'
import { getNetworkColor } from '../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        width: '1em',
        height: '1em',
        marginRight: theme.spacing(0.5),
    },
}))

interface NetworkViewProps extends withClasses<never> {
    chainId?: ChainId
}

export const NetworkView = (props: NetworkViewProps) => {
    const classes = useStylesExtends(useStyles(), props)
    const { chainId = ChainId.Mainnet } = props

    const selectedNetwork = getNetworkTypeFromChainId(chainId)
    const chainDetail = getChainDetailed(chainId)

    const color = getNetworkColor(chainDetail?.chainId ?? ChainId.Mainnet)

    return (
        <Typography variant="subtitle2" color={color} className={classes.root}>
            <NetworkIcon classes={{ icon: classes.icon }} networkType={selectedNetwork} />
            {chainDetail?.fullName}
        </Typography>
    )
}
