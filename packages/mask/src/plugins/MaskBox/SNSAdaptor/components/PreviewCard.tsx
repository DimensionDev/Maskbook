import { useCallback, useMemo, useState } from 'react'
import { useContainer } from 'unstated-next'
import { makeStyles, ActionButton, useTabs, MaskTabList } from '@masknet/theme'
import { Box, Button, CircularProgress, Paper, Tab, Typography, useTheme } from '@mui/material'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'
import { Context } from '../../hooks/useContext'
import { BoxState, CardTab } from '../../type'
import { ArticlesTab } from './ArticlesTab'
import { DetailsTab } from './DetailsTab'
import { DrawDialog } from './DrawDialog'
import { DrawResultDialog } from './DrawResultDialog'
import { useTransactionCallback, TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary'
import { formatBalance, NetworkPluginID } from '@masknet/web3-shared-base'
import { TabContext } from '@mui/lab'
import { formatAddress } from '@masknet/web3-shared-flow'
import { ImageIcon, TokenIcon } from '@masknet/shared'
import { useNetworkDescriptor } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../locales'

const useTabsStyles = makeStyles()((theme) => ({
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: 'white',
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
        background: '#fff',
        color: theme.palette.maskColor.publicMain,
        '&:hover': {
            background: '#fff',
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
        background: '#fff !important',
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
        fontWeight: 'bold',
    },
    active: {
        backgroundColor: theme.palette.maskColor.success,
        color: theme.palette.maskColor.bottom,
        fontSize: 12,
        fontWeight: 'bold',
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
    const { targetChainId } = TargetChainIdContext.useContainer()
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, targetChainId)
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

    // #endregion

    if (boxState === BoxState.UNKNOWN)
        return (
            <Box sx={{ display: 'flex', padding: 2, justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
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

    const renderTab = () => {
        const tabMap = {
            [tabs.Articles]: boxInfo ? <ArticlesTab boxInfo={boxInfo} boxMetadata={boxMetadata} /> : null,
            [tabs.Details]: boxInfo ? <DetailsTab boxInfo={boxInfo} boxMetadata={boxMetadata} /> : null,
        }

        return tabMap[currentTab] || null
    }

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
                            chainId={targetChainId}
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
                                    {1}
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
                                <Typography color="textPrimary" fontSize={14} fontWeight="bold">
                                    {formatAddress(boxInfo.creator, 4)}
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
                        {Tabs.map((x, i) => (
                            <Tab
                                key={i}
                                value={x.value}
                                label={x.label}
                                className={x.value === currentTab ? tabClasses.tabActive : tabClasses.tab}
                            />
                        ))}
                    </MaskTabList>
                </Box>
                <Paper className={tabClasses.content}>{renderTab()}</Paper>

                <Box style={{ padding: 12 }}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={targetChainId}
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
                                    return boxState === BoxState.READY && paymentTokenAddress ? (
                                        <>
                                            {boxStateMessage} (
                                            {formatBalance(paymentTokenPrice, paymentTokenDetailed?.decimals ?? 0)}{' '}
                                            {paymentTokenDetailed?.symbol}/Time)
                                        </>
                                    ) : (
                                        boxStateMessage
                                    )
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
