import { useCallback, useEffect, useMemo, useState } from 'react'
import { useContainer } from 'unstated-next'
import { makeStyles } from '@masknet/theme'
import { Box, Button, CircularProgress, Typography, useTheme } from '@mui/material'
import { TransactionStateType } from '@masknet/web3-shared-evm'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { DrawDialog } from './DrawDialog'
import { Context } from '../../hooks/useContext'
import { BoxState, CardTab } from '../../type'
import { ArticlesTab } from './ArticlesTab'
import { DetailsTab } from './DetailsTab'
import { DrawResultDialog } from './DrawResultDialog'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '../../../Wallet/messages'
import { useTransactionCallback } from '@masknet/plugin-infra/web3-evm'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary'
import { useChainId } from '@masknet/plugin-infra/web3'
import { formatBalance, NetworkPluginID } from '@masknet/web3-shared-base'

const useTabsStyles = makeStyles()((theme) => ({
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
    },
    tabs: {
        width: '100%',
        height: 36,
        minHeight: 36,
        margin: `0 ${location.host.includes('minds') ? '12px' : 'auto'}`,
        '& .Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        borderRadius: 4,
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: `${theme.spacing(2)} !important`,
    },
}))

export interface PreviewCardProps {}

export function PreviewCard(props: PreviewCardProps) {
    const { classes: tabClasses } = useTabsStyles()
    const state = useState(CardTab.Articles)
    const [openDrawDialog, setOpenDrawDialog] = useState(false)
    const [openDrawResultDialog, setOpenDrawResultDialog] = useState(false)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
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

    const txConfig = useMemo(() => {
        return {
            ...openBoxTransaction?.config,
            gas: openBoxTransactionOverrides?.gas ?? openBoxTransactionGasLimit,
        }
    }, [openBoxTransaction?.config, openBoxTransactionOverrides, openBoxTransactionGasLimit])

    // #region open box
    const [openBoxState, openBoxCallback, resetOpenBoxCallback] = useTransactionCallback(
        TransactionStateType.CONFIRMED,
        txConfig,
        openBoxTransaction?.method,
    )
    const onRefresh = useCallback(() => {
        state[1](CardTab.Articles)
        setPaymentCount(1)
        setPaymentTokenAddress('')
        resetOpenBoxCallback()
        retryMaskBoxInfo()
        retryMaskBoxCreationSuccessEvent()
        retryMaskBoxTokensForSale()
        retryMaskBoxPurchasedTokens()
    }, [
        resetOpenBoxCallback,
        retryMaskBoxInfo,
        retryMaskBoxCreationSuccessEvent,
        retryMaskBoxTokensForSale,
        retryMaskBoxPurchasedTokens,
    ])
    const [drawing, setDrawing] = useState(false)
    const onDraw = useCallback(async () => {
        setDrawing(true)
        refreshLastPurchasedTokenIds()
        try {
            await openBoxCallback()
            retryMaskBoxStatus()
            setOpenDrawDialog(false)
        } catch {}
        setDrawing(false)
    }, [openBoxCallback, refreshLastPurchasedTokenIds, retryMaskBoxStatus])

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            const isConfirmed = openBoxState.type === TransactionStateType.CONFIRMED
            if (isConfirmed) {
                onRefresh()
                setOpenDrawResultDialog(true)
            }
        },
    )

    useEffect(() => {
        if (openBoxState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: openBoxState,
            summary: `Open ${boxInfo?.name ?? 'box'}...`,
        })
    }, [openBoxState.type])
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

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Articles',
                children: boxInfo ? <ArticlesTab boxInfo={boxInfo} boxMetadata={boxMetadata} /> : null,
                sx: { p: 0 },
            },
            {
                label: 'Details',
                children: boxInfo ? <DetailsTab boxInfo={boxInfo} boxMetadata={boxMetadata} /> : null,
                sx: { p: 0 },
            },
        ],
        state,
        classes: tabClasses,
    }

    return (
        <>
            <Box>
                <AbstractTab height="" {...tabProps} state={state} />

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
            </Box>
            <Box style={{ padding: 12 }}>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <WalletConnectedBoundary ActionButtonProps={{ size: 'medium' }}>
                        <ActionButton
                            size="medium"
                            fullWidth
                            variant="contained"
                            sx={{
                                backgroundColor: theme.palette.maskColor.dark,
                                color: 'white',
                                width: '100%',
                                '&:hover': {
                                    background: theme.palette.maskColor.dark,
                                },
                            }}
                            disabled={boxState !== BoxState.READY}
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
        </>
    )
}
