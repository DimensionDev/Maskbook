import {
    CircularProgress,
    ListItemButtonProps,
    ListItemIconProps,
    ListItemTextProps,
    TypographyProps,
    Typography as MuiTypography,
    ListItemButton as MuiListItemButton,
    ListItemIcon as MuiListItemIcon,
    ListItemText as MuiListItemText,
    Box,
} from '@mui/material'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import {
    useNetworkDescriptor,
    useProviderDescriptor,
    useAccount,
    useChainColor,
    useChainIdValid,
    useWeb3State,
    useReverseAddress,
    useChainIdMainnet,
    useRecentTransactions,
} from '@masknet/plugin-infra/web3'
import { useCallback, useEffect } from 'react'
import { WalletIcon } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import { hasNativeAPI, nativeAPI } from '../../../shared/native-rpc'
import GuideStep from '../GuideStep'
import { AccountBalanceWalletIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { NextIDVerificationStatus, useNextIDConnectStatus } from '../DataSource/useNextID'
import { MaskIcon } from '../../resources/MaskIcon'

const useStyles = makeStyles()((theme) => ({
    title: {
        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'rgb(15, 20, 25)',
        display: 'flex',
        alignItems: 'center',
    },
    paper: {
        borderRadius: 4,
        boxShadow:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2) 0 0 15px, rgba(255, 255, 255, 0.15) 0 0 3px 1px'
                : 'rgba(101, 119, 134, 0.2) 0 0 15px, rgba(101, 119, 134, 0.15) 0 0 3px 1px',
        backgroundImage: 'none',
    },
    menuItem: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    menuText: {
        marginLeft: 12,
        fontSize: 15,
        color: theme.palette.mode === 'dark' ? 'rgb(216, 216, 216)' : 'rgb(15, 20, 25)',
        paddingRight: theme.spacing(2),
    },
    chainIcon: {
        fontSize: 18,
        width: 18,
        height: 18,
    },
    iconWrapper: {
        display: 'flex',
        alignItems: 'baseline',
    },
    maskFilledIcon: {
        marginRight: 6,
    },
}))
export interface ToolboxHintProps {
    Container?: React.ComponentType<React.PropsWithChildren<{}>>
    ListItemButton?: React.ComponentType<Pick<ListItemButtonProps, 'onClick' | 'children'>>
    ListItemText?: React.ComponentType<Pick<ListItemTextProps, 'primary'>>
    ListItemIcon?: React.ComponentType<Pick<ListItemIconProps, 'children'>>
    Typography?: React.ComponentType<Pick<TypographyProps, 'children' | 'className'>>
    iconSize?: number
    badgeSize?: number
    mini?: boolean
    category: 'wallet' | 'application'
}
export function ToolboxHintUnstyled(props: ToolboxHintProps) {
    return props.category === 'wallet' ? <ToolboxHintForWallet {...props} /> : <ToolboxHintForApplication {...props} />
}

function ToolboxHintForApplication(props: ToolboxHintProps) {
    const {
        ListItemButton = MuiListItemButton,
        ListItemIcon = MuiListItemIcon,
        Container = 'div',
        Typography = MuiTypography,
        iconSize = 24,
        mini,
        ListItemText = MuiListItemText,
    } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const { openDialog } = useRemoteControlledDialog(WalletMessages.events.ApplicationDialogUpdated)
    return (
        <GuideStep step={1} total={4} tip={t('user_guide_tip_1')}>
            <Container>
                <ListItemButton onClick={openDialog}>
                    <ListItemIcon>
                        <MaskIcon style={{ width: iconSize, height: iconSize }} />
                    </ListItemIcon>
                    {mini ? null : (
                        <ListItemText
                            primary={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                    <Typography className={classes.title}>{t('mask_network')}</Typography>
                                </Box>
                            }
                        />
                    )}
                </ListItemButton>
            </Container>
        </GuideStep>
    )
}

function ToolboxHintForWallet(props: ToolboxHintProps) {
    const { t } = useI18N()
    const nextIDConnectStatus = useNextIDConnectStatus()
    const {
        ListItemButton = MuiListItemButton,
        ListItemText = MuiListItemText,
        ListItemIcon = MuiListItemIcon,
        Container = 'div',
        Typography = MuiTypography,
        iconSize = 24,
        badgeSize = 10,
        mini,
    } = props
    const { classes } = useStyles()
    const { openWallet, isWalletValid, walletTitle, chainColor, shouldDisplayChainIndicator } = useToolbox()

    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()

    useEffect(() => {
        const { status, isVerified, action } = nextIDConnectStatus
        if (isVerified || status === NextIDVerificationStatus.WaitingLocalConnect) return
        if (action) {
            action()
        }
    }, [nextIDConnectStatus.status])

    return (
        <>
            <Container>
                <GuideStep step={2} total={4} tip={t('user_guide_tip_2')}>
                    <ListItemButton onClick={openWallet}>
                        <ListItemIcon>
                            {isWalletValid ? (
                                <WalletIcon
                                    size={iconSize}
                                    badgeSize={badgeSize}
                                    networkIcon={providerDescriptor?.icon} // switch the icon to meet design
                                    providerIcon={networkDescriptor?.icon}
                                    isBorderColorNotDefault
                                />
                            ) : (
                                <AccountBalanceWalletIcon />
                            )}
                        </ListItemIcon>
                        {mini ? null : (
                            <ListItemText
                                primary={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}>
                                        <Typography className={classes.title}>{walletTitle}</Typography>
                                        {shouldDisplayChainIndicator ? (
                                            <FiberManualRecordIcon
                                                className={classes.chainIcon}
                                                style={{
                                                    color: chainColor,
                                                }}
                                            />
                                        ) : null}
                                    </Box>
                                }
                            />
                        )}
                    </ListItemButton>
                </GuideStep>
            </Container>
        </>
    )
}

function useToolbox() {
    const { t } = useI18N()
    const account = useAccount()
    const chainColor = useChainColor()
    const chainIdValid = useChainIdValid()
    const chainIdMainnet = useChainIdMainnet()
    const { Others } = useWeb3State()

    // #region recent pending transactions
    const pendingTransactions = useRecentTransactions(undefined, TransactionStatusType.NOT_DEPEND)
    // #endregion

    // #region Wallet
    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion

    const isWalletValid = !!account && chainIdValid

    const { value: domain } = useReverseAddress(undefined, account)

    function renderButtonText() {
        if (!account) return t('plugin_wallet_connect_wallet')
        if (!chainIdValid) return t('plugin_wallet_wrong_network')
        if (pendingTransactions.length <= 0)
            return Others?.formatDomainName?.(domain) || Others?.formatAddress?.(account, 4) || account
        return (
            <>
                <span style={{ marginRight: 12 }}>
                    {t('plugin_wallet_pending_transactions', {
                        count: pendingTransactions.length,
                        plural: pendingTransactions.length > 1 ? 's' : '',
                    })}
                </span>
                <CircularProgress thickness={6} size={20} color="inherit" />
            </>
        )
    }

    const openWallet = useCallback(() => {
        if (hasNativeAPI) return nativeAPI?.api.misc_openCreateWalletView()
        return isWalletValid ? openWalletStatusDialog() : openSelectProviderDialog()
    }, [openWalletStatusDialog, openSelectProviderDialog, isWalletValid, hasNativeAPI])

    const walletTitle = renderButtonText()

    const shouldDisplayChainIndicator = account && chainIdValid && !chainIdMainnet
    return {
        openWallet,
        isWalletValid,
        walletTitle,
        shouldDisplayChainIndicator,
        chainColor,
    }
}
