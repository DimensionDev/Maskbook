import { useCallback, useEffect, useMemo, useState } from 'react'
import { useContainer } from 'unstated-next'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { formatBalance, TransactionStateType, useTransactionCallback } from '@masknet/web3-shared-evm'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { DrawDialog } from './DrawDialog'
import { Context } from '../../hooks/useContext'
import { BoxState, CardTab } from '../../type'
import { ArticlesTab } from './ArticlesTab'
import { DetailsTab } from './DetailsTab'
import { DrawResultDialog } from './DrawResultDialog'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../../Wallet/messages'
import { CountdownText } from './CountdownText'

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

    const {
        boxId,
        boxState,
        boxStateMessage,
        boxInfo,
        boxMetadata,
        contractDetailed,
        paymentCount,
        setPaymentCount,
        paymentTokenAddress,
        setPaymentTokenAddress,
        paymentTokenPrice,
        paymentTokenBalance,
        paymentTokenDetailed,

        // token ids
        lastPurchasedTokenIds,
        refreshLastPurchasedTokenIds,

        // transaction
        openBoxTransaction,
        openBoxTransactionOverrides,
        openBoxTransactionGasLimit,
        setOpenBoxTransactionOverrides,

        // retry
        retryMaskBoxInfo,
        retryBoxInfo,
        retryMaskBoxCreationSuccessEvent,
        retryMaskBoxTokensForSale,
        retryMaskBoxPurchasedTokens,
    } = useContainer(Context)

    //#region open box
    const [openBoxState, openBoxCallback, resetOpenBoxCallback] = useTransactionCallback(
        TransactionStateType.CONFIRMED,
        {
            ...openBoxTransaction?.config,
            gas: openBoxTransactionOverrides?.gas ?? openBoxTransactionGasLimit,
        },
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
    const onDraw = useCallback(async () => {
        setOpenDrawDialog(false)
        refreshLastPurchasedTokenIds()
        await openBoxCallback()
    }, [openBoxCallback, refreshLastPurchasedTokenIds])

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
    //#endregion

    const actionButtonLabel = useMemo(() => {
        if (!paymentTokenAddress) return boxStateMessage
        switch (boxState) {
            case BoxState.READY:
                const formatted = formatBalance(paymentTokenPrice, paymentTokenDetailed?.decimals ?? 0)
                return `${boxStateMessage} (${formatted}) ${paymentTokenDetailed?.symbol}`
            case BoxState.NOT_READY:
                return <CountdownText finishTime={boxInfo?.startAt.getTime() ?? 0} />
            default:
                return boxStateMessage
        }
    }, [paymentTokenAddress, boxStateMessage, boxInfo?.startAt])

    if (boxState === BoxState.UNKNOWN)
        return (
            <Box>
                <Skeleton animation="wave" variant="rectangular" width="100%" height={36} />
                <Skeleton animation="wave" variant="rectangular" width="100%" height={300} sx={{ marginTop: 2 }} />
            </Box>
        )
    if (boxState === BoxState.ERROR)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retryBoxInfo}>
                    Retry
                </Button>
            </Box>
        )
    if (boxState === BoxState.NOT_FOUND || !boxInfo)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Failed to load box.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retryMaskBoxInfo}>
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
        <Box>
            <AbstractTab height="" {...tabProps} state={state} />
            <EthereumWalletConnectedBoundary ActionButtonProps={{ size: 'medium' }}>
                <ActionButton
                    size="medium"
                    fullWidth
                    variant="contained"
                    disabled={boxState !== BoxState.READY}
                    onClick={() => setOpenDrawDialog(true)}>
                    {actionButtonLabel}
                </ActionButton>
            </EthereumWalletConnectedBoundary>
            <DrawDialog
                boxInfo={boxInfo}
                open={openDrawDialog}
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
    )
}
