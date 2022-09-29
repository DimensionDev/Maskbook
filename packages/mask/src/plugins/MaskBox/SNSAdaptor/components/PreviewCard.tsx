import { useCallback, useMemo, useState } from 'react'
import { useWeb3State, useNetworkDescriptor, useChainId } from '@masknet/plugin-infra/web3'
import { useContainer } from 'unstated-next'
import { makeStyles, ActionButton, LoadingBase, useTabs, MaskTabList } from '@masknet/theme'
import { Box, Button, Paper, Tab, Typography, useTheme } from '@mui/material'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary.js'
import { Context } from '../../hooks/useContext.js'
import { BoxState, CardTab } from '../../type.js'
import { ArticlesTab } from './ArticlesTab.js'
import { DetailsTab } from './DetailsTab.js'
import { DrawDialog } from './DrawDialog.js'
import { DrawResultDialog } from './DrawResultDialog.js'
import { useTransactionCallback } from '@masknet/plugin-infra/web3-evm'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary.js'
import { formatBalance, NetworkPluginID } from '@masknet/web3-shared-base'

import { useI18N } from '../../locales/index.js'
import { TabContext, TabPanel } from '@mui/lab'
import { ImageIcon, TokenIcon } from '@masknet/shared'
import type { ChainId } from '@masknet/web3-shared-evm'

const useTabsStyles = makeStyles()((theme) => ({
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.maskColor.white,
        fontSize: 14,
        fontWeight: 700,
        width: '100%',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        margin: '0 !important',
    },
    tab: {
        whiteSpace: 'nowrap',
        background: 'transparent',
        color: theme.palette.maskColor.second,
        '&:hover': {
            background: 'transparent',
        },
    },
    tabActive: {
        background: theme.palette.maskColor.white,
        color: theme.palette.maskColor.publicMain,
        '&:hover': {
            background: theme.palette.maskColor.white,
        },
    },
    body: {
        padding: 12,
        paddingBottom: 0,
    },
    content: {
        margin: '0 12px',
        flex: 1,
        backgroundColor: theme.palette.maskColor.white,
        overflow: 'auto',
        borderRadius: '0 0 12px 12px',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    header: {
        gap: 24,
        display: 'flex',
        padding: 12,
        alignItems: 'center',
    },
    imgBox: {
        width: 50,
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    name: {
        color: theme.palette.maskColor.main,
        fontSize: 18,
        fontWeight: 700,
    },
    active: {
        backgroundColor: theme.palette.maskColor.success,
        color: theme.palette.maskColor.bottom,
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 9999,
        padding: '8px 12px',
        width: 65,
        textAlign: 'center',
    },
    iconBox: {
        position: 'absolute',
        bottom: 0,
        right: -8,
        padding: 2,
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 9999,
        lineHeight: 0,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },
    icon: {
        width: 20,
        height: 20,
    },
}))

export interface PreviewCardProps {}

export function PreviewCard(props: PreviewCardProps) {
    const { classes: tabClasses } = useTabsStyles()
    const state = useState(CardTab.Articles)
    const [openDrawDialog, setOpenDrawDialog] = useState(false)
    const [openDrawResultDialog, setOpenDrawResultDialog] = useState(false)
    const chainId = useChainId()
    const networkDescriptor = useNetworkDescriptor()
    const theme = useTheme()
    const t = useI18N()
    const {
        boxState,
        boxStateMessage,
        boxInfo,
        boxMetadata,
        contractDetailed,
        setPaymentCount,
        paymentTokenAddress,
        setPaymentTokenAddress,
        paymentTokenPrice,
        paymentTokenDetailed,

        refreshLastPurchasedTokenIds,

        // transaction
        openBoxTransaction,
        openBoxTransactionOverrides,
        openBoxTransactionGasLimit,
        setOpenBoxTransactionOverrides,

        // retry
        retryMaskBoxStatus,
        retryMaskBoxInfo,
        retryBoxInfo,
        retryMaskBoxCreationSuccessEvent,
        retryMaskBoxTokensForSale,
        retryMaskBoxPurchasedTokens,
    } = useContainer(Context)

    const [currentTab, onChange, tabs] = useTabs('Articles', 'Details')

    const txConfig = useMemo(() => {
        return {
            ...openBoxTransaction?.config,
            gas: openBoxTransactionOverrides?.gas ?? openBoxTransactionGasLimit,
        }
    }, [openBoxTransaction?.config, openBoxTransactionOverrides, openBoxTransactionGasLimit])

    // #region open box
    const [{ loading: isOpening }, openBoxCallback] = useTransactionCallback(txConfig, openBoxTransaction?.method)
    const onRefresh = useCallback(() => {
        state[1](CardTab.Articles)
        setPaymentCount(1)
        setPaymentTokenAddress('')
        retryMaskBoxInfo()
        retryMaskBoxCreationSuccessEvent()
        retryMaskBoxTokensForSale()
        retryMaskBoxPurchasedTokens()
    }, [retryMaskBoxInfo, retryMaskBoxCreationSuccessEvent, retryMaskBoxTokensForSale, retryMaskBoxPurchasedTokens])
    const [drawing, setDrawing] = useState(false)
    const onDraw = useCallback(async () => {
        setDrawing(true)
        refreshLastPurchasedTokenIds()
        try {
            await openBoxCallback()
            onRefresh()
            setOpenDrawResultDialog(true)
            retryMaskBoxStatus()
            setOpenDrawDialog(false)
        } catch {}
        setDrawing(false)
    }, [openBoxCallback, refreshLastPurchasedTokenIds, onRefresh, retryMaskBoxStatus])
    const { Others } = useWeb3State()
    // #endregion

    if (boxState === BoxState.UNKNOWN)
        return (
            <Box sx={{ display: 'flex', padding: 2, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingBase />
            </Box>
        )
    if (boxState === BoxState.ERROR)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="error">Something went wrong.</Typography>
                <Button
                    sx={{
                        margin: 1.125,
                        width: 254,
                        backgroundColor: theme.palette.maskColor.dark,
                        color: 'white',
                        '&:.hover': {
                            backgroundColor: theme.palette.maskColor.dark,
                        },
                    }}
                    size="small"
                    onClick={retryBoxInfo}>
                    Retry
                </Button>
            </Box>
        )
    if (boxState === BoxState.NOT_FOUND || !boxInfo)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="error">Failed to load box.</Typography>
                <Button
                    sx={{
                        margin: 1.125,
                        width: 254,
                        backgroundColor: theme.palette.maskColor.dark,
                        color: 'white',
                        '&:.hover': {
                            backgroundColor: theme.palette.maskColor.dark,
                        },
                    }}
                    size="small"
                    onClick={retryMaskBoxInfo}>
                    Retry
                </Button>
            </Box>
        )

    const Tabs = [
        {
            value: tabs.Articles,
            label: t.articles(),
        },
        {
            value: tabs.Details,
            label: t.details(),
        },
    ]

    return (
        <>
            <TabContext value={currentTab}>
                <Box className={tabClasses.header}>
                    <Box className={tabClasses.imgBox}>
                        <TokenIcon
                            address={boxInfo.tokenAddress ?? ''}
                            name={boxInfo.name}
                            chainId={chainId}
                            AvatarProps={{ sx: { width: 48, height: 48 } }}
                        />
                        <Box className={tabClasses.iconBox}>
                            <ImageIcon size={24} icon={networkDescriptor?.icon} classes={{ icon: tabClasses.icon }} />
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography className={tabClasses.name} color="textPrimary">
                            {boxInfo.name}
                        </Typography>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                                <Typography
                                    sx={{ paddingRight: 1 }}
                                    color={theme.palette.maskColor.second}
                                    fontSize={14}
                                    fontWeight={400}>
                                    {t.sold()}
                                </Typography>
                                <Typography color="textPrimary" fontSize={14} fontWeight="bold">
                                    {boxInfo.sold}/{boxInfo.total}
                                </Typography>
                                <Typography
                                    sx={{ paddingRight: 1, paddingLeft: 1 }}
                                    color={theme.palette.maskColor.second}
                                    fontSize={14}
                                    fontWeight={400}>
                                    {t.limit()}
                                </Typography>
                                <Typography color="textPrimary" fontSize={14} fontWeight="bold">
                                    1
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Typography
                                    sx={{ paddingRight: 1 }}
                                    color={theme.palette.maskColor.second}
                                    fontSize={14}
                                    fontWeight={400}>
                                    {t.by()}
                                </Typography>
                                <Typography color="textPrimary" fontSize={14} fontWeight="bold" title={boxInfo.creator}>
                                    {Others?.formatAddress(boxInfo.creator, 4)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    {boxState === BoxState.READY ? (
                        <Typography className={tabClasses.active}>{t.active()}</Typography>
                    ) : null}
                </Box>
                <Box className={tabClasses.body}>
                    <MaskTabList variant="base" aria-label="maskbox" onChange={onChange}>
                        {Tabs.map((x) => (
                            <Tab
                                key={x.value}
                                value={x.value}
                                label={x.label}
                                className={x.value === currentTab ? tabClasses.tabActive : tabClasses.tab}
                            />
                        ))}
                    </MaskTabList>
                </Box>
                <Paper className={tabClasses.content}>
                    <TabPanel value={tabs.Articles} key={tabs.Articles} sx={{ padding: 0 }}>
                        {boxInfo ? <ArticlesTab boxInfo={boxInfo} boxMetadata={boxMetadata} /> : null}
                    </TabPanel>
                    <TabPanel value={tabs.Details} key={tabs.Details} sx={{ padding: 0 }}>
                        {boxInfo ? <DetailsTab boxInfo={boxInfo} boxMetadata={boxMetadata} /> : null}
                    </TabPanel>
                </Paper>

                <Box style={{ padding: 12 }}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={chainId as ChainId}
                        ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                        <WalletConnectedBoundary
                            ActionButtonProps={{ size: 'medium', variant: 'roundedDark' }}
                            classes={{ button: tabClasses.button }}>
                            <ActionButton
                                loading={isOpening}
                                size="medium"
                                variant="roundedDark"
                                fullWidth
                                disabled={boxState !== BoxState.READY || isOpening}
                                onClick={() => setOpenDrawDialog(true)}>
                                {(() => {
                                    return boxState === BoxState.READY && paymentTokenAddress
                                        ? t.action_title({
                                              title: boxStateMessage,
                                              price: formatBalance(
                                                  paymentTokenPrice,
                                                  paymentTokenDetailed?.decimals ?? 0,
                                              ),
                                              symbol: paymentTokenDetailed?.symbol ?? '',
                                          })
                                        : boxStateMessage
                                })()}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </Box>
            </TabContext>
            <DrawDialog
                boxInfo={boxInfo}
                open={openDrawDialog}
                drawing={drawing}
                onClose={() => {
                    setOpenBoxTransactionOverrides(null)
                    setOpenDrawDialog(false)
                }}
                onSubmit={onDraw}
            />
            <DrawResultDialog
                boxInfo={boxInfo}
                contractDetailed={contractDetailed}
                open={openDrawResultDialog}
                onClose={() => {
                    refreshLastPurchasedTokenIds()
                    setOpenDrawResultDialog(false)
                }}
            />
        </>
    )
}
