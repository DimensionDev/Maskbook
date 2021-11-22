import { SuccessIcon } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import type { NetworkPluginID, Web3Plugin } from '@masknet/plugin-infra'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, ImageList, ImageListItem, List, ListItem, Typography } from '@mui/material'
import { ProviderIcon } from './ProviderIcon'

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
        flexWrap: 'wrap',
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
    networks: Web3Plugin.NetworkDescriptor[]
    providers: Web3Plugin.ProviderDescriptor[]
    undeterminedPluginID?: string
    undeterminedNetworkID?: string
    setUndeterminedPluginID: (id: NetworkPluginID) => void
    setUndeterminedNetworkID: (id: string) => void
    NetworkIconClickBait?: React.ComponentType<Web3Plugin.UI.NetworkIconClickBaitProps>
    ProviderIconClickBait?: React.ComponentType<Web3Plugin.UI.ProviderIconClickBaitProps>
    onSubmit: () => void
}

export function PluginProviderRender({
    networks,
    providers,
    undeterminedPluginID,
    undeterminedNetworkID,
    setUndeterminedPluginID,
    setUndeterminedNetworkID,
    NetworkIconClickBait,
    ProviderIconClickBait,
    onSubmit,
}: PluginProviderRenderProps) {
    const { classes } = useStyles()

    return (
        <>
            <Box className={classes.root}>
                <section className={classes.section}>
                    <Typography className={classes.title} variant="h2" component="h2">
                        1. Choose Network
                    </Typography>
                    <List className={classes.list}>
                        {networks
                            ?.filter((x) => x.isMainnet)
                            .map((network) => (
                                <ListItem
                                    className={classes.networkItem}
                                    key={network.ID}
                                    onClick={() => {
                                        setUndeterminedPluginID(network.networkSupporterPluginID as NetworkPluginID)
                                        setUndeterminedNetworkID(network.ID)
                                    }}>
                                    <div className={classes.iconWrapper}>
                                        {NetworkIconClickBait ? (
                                            <NetworkIconClickBait network={network}>
                                                <ImageIcon icon={network.icon} />
                                            </NetworkIconClickBait>
                                        ) : (
                                            <ImageIcon icon={network.icon} />
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
                    <ImageList className={classes.grid} gap={8} cols={3} rowHeight={130}>
                        {providers
                            .filter((x) => x.providerAdaptorPluginID === undeterminedPluginID)
                            .map((provider) =>
                                ProviderIconClickBait ? (
                                    <ProviderIconClickBait
                                        key={provider.ID}
                                        network={networks.find((x) => x.ID === undeterminedNetworkID)!}
                                        provider={provider}
                                        onClick={onSubmit}>
                                        <ImageListItem>
                                            <ProviderIcon icon={provider.icon} name={provider.name} />
                                        </ImageListItem>
                                    </ProviderIconClickBait>
                                ) : (
                                    <ImageIcon icon={provider.icon} />
                                ),
                            )}
                    </ImageList>
                </section>
            </Box>
        </>
    )
}
