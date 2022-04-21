import { NetworkPluginID, useNetworkDescriptor } from '@masknet/plugin-infra/web3'
import { ChainId, getChainDetailed } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ImageIcon } from '@masknet/shared'
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
    const networkProvider = useNetworkDescriptor(undefined, NetworkPluginID.PLUGIN_EVM)

    const chainDetail = getChainDetailed(chainId)
    const color = getNetworkColor(chainDetail?.chainId ?? ChainId.Mainnet)

    return (
        <Typography variant="subtitle2" color={color} className={classes.root}>
            <ImageIcon classes={{ icon: classes.icon }} icon={networkProvider?.icon} />
            {chainDetail?.fullName}
        </Typography>
    )
}
