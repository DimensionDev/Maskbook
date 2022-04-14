import { SelectedIcon } from '@masknet/icons'
import type { NetworkPluginID, Web3Plugin } from '@masknet/plugin-infra/web3'
import { ImageIcon } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Box, List, ListItem, Typography } from '@mui/material'
import { first } from 'lodash-unified'
import { useI18N } from '../../../../utils'
import { ProviderIcon } from './ProviderIcon'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
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
            backgroundColor: 'transparent',
        },
        networkIcon: {
            backgroundColor: theme.palette.background.default,
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
        wallets: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: '130px',
            gridGap: theme.spacing(1),
            margin: theme.spacing(2, 0, 0),
            [smallQuery]: {
                gridAutoRows: '110px',
                gridTemplateColumns: 'repeat(2, 1fr)',
            },
        },
        walletItem: {
            padding: 0,
            width: '100%',
            display: 'block',
        },
        providerIcon: {
            height: '100%',
            fontSize: 45,
            display: 'flex',
        },
    }
})

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
    const { t } = useI18N()

    return (
        <>
            <Box className={classes.root}>
                <section className={classes.section}>
                    <Typography className={classes.title} variant="h2" component="h2">
                        {t('plugin_wallet_guiding_step_1')}
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
                                    <ShadowRootTooltip title={network.name} placement="top">
                                        <div className={classes.iconWrapper}>
                                            {NetworkIconClickBait ? (
                                                <NetworkIconClickBait network={network}>
                                                    <ImageIcon icon={network.icon} />
                                                </NetworkIconClickBait>
                                            ) : (
                                                <ImageIcon icon={network.icon} />
                                            )}
                                            {undeterminedNetworkID === network.ID && (
                                                <SelectedIcon className={classes.checkedBadge} />
                                            )}
                                        </div>
                                    </ShadowRootTooltip>
                                </ListItem>
                            ))}
                    </List>
                </section>
                <section className={classes.section}>
                    <Typography className={classes.title} variant="h2" component="h2">
                        {t('plugin_wallet_guiding_step_2')}
                    </Typography>
                    <List className={classes.wallets}>
                        {providers
                            .filter((x) => x.providerAdaptorPluginID === undeterminedPluginID)
                            .map((provider) =>
                                ProviderIconClickBait ? (
                                    <ProviderIconClickBait
                                        key={provider.ID}
                                        network={
                                            networks.find((x) => x.ID === undeterminedNetworkID) ?? first(networks)!
                                        }
                                        provider={provider}
                                        onSubmit={onSubmit}>
                                        <ListItem className={classes.walletItem} key={provider.ID}>
                                            <ProviderIcon
                                                className={classes.providerIcon}
                                                icon={provider.icon}
                                                name={provider.name}
                                            />
                                        </ListItem>
                                    </ProviderIconClickBait>
                                ) : (
                                    <ListItem className={classes.walletItem} key={provider.ID}>
                                        <ProviderIcon
                                            className={classes.providerIcon}
                                            icon={provider.icon}
                                            name={provider.name}
                                        />
                                    </ListItem>
                                ),
                            )}
                    </List>
                </section>
            </Box>
        </>
    )
}
