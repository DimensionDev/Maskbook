import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { IconButton } from '@material-ui/core'
import { makeStyles, createStyles, Theme, ThemeProvider } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import RestoreIcon from '@material-ui/icons/Restore'
import { cloneDeep, merge } from 'lodash-es'

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
import { useWallet } from '../../../plugins/Wallet/hooks/useWallet'
import { useTokens } from '../../../plugins/Wallet/hooks/useToken'
import { useTokensDetailedCallback } from '../../../web3/hooks/useTokensDetailedCallback'
import { WalletContent } from '../DashboardComponents/WalletContent'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'

//#region theme
const walletsTheme = (theme: Theme) =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiIconButton: {
                root: {
                    color: theme.palette.text,
                },
            },
            MuiListItemIcon: {
                root: {
                    justifyContent: 'center',
                    minWidth: 'unset',
                    marginRight: theme.spacing(2),
                },
            },
            MuiListItemSecondaryAction: {
                root: {
                    ...theme.typography.body1,
                },
            },
        },
    })
//#endregion

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 100%',
            height: '100%',
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
        caption: {
            display: 'flex',
            alignItems: 'center',
        },
        title: {
            marginLeft: theme.spacing(1),
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

    const selectedWallet = useWallet()
    const tokens = useTokens()
    const detailedTokens = useTokensDetailedCallback(tokens)

    // show create dialog
    useEffect(() => {
        if (create) openWalletCreate()
    }, [create, openWalletCreate])

    // show error dialog
    useEffect(() => {
        if (error) openWalletError()
    }, [error, openWalletError])

    //#region right icons from mobile devices
    const rightIcons = [
        <IconButton
            onClick={() => {
                if (selectedWallet) openAddToken({ wallet: selectedWallet })
                else openWalletCreate()
            }}>
            <AddIcon />
        </IconButton>,
    ]

    if (selectedWallet)
        rightIcons.unshift(
            <IconButton
                onClick={() => {
                    if (!selectedWallet) return
                    openWalletHistory({
                        wallet: selectedWallet,
                        onRedPacketClicked(payload) {
                            openWalletRedPacketDetail({
                                wallet: selectedWallet,
                                payload,
                            })
                        },
                    })
                }}>
                <RestoreIcon />
            </IconButton>,
        )
    //#endregion

    return (
        <DashboardRouterContainer
            empty={!selectedWallet}
            title={t('my_wallets')}
            actions={[<EthereumStatusBar BoxProps={{ justifyContent: 'flex-end' }} />]}
            leftIcons={[
                <IconButton onClick={() => history.goBack()}>
                    <ArrowBackIosIcon />
                </IconButton>,
            ]}
            rightIcons={rightIcons}>
            <ThemeProvider theme={walletsTheme}>
                <div className={classes.root}>
                    <div className={classes.content}>
                        <div className={classes.wrapper}>
                            {selectedWallet ? (
                                <WalletContent wallet={selectedWallet} detailedTokens={detailedTokens} />
                            ) : null}
                        </div>
                    </div>
                </div>
            </ThemeProvider>
            {addToken}
            {walletHistory}
            {walletCreate}
            {walletError}
            {walletRedPacketDetail}
        </DashboardRouterContainer>
    )
}
