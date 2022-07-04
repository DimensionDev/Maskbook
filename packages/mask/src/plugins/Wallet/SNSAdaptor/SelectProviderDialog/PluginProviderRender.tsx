import { useMemo } from 'react'
import { first } from 'lodash-unified'
import { SelectedIcon } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import { getSiteType } from '@masknet/shared-base'
import { Web3Helper, Web3Plugin, useWeb3State } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, List, ListItem, Typography } from '@mui/material'
import { useI18N } from '../../../../utils'
import { ProviderIcon } from './ProviderIcon'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`

    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(2),
            counterReset: 'steps 0',
        },
        section: {
            flexGrow: 1,
            marginTop: 21,
            counterIncrement: 'steps 1',
            '&:first-child': {
                marginTop: 0,
            },
        },
        title: {
            fontSize: 14,
            fontWeight: 'bold',
            '&:before': {
                content: 'counter(steps) ". "',
            },
        },
        list: {
            marginTop: 12,
            display: 'flex',
            gridGap: '16px 10.5px',
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
                    fontWeight: 700,
                },
            },
        },
        iconWrapper: {
            position: 'relative',
            cursor: 'pointer',
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
            background: theme.palette.background.paper,
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
            maxHeight: 180,
            gridGap: '12px 12px',
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
        selected: {
            color: theme.palette.text.primary,
            fontWeight: 700,
        },
        disabled: {
            opacity: 0.5,
            pointerEvents: 'none',
            cursor: 'default',
        },
    }
})

export interface PluginProviderRenderProps {
    networks: Web3Helper.NetworkDescriptorAll[]
    providers: Web3Helper.ProviderDescriptorAll[]
    undeterminedPluginID?: NetworkPluginID
    undeterminedNetworkID?: string
    onNetworkIconClicked: (network: Web3Helper.NetworkDescriptorAll) => void
    onProviderIconClicked: (
        network: Web3Helper.NetworkDescriptorAll,
        provider: Web3Helper.ProviderDescriptorAll,
    ) => void
    NetworkIconClickBait?: React.ComponentType<
        Web3Plugin.UI.NetworkIconClickBaitProps<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['ProviderType'],
            Web3Helper.Definition[NetworkPluginID]['NetworkType']
        >
    >
    ProviderIconClickBait?: React.ComponentType<
        Web3Plugin.UI.ProviderIconClickBaitProps<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['ProviderType'],
            Web3Helper.Definition[NetworkPluginID]['NetworkType']
        >
    >
    supportedNetworkList?: Array<Web3Helper.NetworkDescriptorAll['type']>
}

export function PluginProviderRender({
    networks,
    providers,
    undeterminedPluginID,
    undeterminedNetworkID,
    NetworkIconClickBait,
    ProviderIconClickBait,
    supportedNetworkList,
    onNetworkIconClicked,
    onProviderIconClicked,
}: PluginProviderRenderProps) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const selectedNetwork = useMemo(() => {
        return networks.find((x) => x.ID === undeterminedNetworkID) ?? first(networks)!
    }, [undeterminedNetworkID, networks.map((x) => x.ID).join()])

    return (
        <>
            <Box className={classes.root}>
                <section className={classes.section}>
                    <Typography className={classes.title} variant="h2" component="h2">
                        {t('plugin_wallet_choose_network')}
                    </Typography>
                    <List className={classes.list}>
                        {networks
                            ?.filter((x) => x.isMainnet)
                            .map((network, i) => (
                                <NetworkItem
                                    key={i}
                                    disabled={Boolean(
                                        supportedNetworkList && !supportedNetworkList?.includes(network.type),
                                    )}
                                    onNetworkIconClicked={onNetworkIconClicked}
                                    NetworkIconClickBait={NetworkIconClickBait}
                                    network={network}
                                    selected={undeterminedNetworkID === network.ID}
                                />
                            ))}
                    </List>
                </section>
                <section className={classes.section}>
                    <Typography className={classes.title} variant="h2" component="h2">
                        {t('plugin_wallet_choose_wallet')}
                    </Typography>
                    <List className={classes.wallets}>
                        {providers
                            .filter((x) => x.providerAdaptorPluginID === undeterminedPluginID)
                            .filter((y) => y.enableRequirements?.supportedChainIds?.includes(selectedNetwork.chainId))
                            .filter((z) => {
                                const siteType = getSiteType()
                                if (!siteType) return false
                                return [
                                    ...(z.enableRequirements?.supportedEnhanceableSites ?? []),
                                    ...(z.enableRequirements?.supportedExtensionSites ?? []),
                                ].includes(siteType)
                            })
                            .map((provider) => (
                                <ListItem
                                    className={classes.walletItem}
                                    key={provider.ID}
                                    onClick={() => {
                                        onProviderIconClicked(selectedNetwork, provider)
                                    }}>
                                    {ProviderIconClickBait ? (
                                        <ProviderIconClickBait
                                            key={provider.ID}
                                            network={selectedNetwork}
                                            provider={provider}>
                                            <ProviderIcon
                                                className={classes.providerIcon}
                                                icon={provider.icon}
                                                name={provider.name}
                                                iconFilterColor={provider.iconFilterColor}
                                            />
                                        </ProviderIconClickBait>
                                    ) : (
                                        <ProviderIcon
                                            className={classes.providerIcon}
                                            icon={provider.icon}
                                            name={provider.name}
                                            iconFilterColor={provider.iconFilterColor}
                                        />
                                    )}
                                </ListItem>
                            ))}
                    </List>
                </section>
            </Box>
        </>
    )
}

interface NetworkItemProps {
    onNetworkIconClicked: PluginProviderRenderProps['onNetworkIconClicked']
    NetworkIconClickBait?: PluginProviderRenderProps['NetworkIconClickBait']
    network: Web3Helper.NetworkDescriptorAll
    disabled: boolean
    selected: boolean
}

function NetworkItem({
    onNetworkIconClicked,
    NetworkIconClickBait,
    network,
    selected,
    disabled = false,
}: NetworkItemProps) {
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State<'all'>(network.networkSupporterPluginID)
    return (
        <ListItem
            className={cx(classes.networkItem, disabled ? classes.disabled : '')}
            key={network.ID}
            onClick={() => {
                onNetworkIconClicked(network)
            }}>
            <div className={classes.iconWrapper} style={{ boxShadow: `3px 10px 15px -8px ${network.iconColor}` }}>
                {NetworkIconClickBait ? (
                    <NetworkIconClickBait network={network}>
                        <ImageIcon size={30} icon={network.icon} />
                    </NetworkIconClickBait>
                ) : (
                    <ImageIcon size={30} icon={network.icon} />
                )}
                {selected && <SelectedIcon className={classes.checkedBadge} />}
            </div>
            <Typography className={cx(classes.networkName, selected ? classes.selected : '')}>
                {Others?.chainResolver.chainName(network.chainId)}
            </Typography>
        </ListItem>
    )
}
