import { memo, useCallback, useState } from 'react'
import { useAsyncFn } from 'react-use'
import {
    alpha,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    Typography,
} from '@mui/material'
import type { Web3Helper } from '@masknet/web3-helpers'
import { getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { Web3All, OthersAll } from '@masknet/web3-providers'
import { makeStyles, ShadowRootTooltip, usePortalShadowRoot } from '@masknet/theme'
import { type NetworkDescriptor, type ProviderIconClickBaitProps } from '@masknet/web3-shared-base'
import { ChainId, NETWORK_DESCRIPTORS as EVM_NETWORK_DESCRIPTORS, ProviderType } from '@masknet/web3-shared-evm'
import {
    NETWORK_DESCRIPTORS as SOL_NETWORK_DESCRIPTORS,
    ProviderType as SolProviderType,
} from '@masknet/web3-shared-solana'
import {
    NETWORK_DESCRIPTORS as FLOW_NETWORK_DESCRIPTORS,
    ProviderType as FlowProviderType,
} from '@masknet/web3-shared-flow'
import { DialogDismissIconUI, ImageIcon, ProviderIcon, useSharedI18N } from '@masknet/shared'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { openWindow } from '@masknet/shared-base-ui'

const descriptors: Record<
    NetworkPluginID,
    Array<NetworkDescriptor<Web3Helper.ChainIdAll, Web3Helper.NetworkTypeAll>>
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
            marginTop: 21,
            counterIncrement: 'steps 1',
            '&:first-of-type': {
                marginTop: 0,
            },
        },
        wallets: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridGap: '12px 12px',
            margin: theme.spacing(2, 0, 0),
            [smallQuery]: {
                gridAutoRows: '110px',
                gridTemplateColumns: 'repeat(2, 1fr)',
            },
        },
        walletItem: {
            padding: 0,
            height: 122,
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
        dialogTitle: {
            fontSize: 18,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            textAlign: 'center',
        },
        chooseNetwork: {
            fontSize: 14,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            paddingLeft: 32,
        },
        dialogCloseButton: {
            color: theme.palette.text.primary,
            padding: 0,
            width: 24,
            height: 24,
            '& > svg': {
                fontSize: 24,
            },
        },
        list: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridGap: '12px 12px',
        },
        listItem: {
            padding: theme.spacing(1.5),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            rowGap: 12,
        },
        listItemText: {
            fontSize: 12,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
        },
        dialogPaper: {
            margin: 0,
            maxWidth: 400,
            background: theme.palette.maskColor.bottom,
            boxShadow:
                theme.palette.mode === 'dark'
                    ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                    : '0px 0px 20px rgba(0, 0, 0, 0.05)',
        },
    }
})

export interface PluginProviderRenderProps {
    providers: Web3Helper.ProviderDescriptorAll[]
    onProviderIconClicked: (
        network: Web3Helper.NetworkDescriptorAll,
        provider: Web3Helper.ProviderDescriptorAll,
        isReady?: boolean,
        downloadLink?: string,
    ) => void
    ProviderIconClickBait?: React.ComponentType<
        ProviderIconClickBaitProps<Web3Helper.ChainIdAll, Web3Helper.ProviderTypeAll, Web3Helper.NetworkTypeAll>
    >
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
}

export const PluginProviderRender = memo(function PluginProviderRender({
    providers,
    ProviderIconClickBait,
    onProviderIconClicked,
    requiredSupportChainIds,
    requiredSupportPluginID,
}: PluginProviderRenderProps) {
    const { classes, cx } = useStyles()
    const t = useSharedI18N()
    const snsPlugins = useActivatedPluginsSNSAdaptor('any')
    const dashboardPlugins = useActivatedPluginsDashboard()
    const [selectChainDialogOpen, setSelectChainDialogOpen] = useState(false)

    const fortmaticProviderDescriptor = providers.find((x) => x.type === ProviderType.Fortmatic)

    const [{ error }, handleClick] = useAsyncFn(
        async (provider: Web3Helper.ProviderDescriptorAll, fortmaticChainId?: Web3Helper.ChainIdAll) => {
            if (provider.type === ProviderType.Fortmatic && !fortmaticChainId) {
                setSelectChainDialogOpen(true)
                return
            }
            const target = [...snsPlugins, ...dashboardPlugins].find(
                (x) => x.ID === (provider.providerAdaptorPluginID as string),
            )
            if (!target) return

            const isReady = target.Web3State?.Provider?.isReady(provider.type)
            const downloadLink = OthersAll.use(provider.providerAdaptorPluginID)?.providerResolver.providerDownloadLink(
                provider.type,
            )

            if (!isReady) {
                if (downloadLink) openWindow(downloadLink)
                return
            }

            const Web3 = Web3All.use(provider.providerAdaptorPluginID, {
                providerType: provider.type,
            })

            const chainId =
                fortmaticChainId ??
                (provider.type === ProviderType.WalletConnect || provider.type === ProviderType.WalletConnectV2
                    ? ChainId.Mainnet
                    : await Web3?.getChainId({ providerType: provider.type }))

            // use the currently connected network (if known to mask). otherwise, use the default mainnet
            const networkDescriptor =
                descriptors[provider.providerAdaptorPluginID].find((x) => x.chainId === chainId) ??
                descriptors[provider.providerAdaptorPluginID].find((x) => x.chainId === ChainId.Mainnet)

            if (!chainId || !networkDescriptor) return

            onProviderIconClicked(networkDescriptor, provider, isReady, downloadLink)
        },
        [snsPlugins, dashboardPlugins],
    )

    const getTips = useCallback((provider: Web3Helper.ProviderTypeAll) => {
        if (provider === SolProviderType.Phantom) {
            return t.plugin_wallet_solana_tips()
        } else if (provider === FlowProviderType.Blocto) {
            return t.plugin_wallet_blocto_tips()
        } else if (provider === ProviderType.Fortmatic) {
            return t.plugin_wallet_fortmatic_tips()
        }

        return t.plugin_wallet_support_chains_tips()
    }, [])

    const getDisabled = useCallback(
        (provider: Web3Helper.ProviderDescriptorAll) => {
            if (requiredSupportPluginID) {
                if (provider.providerAdaptorPluginID !== requiredSupportPluginID) return true
            }

            if (requiredSupportChainIds) {
                if (requiredSupportChainIds.some((x) => !provider.enableRequirements?.supportedChainIds?.includes(x)))
                    return true
            }

            return false
        },
        [requiredSupportChainIds, requiredSupportPluginID],
    )
    return (
        <>
            <Box className={classes.root}>
                <section className={classes.section}>
                    <List className={classes.wallets}>
                        {providers
                            .filter((z) => {
                                const siteType = getSiteType()
                                if (!siteType) return false
                                return [
                                    ...(z.enableRequirements?.supportedEnhanceableSites ?? []),
                                    ...(z.enableRequirements?.supportedExtensionSites ?? []),
                                ].includes(siteType)
                            })
                            .map((provider) => (
                                <ShadowRootTooltip
                                    title={getDisabled(provider) ? '' : getTips(provider.type)}
                                    arrow
                                    placement="top"
                                    key={provider.ID}>
                                    <ListItem
                                        className={cx(
                                            classes.walletItem,
                                            getDisabled(provider) ? classes.disabledWalletItem : '',
                                        )}
                                        disabled={getDisabled(provider)}
                                        onClick={() => {
                                            handleClick(provider)
                                        }}>
                                        {ProviderIconClickBait ? (
                                            <ProviderIconClickBait key={provider.ID} provider={provider}>
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
                                </ShadowRootTooltip>
                            ))}
                    </List>
                </section>
            </Box>
            {usePortalShadowRoot((container) => (
                <Dialog
                    container={container}
                    open={selectChainDialogOpen}
                    classes={{ paper: classes.dialogPaper }}
                    onClose={() => setSelectChainDialogOpen(false)}>
                    <DialogTitle
                        sx={{
                            whiteSpace: 'nowrap',
                            display: 'grid',
                            alignItems: 'center',
                            gridTemplateColumns: '50px auto 50px',
                        }}>
                        <IconButton
                            className={classes.dialogCloseButton}
                            onClick={() => setSelectChainDialogOpen(false)}>
                            <DialogDismissIconUI />
                        </IconButton>
                        <Typography className={classes.dialogTitle}>{t.plugin_wallet_connect_fortmatic()}</Typography>
                    </DialogTitle>
                    <DialogContent sx={{ minWidth: 352 }}>
                        <Typography className={classes.chooseNetwork}>{t.plugin_wallet_choose_network()}</Typography>
                        <List className={classes.list}>
                            {EVM_NETWORK_DESCRIPTORS.filter((x) =>
                                [ChainId.Mainnet, ChainId.BSC].includes(x.chainId),
                            ).map((x) => (
                                <ListItemButton
                                    key={x.chainId}
                                    className={classes.listItem}
                                    onClick={() => {
                                        if (!fortmaticProviderDescriptor) return
                                        handleClick(fortmaticProviderDescriptor, x.chainId)
                                    }}>
                                    <ImageIcon
                                        icon={x.icon}
                                        size={30}
                                        iconFilterColor={x.iconColor ? alpha(x.iconColor, 0.2) : undefined}
                                    />
                                    <Typography className={classes.listItemText}>{x.name}</Typography>
                                </ListItemButton>
                            ))}
                        </List>
                    </DialogContent>
                </Dialog>
            ))}
        </>
    )
})
