import React, { useState, useEffect, useCallback } from 'react'
import DashboardRouterContainer from './Container'
import { Button, IconButton, Fade } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import AddCircleIcon from '@material-ui/icons/AddCircle'
import AddIcon from '@material-ui/icons/Add'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import RestoreIcon from '@material-ui/icons/Restore'

import { WalletItem } from '../DashboardComponents/WalletItem'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardWalletCreateDialog,
    DashboardWalletAddTokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletErrorDialog,
    DashboardWalletRedPacketDetailDialog,
} from '../DashboardDialogs/Wallet'
import { useI18N } from '../../../utils/i18n-next-ui'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useHistory } from 'react-router-dom'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { Flags } from '../../../utils/flags'
import { WalletMessageCenter, MaskbookWalletMessages } from '../../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useWallets } from '../../../plugins/Wallet/hooks/useWallet'
import { useTokens } from '../../../plugins/Wallet/hooks/useToken'
import { useTokensDetailedCallback } from '../../../web3/hooks/useTokensDetailedCallback'
import { WalletContent } from '../DashboardComponents/WalletContent'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flex: '0 0 100%',
            height: '100%',
        },
        scroller: {
            width: 224,
            height: '100%',
            flex: '0 0 auto',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            [theme.breakpoints.down('sm')]: {
                width: '100%',
                borderRight: 'none',
            },
        },
        content: {
            width: '100%',
            overflow: 'auto',
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
        },
        wrapper: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        },
    }),
)

export default function DashboardWalletsRouter() {
    const classes = useStyles()
    const { t } = useI18N()
    const history = useHistory()
    const { create, error, rpid } = useQueryParams(['create', 'error', 'rpid'])
    const xsMatched = useMatchXS()

    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletRedPacketDetail, , openWalletRedPacketDetail] = useModal(DashboardWalletRedPacketDetailDialog)
    const [walletRedPacket, , openWalletRedPacket] = useModal(DashboardWalletRedPacketDetailDialog)

    const wallets = useWallets()
    const [current, setCurrent] = useState('')
    const currentWallet = wallets.find((wallet) => wallet.address === current)

    const tokens = useTokens(current)
    const [detailedTokens, detailedTokensCallback] = useTokensDetailedCallback(tokens)

    // auto select first wallet
    useEffect(() => {
        if (current) return
        if (xsMatched) return
        const first = wallets?.[0]?.address
        if (first) setCurrent(first)
    }, [xsMatched, current, wallets])

    // show create dialog
    useEffect(() => {
        if (create) openWalletCreate()
    }, [create, openWalletCreate])

    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    // auto fetch tokens detailed
    useEffect(() => {
        if (!current) return
        detailedTokensCallback(current)
    }, [current])

    // show provider connect dialog
    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        WalletMessageCenter,
        'selectProviderDialogUpdated',
    )

    const onConnect = useCallback(() => {
        setOpen({
            open: true,
        })
    }, [setOpen])

    return (
        <DashboardRouterContainer
            padded={false}
            empty={!wallets?.length}
            title={t('my_wallets')}
            actions={[
                Flags.metamask_support_enabled ? (
                    <Button variant="outlined" onClick={onConnect}>
                        {t('connect')}
                    </Button>
                ) : (
                    <></>
                ),
                <Button
                    variant="contained"
                    onClick={openWalletCreate}
                    endIcon={<AddCircleIcon />}
                    data-testid="create_button">
                    {t('create_wallet')}
                </Button>,
            ]}
            leftIcons={[
                <IconButton
                    onClick={() => {
                        if (current) setCurrent('')
                        else history.goBack()
                    }}>
                    <ArrowBackIosIcon />
                </IconButton>,
            ]}
            rightIcons={[
                <IconButton
                    onClick={() => {
                        if (!currentWallet) return
                        openWalletHistory({
                            wallet: currentWallet,
                            onRedPacketClicked(payload) {
                                openWalletRedPacket({
                                    payload,
                                })
                            },
                        })
                    }}>
                    <RestoreIcon />
                </IconButton>,
                <IconButton
                    onClick={() => {
                        if (currentWallet) openAddToken({ wallet: currentWallet })
                        else openWalletCreate()
                    }}>
                    <AddIcon />
                </IconButton>,
            ]}>
            <div className={classes.root}>
                {wallets?.length && !(xsMatched && current) ? (
                    <div className={classes.scroller}>
                        {wallets.map((wallet) => (
                            <WalletItem
                                key={wallet.address}
                                selected={wallet.address === current}
                                wallet={wallet}
                                onClick={() => setCurrent(wallet.address)}
                            />
                        ))}
                    </div>
                ) : null}
                <div className={classes.content}>
                    <div className={classes.wrapper}>
                        {currentWallet ? (
                            xsMatched ? (
                                <WalletContent wallet={currentWallet} detailedTokens={detailedTokens} />
                            ) : (
                                <Fade in={Boolean(current)}>
                                    <WalletContent wallet={currentWallet} detailedTokens={detailedTokens} />
                                </Fade>
                            )
                        ) : null}
                    </div>
                </div>
            </div>
            {addToken}
            {walletHistory}
            {walletCreate}
            {walletError}
            {walletRedPacket}
            {walletRedPacketDetail}
        </DashboardRouterContainer>
    )
}
