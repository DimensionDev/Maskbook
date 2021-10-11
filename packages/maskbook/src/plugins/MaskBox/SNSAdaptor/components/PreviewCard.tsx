import { useCallback, useEffect, useState } from 'react'
import { useContainer } from 'unstated-next'
import { Box, Button, Skeleton, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { formatBalance, TransactionStateType } from '@masknet/web3-shared'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { DrawDialog } from './DrawDialog'
import { Context } from '../../hooks/useContext'
import { BoxState, CardTab } from '../../type'
import { ArticlesTab } from './ArticlesTab'
import { DetailsTab } from './DetailsTab'
import { DrawResultDialog } from './DrawResultDialog'
import { useOpenBoxCallback } from '../../hooks/useOpenBoxCallback'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../../Wallet/messages'

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
        marginTop: theme.spacing(3),
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
        boxInfo: boxInfo_,
        contractDetailed,
        paymentCount,
        setPaymentCount,
        paymentTokenAddress,
        setPaymentTokenAddress,
        paymentTokenPrice,
        paymentTokenDetailed,
    } = useContainer(Context)
    const { value: boxInfo, loading: loadingBoxInfo, error: errorBoxInfo, retry: retryBoxInfo } = boxInfo_

    //#region open box
    const [openBoxState, openBoxCallback, resetOpenBoxCallback] = useOpenBoxCallback(boxId, paymentCount)
    const onDraw = useCallback(async () => {
        await openBoxCallback()
    }, [openBoxCallback])

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            retryBoxInfo()
            setPaymentCount(1)
            setPaymentTokenAddress('')
            resetOpenBoxCallback()
        },
    )

    useEffect(() => {
        if (openBoxState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: openBoxState,
            summary: `Open ${boxInfo?.name ?? 'box'}...`,
        })
    }, [openBoxState, setTransactionDialog])
    //#endregion

    if (loadingBoxInfo)
        return (
            <Box>
                <Skeleton animation="wave" variant="rectangular" width="100%" height={36} />
                <Skeleton animation="wave" variant="rectangular" width="100%" height={300} sx={{ marginTop: 2 }} />
            </Box>
        )
    if (errorBoxInfo)
        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography color="textPrimary">Something went wrong.</Typography>
                <Button sx={{ marginTop: 1 }} size="small" onClick={retryBoxInfo}>
                    Retry
                </Button>
            </Box>
        )
    if (!boxInfo) return null

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Articles',
                children: boxInfo ? <ArticlesTab boxInfo={boxInfo} /> : null,
                sx: { p: 0 },
            },
            {
                label: 'Details',
                children: boxInfo ? <DetailsTab boxInfo={boxInfo} /> : null,
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
                    {boxState === BoxState.READY && paymentTokenAddress ? (
                        <>
                            {boxStateMessage} ({formatBalance(paymentTokenPrice, paymentTokenDetailed?.decimals ?? 0)}{' '}
                            {paymentTokenDetailed?.symbol} each box)
                        </>
                    ) : (
                        boxStateMessage
                    )}
                </ActionButton>
            </EthereumWalletConnectedBoundary>
            <DrawDialog
                boxInfo={boxInfo}
                open={openDrawDialog}
                onClose={() => setOpenDrawDialog(false)}
                onSubmit={onDraw}
            />
            <DrawResultDialog
                boxInfo={boxInfo}
                contractDetailed={contractDetailed}
                open={openDrawResultDialog}
                onClose={() => setOpenDrawResultDialog(false)}
            />
        </Box>
    )
}
