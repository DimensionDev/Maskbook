import React, { useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, IconButton } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import AddIcon from '@material-ui/icons/Add'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import RestoreIcon from '@material-ui/icons/Restore'

import DashboardRouterContainer from './Container'
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
import { Flags } from '../../../utils/flags'
import { WalletMessageCenter, MaskbookWalletMessages } from '../../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useDefaultWallet } from '../../../plugins/Wallet/hooks/useWallet'
import { useTokens } from '../../../plugins/Wallet/hooks/useToken'
import { useTokensDetailedCallback } from '../../../web3/hooks/useTokensDetailedCallback'
import { WalletContent } from '../DashboardComponents/WalletContent'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 100%',
            height: '100%',
        },
        header: {
            padding: theme.spacing(3, 2, 0, 2),
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

    const [walletCreate, openWalletCreate] = useModal(DashboardWalletCreateDialog)
    const [walletError, openWalletError] = useModal(DashboardWalletErrorDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletRedPacketDetail, , openWalletRedPacketDetail] = useModal(DashboardWalletRedPacketDetailDialog)

    const defaultWallet = useDefaultWallet()
    const tokens = useTokens(defaultWallet?.address ?? '')

    const [detailedTokens, detailedTokensCallback] = useTokensDetailedCallback(tokens)
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
        if (!defaultWallet) return
        detailedTokensCallback(defaultWallet.address)
    }, [defaultWallet])

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
            empty={!defaultWallet}
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
                <IconButton onClick={() => history.goBack()}>
                    <ArrowBackIosIcon />
                </IconButton>,
            ]}
            rightIcons={[
                <IconButton
                    onClick={() => {
                        if (!defaultWallet) return
                        openWalletHistory({
                            wallet: defaultWallet,
                            onRedPacketClicked(payload) {
                                openWalletRedPacketDetail({
                                    wallet: defaultWallet,
                                    payload,
                                })
                            },
                        })
                    }}>
                    <RestoreIcon />
                </IconButton>,
                <IconButton
                    onClick={() => {
                        if (defaultWallet) openAddToken({ wallet: defaultWallet })
                        else openWalletCreate()
                    }}>
                    <AddIcon />
                </IconButton>,
            ]}>
            <div className={classes.root}>
                <div className={classes.header}>
                    <EthereumStatusBar
                        BoxProps={{ justifyContent: 'flex-end', flexWrap: 'reverse', flexDirection: 'row-reverse' }}
                    />
                </div>
                <div className={classes.content}>
                    <div className={classes.wrapper}>
                        {defaultWallet ? (
                            <WalletContent wallet={defaultWallet} detailedTokens={detailedTokens} />
                        ) : null}
                    </div>
                </div>
            </div>
            {addToken}
            {walletHistory}
            {walletCreate}
            {walletError}
            {walletRedPacketDetail}
        </DashboardRouterContainer>
    )
}
