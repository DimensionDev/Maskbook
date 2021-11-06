import { SuccessIcon } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import type { Plugin } from '@masknet/plugin-infra'
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
    networks: Plugin.Shared.Network[]
    providers: Plugin.Shared.Provider[]
    undeterminedPluginID: string
    undeterminedNetworkID: string
    setUndeterminedPluginID: (id: string) => void
    setUndeterminedNetworkID: (id: string) => void
    NetworkIconClickBait?: React.ComponentType<{ network: Plugin.Shared.Network; children?: React.ReactNode }>
    ProviderIconClickBait?: React.ComponentType<{
        network: Plugin.Shared.Network
        provider: Plugin.Shared.Provider
        children?: React.ReactNode
    }>
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
                    <ImageList className={classes.grid} gap={16} cols={3} rowHeight={151} onClick={onSubmit}>
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
        </>
    )
}
