import { SelectedIcon } from '@masknet/icons'
import type { NetworkPluginID, Web3Plugin } from '@masknet/plugin-infra/web3'
import { ImageIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
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
            padding: theme.spacing(2, 3),
        },
        section: {
            flexGrow: 1,
            marginTop: 21,
            '&:first-child': {
                marginTop: 0,
            },
        },
        title: {
            fontSize: 14,
            fontWeight: 'bold',
        },
        list: {
            marginTop: 12,
            display: 'flex',
            gridGap: '16px 8px',
            flexWrap: 'wrap',
        },
        networkItem: {
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            alignItems: 'center',
            width: 72,
            padding: '12px 0px',
            borderRadius: 12,
            '&:hover': {
                background: theme.palette.background.default,
                '& p': {
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                },
            },
        },
        iconWrapper: {
            position: 'relative',
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: 'transparent',
        },
        checkedBadge: {
            position: 'absolute',
            right: '-5px',
            bottom: 0,
            width: 12,
            height: 12,
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
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: '130px',
            height: 72,
            gridGap: '16px 8px',
            margin: theme.spacing(2, 0, 0),
            [smallQuery]: {
                gridAutoRows: '110px',
                gridTemplateColumns: 'repeat(2, 1fr)',
            },
        },
        walletItem: {
            padding: 0,
            height: 88,
            width: '100%',
            display: 'block',
            '& > div': {
                borderRadius: 8,
            },
        },
        providerIcon: {
            height: '100%',
            fontSize: 36,
            display: 'flex',
        },
        networkName: {
            fontSize: 12,
            marginTop: 12,
            whiteSpace: 'nowrap',
            color: theme.palette.text.secondary,
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
    onSubmit: (result?: Web3Plugin.ConnectionResult) => Promise<void>
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
                                    <div className={classes.iconWrapper}>
                                        {NetworkIconClickBait ? (
                                            <NetworkIconClickBait network={network}>
                                                <ImageIcon size={30} icon={network.icon} />
                                            </NetworkIconClickBait>
                                        ) : (
                                            <ImageIcon size={30} icon={network.icon} />
                                        )}
                                        {undeterminedNetworkID === network.ID && (
                                            <SelectedIcon className={classes.checkedBadge} />
                                        )}
                                    </div>
                                    <Typography className={classes.networkName}>{network.type}</Typography>
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
                                        onSubmit={(network, provider, result) => {
                                            onSubmit(result)
                                        }}>
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
