import { useCallback, useMemo, useState } from 'react'
import Color from 'color'
import { useContainer } from '@masknet/shared-base-ui'
import { TabContext, TabPanel } from '@mui/lab'
import { useChainContext, useNetworkDescriptor, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { makeStyles, ActionButton, LoadingBase, useTabs, MaskTabList } from '@masknet/theme'
import { Box, Button, Chip, Paper, Tab, Typography, useTheme } from '@mui/material'
import { WalletConnectedBoundary, ChainBoundary, ImageIcon, TokenIcon } from '@masknet/shared'
import { useTransactionCallback } from '@masknet/web3-hooks-evm'
import { formatCurrency } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Context } from '../../hooks/useContext.js'
import { BoxState } from '../../type.js'
import { ArticlesTab } from './ArticlesTab.js'
import { DetailsTab } from './DetailsTab.js'
import { DrawDialog } from './DrawDialog.js'
import { DrawResultDialog } from './DrawResultDialog.js'
import { Trans } from '@lingui/macro'

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
        color: theme.palette.maskColor.publicSecond,
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
        color: theme.palette.maskColor.publicMain,
        fontSize: 18,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: 250,
    },
    active: {
        color: theme.palette.maskColor.white,
        width: 65,
        height: 32,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: theme.palette.maskColor.success,
    },
    close: {
        color: theme.palette.maskColor.white,
        width: 65,
        backgroundColor: new Color(theme.palette.maskColor.primary).alpha(0.1).toString(),
        height: 32,
        fontSize: 12,
        fontWeight: 700,
    },
    iconBox: {
        position: 'absolute',
        bottom: 0,
        right: -8,
        padding: 1,
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
    statusBox: {
        display: 'flex',
        justifyContent: 'end',
        alignItems: 'center',
        height: 148,
        flexDirection: 'column',
    },
}))

export function PreviewCard() {
    const { classes } = useTabsStyles()
    const [openDrawDialog, setOpenDrawDialog] = useState(false)
    const [openDrawResultDialog, setOpenDrawResultDialog] = useState(false)
    const { chainId } = useChainContext()
    const networkDescriptor = useNetworkDescriptor()
    const theme = useTheme()
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
    const Utils = useWeb3Utils()
    // #endregion

    if (boxState === BoxState.UNKNOWN)
        return (
            <Box className={classes.statusBox}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingBase />
                </Box>
            </Box>
        )
    if (boxState === BoxState.ERROR)
        return (
            <Box className={classes.statusBox}>
                <Typography color="error">
                    <Trans>Load failed</Trans>
                </Typography>
                <Button
                    sx={{
                        width: 254,
                        backgroundColor: theme.palette.maskColor.publicMain,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: theme.palette.maskColor.publicMain,
                        },
                        height: 40,
                        marginBottom: 2,
                        marginTop: '26px',
                    }}
                    size="small"
                    variant="roundedContained"
                    onClick={retryBoxInfo}>
                    <Trans>Reload</Trans>
                </Button>
            </Box>
        )
    if (boxState === BoxState.NOT_FOUND || !boxInfo)
        return (
            <Box className={classes.statusBox}>
                <Typography color="error">
                    <Trans>Load failed</Trans>
                </Typography>
                <Button
                    sx={{
                        width: 254,
                        backgroundColor: theme.palette.maskColor.publicMain,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: theme.palette.maskColor.publicMain,
                        },
                        height: 40,
                        marginBottom: 2,
                        marginTop: '26px',
                    }}
                    size="small"
                    variant="roundedContained"
                    onClick={retryMaskBoxInfo}>
                    <Trans>Reload</Trans>
                </Button>
            </Box>
        )

    const Tabs = [
        {
            value: tabs.Articles,
            label: <Trans>Articles</Trans>,
        },
        {
            value: tabs.Details,
            label: <Trans>Details</Trans>,
        },
    ]

    return (
        <>
            <TabContext value={currentTab}>
                <Box className={classes.header}>
                    <Box className={classes.imgBox}>
                        <TokenIcon
                            address={boxInfo.tokenAddress ?? ''}
                            name={boxInfo.name}
                            chainId={chainId}
                            sx={{ width: 48, height: 48 }}
                        />
                        <Box className={classes.iconBox}>
                            <ImageIcon size={24} icon={networkDescriptor?.icon} className={classes.icon} />
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography title={boxInfo.name} className={classes.name}>
                            {boxInfo.name}
                        </Typography>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
                                <Typography
                                    sx={{ paddingRight: 1 }}
                                    color={theme.palette.maskColor.publicSecond}
                                    fontSize={14}
                                    fontWeight={400}>
                                    <Trans>Solid:</Trans>
                                </Typography>
                                <Typography color={theme.palette.maskColor.publicMain} fontSize={14} fontWeight="bold">
                                    {boxInfo.sold}/{boxInfo.total}
                                </Typography>
                                <Typography
                                    sx={{ paddingRight: 1, paddingLeft: 1 }}
                                    color={theme.palette.maskColor.publicSecond}
                                    fontSize={14}
                                    fontWeight={400}>
                                    <Trans>Limit:</Trans>
                                </Typography>
                                <Typography color={theme.palette.maskColor.publicMain} fontSize={14} fontWeight="bold">
                                    {boxInfo.personalLimit}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Typography
                                    sx={{ paddingRight: 1 }}
                                    color={theme.palette.maskColor.publicSecond}
                                    fontSize={14}
                                    fontWeight={400}>
                                    <Trans>by</Trans>
                                </Typography>
                                <Typography
                                    color={theme.palette.maskColor.publicMain}
                                    fontSize={14}
                                    fontWeight="bold"
                                    title={boxInfo.creator}>
                                    {Utils.formatAddress(boxInfo.creator, 4)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Chip
                        className={boxState === BoxState.READY ? classes.active : classes.close}
                        label={boxState === BoxState.READY ? <Trans>Active</Trans> : <Trans>Closed</Trans>}
                    />
                </Box>
                <Box className={classes.body}>
                    <MaskTabList variant="base" aria-label="maskbox" onChange={onChange}>
                        {Tabs.map((x) => (
                            <Tab
                                key={x.value}
                                value={x.value}
                                label={x.label}
                                className={x.value === currentTab ? classes.tabActive : classes.tab}
                            />
                        ))}
                    </MaskTabList>
                </Box>
                <Paper className={classes.content}>
                    <TabPanel value={tabs.Articles} key={tabs.Articles} sx={{ padding: 0 }}>
                        {boxInfo ?
                            <ArticlesTab boxMetadata={boxMetadata} />
                        :   null}
                    </TabPanel>
                    <TabPanel value={tabs.Details} key={tabs.Details} sx={{ padding: 0 }}>
                        {boxInfo ?
                            <DetailsTab boxMetadata={boxMetadata} />
                        :   null}
                    </TabPanel>
                </Paper>

                <Box style={{ padding: 12 }}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={chainId as ChainId}
                        ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                        <WalletConnectedBoundary
                            expectedChainId={chainId}
                            ActionButtonProps={{ size: 'medium', variant: 'roundedDark' }}
                            classes={{ button: classes.button }}>
                            <ActionButton
                                loading={isOpening}
                                size="medium"
                                variant="roundedDark"
                                fullWidth
                                disabled={boxState !== BoxState.READY || isOpening}
                                onClick={() => setOpenDrawDialog(true)}>
                                {(() => {
                                    return boxState === BoxState.READY && paymentTokenAddress ?
                                            <Trans>
                                                {boxStateMessage} ({formatCurrency(paymentTokenPrice, '')}{' '}
                                                {paymentTokenDetailed?.symbol ?? ''}/Time)
                                            </Trans>
                                        :   boxStateMessage
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
