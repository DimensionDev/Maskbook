import { Trans } from '@lingui/react/macro'
import { getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getAllPluginsWeb3State, getConnection } from '@masknet/web3-providers'
import { type NetworkDescriptor } from '@masknet/web3-shared-base'
import { ChainId, NETWORK_DESCRIPTORS as EVM_NETWORK_DESCRIPTORS, ProviderType } from '@masknet/web3-shared-evm'
import {
    NETWORK_DESCRIPTORS as FLOW_NETWORK_DESCRIPTORS,
    ProviderType as FlowProviderType,
} from '@masknet/web3-shared-flow'
import { NETWORK_DESCRIPTORS as SOL_NETWORK_DESCRIPTORS } from '@masknet/web3-shared-solana'
import { Box, List, ListItem, Typography } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { ProviderItem } from './ProviderItem.js'

const descriptors: Record<
    NetworkPluginID,
    ReadonlyArray<NetworkDescriptor<Web3Helper.ChainIdAll, Web3Helper.NetworkTypeAll>>
> = {
    [NetworkPluginID.PLUGIN_EVM]: EVM_NETWORK_DESCRIPTORS,
    [NetworkPluginID.PLUGIN_FLOW]: FLOW_NETWORK_DESCRIPTORS,
    [NetworkPluginID.PLUGIN_SOLANA]: SOL_NETWORK_DESCRIPTORS,
}

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
            marginTop: theme.spacing(2),
            counterIncrement: 'steps 1',
            '&:first-of-type': {
                marginTop: 0,
            },
        },
        wallets: {
            width: '100%',
            display: 'grid',
            padding: 0,
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridGap: '16px 16px',
            [smallQuery]: {
                gridAutoRows: '110px',
                gridTemplateColumns: 'repeat(2, 1fr)',
            },
        },
        walletItem: {
            padding: 0,
            width: '100%',
            display: 'block',
            '& > div': {
                borderRadius: 8,
            },
        },
        disabledWalletItem: {
            pointerEvents: 'none',
        },
        providerIcon: {
            height: '100%',
            fontSize: 36,
            display: 'flex',
            backgroundColor: theme.palette.maskColor.bottom,
            '&:hover': {
                background: theme.palette.maskColor.bg,
            },
        },
    }
})

interface PluginProviderRenderProps {
    providers: readonly Web3Helper.ProviderDescriptorAll[]
    onSelect: (network: Web3Helper.NetworkDescriptorAll, provider: Web3Helper.ProviderDescriptorAll) => void
    onOpenGuide?(provider: Web3Helper.ProviderDescriptorAll): void
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
}

export const PluginProviderRender = memo(function PluginProviderRender({
    providers,
    onSelect,
    onOpenGuide,
    requiredSupportChainIds,
    requiredSupportPluginID,
}: PluginProviderRenderProps) {
    const { classes, theme, cx } = useStyles()

    const [, handleClick] = useAsyncFn(
        async (provider: Web3Helper.ProviderDescriptorAll, expectedChainId?: Web3Helper.ChainIdAll) => {
            const target = getAllPluginsWeb3State()[provider.providerAdaptorPluginID]
            // note: unsafe cast, we cannot ensure provider.type is the isReady implementation we intended to call
            const isReady = target?.Provider?.isReady(provider.type as any as never)

            if (!isReady) {
                onOpenGuide?.(provider)
                return
            }

            const connection = getConnection(provider.providerAdaptorPluginID, { providerType: provider.type })
            const chainId =
                (expectedChainId ?? provider.type === ProviderType.WalletConnect) ?
                    ChainId.Mainnet
                :   await connection?.getChainId()

            // use the currently connected network (if known to mask). otherwise, use the default mainnet
            const networkDescriptor = descriptors[provider.providerAdaptorPluginID].find((x) => x.chainId === chainId)
            if (!networkDescriptor) return

            onSelect(networkDescriptor, provider)
        },
        [onOpenGuide],
    )

    const getTips = useCallback((provider: Web3Helper.ProviderTypeAll) => {
        if (provider === FlowProviderType.Blocto) {
            return <Trans>Blocto only supports the Flow chain.</Trans>
        }
        return
    }, [])

    const getDisabled = useCallback(
        (provider: Web3Helper.ProviderDescriptorAll) => {
            if (requiredSupportPluginID && provider.providerAdaptorPluginID !== requiredSupportPluginID) return true

            if (requiredSupportChainIds?.some((x) => !provider.enableRequirements?.supportedChainIds?.includes(x)))
                return true

            return false
        },
        [requiredSupportChainIds, requiredSupportPluginID],
    )
    const orderedProviders = useMemo(() => {
        const siteType = getSiteType()
        return providers.filter((z) => {
            if (!siteType) return false
            return [
                ...(z.enableRequirements?.supportedEnhanceableSites ?? []),
                ...(z.enableRequirements?.supportedExtensionSites ?? []),
            ].includes(siteType)
        })
    }, [providers])
    const [availableProviders, unavailableProviders] = useMemo(() => {
        const web3State = getAllPluginsWeb3State()
        const availableProviders: Web3Helper.ProviderDescriptorAll[] = []
        const unavailableProviders: Web3Helper.ProviderDescriptorAll[] = []
        orderedProviders.forEach((provider) => {
            // note: unsafe cast, we cannot ensure provider.type is the isReady implementation we intended to call
            const isReady = web3State[provider.providerAdaptorPluginID]?.Provider?.isReady(
                provider.type as any as never,
            )
            if (isReady) {
                availableProviders.push(provider)
            } else {
                unavailableProviders.push(provider)
            }
        })
        return [availableProviders, unavailableProviders]
    }, [orderedProviders])
    return (
        <Box className={classes.root}>
            <section className={classes.section}>
                <List className={classes.wallets}>
                    {availableProviders.map((provider) => (
                        <ShadowRootTooltip
                            title={getDisabled(provider) ? '' : getTips(provider.type)}
                            arrow
                            placement="top"
                            disableInteractive
                            key={provider.ID}>
                            <ListItem
                                className={cx(
                                    classes.walletItem,
                                    getDisabled(provider) ? classes.disabledWalletItem : '',
                                )}
                                disabled={getDisabled(provider)}
                                onClick={() => {
                                    if (provider.type === ProviderType.WalletConnect) {
                                        handleClick(provider, ChainId.Mainnet)
                                    } else {
                                        handleClick(provider)
                                    }
                                }}>
                                <ProviderItem
                                    className={classes.providerIcon}
                                    icon={provider.icon}
                                    name={provider.name}
                                    iconFilterColor={provider.iconFilterColor}
                                />
                            </ListItem>
                        </ShadowRootTooltip>
                    ))}
                </List>
            </section>
            {unavailableProviders.length ?
                <>
                    <Typography mt={2} color={theme.palette.maskColor.second} fontSize={14}>
                        <Trans>The following wallets are not installed or in conflict with others</Trans>
                    </Typography>
                    <section className={classes.section}>
                        <List className={classes.wallets}>
                            {unavailableProviders.map((provider) => (
                                <ShadowRootTooltip
                                    title={getDisabled(provider) ? '' : getTips(provider.type)}
                                    arrow
                                    placement="top"
                                    disableInteractive
                                    key={provider.ID}>
                                    <ListItem
                                        className={cx(
                                            classes.walletItem,
                                            getDisabled(provider) ? classes.disabledWalletItem : '',
                                        )}
                                        disabled={getDisabled(provider)}
                                        onClick={() => {
                                            if (provider.type === ProviderType.WalletConnect) {
                                                handleClick(provider, ChainId.Mainnet)
                                            } else {
                                                handleClick(provider)
                                            }
                                        }}>
                                        <ProviderItem
                                            className={classes.providerIcon}
                                            icon={provider.icon}
                                            name={provider.name}
                                            iconFilterColor={provider.iconFilterColor}
                                        />
                                    </ListItem>
                                </ShadowRootTooltip>
                            ))}
                        </List>
                    </section>
                </>
            :   null}
        </Box>
    )
})
