import { useState } from 'react'
import { SuccessIcon } from '@masknet/icons'
import { useValueRef } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, ImageList, ImageListItem, List, ListItem, Typography } from '@mui/material'
import {
    useRegisteredProviders,
    useRegisteredNetworks,
    useActivatedPluginsSNSAdaptor,
    useActivatedPluginsDashboard,
} from '@masknet/plugin-infra'
import { ProviderIcon } from './ProviderIcon'
import { NetworkIcon } from './NetworkIcon'
import { networkIDSettings, pluginIDSettings } from '../../../../settings/settings'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2, 4),
    },
    section: {
        flexGrow: 1,
        marginTop: 21,
        '&:first-child': {
            marginTop: 0,
        },
    },
    title: {
        fontSize: 19,
        fontWeight: 'bold',
    },
    list: {
        marginTop: 21,
        display: 'flex',
        gap: 32,
    },
    networkItem: {
        width: 'auto',
        padding: 0,
    },
    iconWrapper: {
        position: 'relative',
        cursor: 'pointer',
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: getMaskColor(theme).twitterBackground,
    },
    networkIcon: {
        backgroundColor: getMaskColor(theme).twitterBackground,
    },
    checkedBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 14,
        height: 14,
        background: '#fff',
        borderRadius: '50%',
    },
    alert: {
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1),
    },
    grid: {
        width: '100%',
        margin: theme.spacing(2, 0, 0),
    },
    providerIcon: {
        fontSize: 45,
    },
}))

export interface PluginProviderRenderProps {
    onClose: () => void
}

export function PluginProviderRender({ onClose }: PluginProviderRenderProps) {
    const { classes } = useStyles()

    const networks = useRegisteredNetworks()
    const providers = useRegisteredProviders()

    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor()
    const pluginsDashboard = useActivatedPluginsDashboard()

    const pluginID = useValueRef(pluginIDSettings)
    const networkID = useValueRef(networkIDSettings)
    const [undeterminedPluginID, setUndeterminedPluginID] = useState(pluginID)
    const [undeterminedNetworkID, setUndeterminedNetworkID] = useState(networkID)

    const NetworkIconClickBait = [...pluginsSNSAdaptor, ...pluginsDashboard].find(
        (x) => x.ID === undeterminedPluginID,
    )?.NetworkIconClickBait
    const ProviderIconClickBait = [...pluginsSNSAdaptor, ...pluginsDashboard].find(
        (x) => x.ID === undeterminedPluginID,
    )?.ProviderIconClickBait

    return (
        <Box className={classes.root}>
            <section className={classes.section}>
                <Typography className={classes.title} variant="h2" component="h2">
                    1. Choose Network
                </Typography>
                <List className={classes.list}>
                    {networks?.map((network) => (
                        <ListItem
                            className={classes.networkItem}
                            key={network.ID}
                            onClick={() => {
                                setUndeterminedPluginID(network.pluginID)
                                setUndeterminedNetworkID(network.ID)
                            }}>
                            <div className={classes.iconWrapper}>
                                {NetworkIconClickBait ? (
                                    <NetworkIconClickBait network={network}>
                                        <NetworkIcon icon={network.icon} />
                                    </NetworkIconClickBait>
                                ) : (
                                    <NetworkIcon icon={network.icon} />
                                )}
                                {undeterminedNetworkID === network.ID && (
                                    <SuccessIcon className={classes.checkedBadge} />
                                )}
                            </div>
                        </ListItem>
                    ))}
                </List>
            </section>
            <section className={classes.section}>
                <Typography className={classes.title} variant="h2" component="h2">
                    2. Choose Wallet
                </Typography>
                <ImageList className={classes.grid} gap={16} cols={3} rowHeight={151} onClick={onClose}>
                    {providers
                        .filter((x) => x.pluginID === undeterminedPluginID)
                        .map((provider) => (
                            <ImageListItem key={provider.ID}>
                                {ProviderIconClickBait ? (
                                    <ProviderIconClickBait
                                        network={networks.find((x) => x.ID === undeterminedNetworkID)!}
                                        provider={provider}>
                                        <ProviderIcon icon={provider.icon} name={provider.name} />
                                    </ProviderIconClickBait>
                                ) : (
                                    <ProviderIcon icon={provider.icon} name={provider.name} />
                                )}
                            </ImageListItem>
                        ))}
                </ImageList>
            </section>
        </Box>
    )
}
