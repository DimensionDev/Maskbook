import { ChainId, getChainDetailed, getNetworkTypeFromChainId } from '@masknet/web3-shared'
import { makeStyles, Typography } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { NetworkIcon } from '../../../components/shared/NetworkIcon'
import { getNetworkColor } from '../utils'

const useStyles = makeStyles((theme) => ({
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

    const color = getNetworkColor(chainDetail?.chainId ?? 1)

    return (
        <Typography variant="subtitle2" color={color} className={classes.root}>
            <NetworkIcon classes={{ icon: classes.icon }} networkType={selectedNetwork} />
            {chainDetail?.fullName}
        </Typography>
    )
}
