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
import { TransactionStatusType } from '@masknet/web3-shared-evm'
import {
    useNetworkDescriptor,
    useProviderDescriptor,
    useAccount,
    useWallet,
    useChainColor,
    useChainIdValid,
    useChainDetailed,
    useWeb3State,
    useReverseAddress,
} from '@masknet/plugin-infra'
import { useCallback } from 'react'
import { useRemoteControlledDialog, WalletIcon } from '@masknet/shared'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { hasNativeAPI, nativeAPI, useI18N } from '../../utils'
import { useRecentTransactions } from '../../plugins/Wallet/hooks/useRecentTransactions'
import GuideStep from '../GuideStep'
import { MaskFilledIcon } from '../../resources/MaskIcon'
import { makeStyles } from '@masknet/theme'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

const useStyles = makeStyles()((theme) => ({
    font: {
        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'rgb(15, 20, 25)',
    },
    paper: {
        borderRadius: 4,
        boxShadow:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px',
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
        marginLeft: theme.spacing(0.5),
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
    mini?: boolean
}
export function ToolboxHintUnstyled(props: ToolboxHintProps) {
    const { t } = useI18N()
    const {
        ListItemButton = MuiListItemButton,
        ListItemText = MuiListItemText,
        ListItemIcon = MuiListItemIcon,
        Container = 'div',
        Typography = MuiTypography,
        iconSize = 24,
        mini,
    } = props
    const { classes } = useStyles()
    const { openWallet, isWalletValid, walletTitle, chainColor, shouldDisplayChainIndicator } = useToolbox()

    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()

    return (
        <>
            <GuideStep step={1} total={2} tip={t('user_guide_tip_1')}>
                <Container>
                    <ListItemButton onClick={openWallet}>
                        <ListItemIcon>
                            {isWalletValid ? (
                                <WalletIcon
                                    size={iconSize}
                                    networkIcon={networkDescriptor?.icon}
                                    providerIcon={providerDescriptor?.icon}
                                />
                            ) : (
                                <MaskFilledIcon size={iconSize} />
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
                                        <Typography className={classes.font}>{walletTitle}</Typography>
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
                </Container>
            </GuideStep>
        </>
    )
}

function useToolbox() {
    const { t } = useI18N()
    const account = useAccount()
    const selectedWallet = useWallet()
    const chainColor = useChainColor()
    const chainIdValid = useChainIdValid()
    const chainDetailed = useChainDetailed()
    const { Utils } = useWeb3State()

    //#region recent pending transactions
    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)
    //#endregion

    //#region Wallet
    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    const isWalletValid = !!account && selectedWallet && chainIdValid

    const { value: domain } = useReverseAddress(account)

    function renderButtonText() {
        if (!account) return t('plugin_wallet_on_connect')
        if (!chainIdValid) return t('plugin_wallet_wrong_network')
        if (pendingTransactions.length <= 0) return domain ?? Utils?.formatAddress?.(account, 4) ?? account
        return (
            <>
                <span>
                    {t('plugin_wallet_pending_transactions', {
                        count: pendingTransactions.length,
                    })}
                </span>
                <CircularProgress sx={{ marginLeft: 1.5 }} thickness={6} size={20} color="inherit" />
            </>
        )
    }

    const openWallet = useCallback(() => {
        if (hasNativeAPI) return nativeAPI?.api.misc_openCreateWalletView()
        if (isWalletValid) return openWalletStatusDialog()
        else return openSelectWalletDialog()
    }, [openWalletStatusDialog, openSelectWalletDialog, hasNativeAPI, isWalletValid])

    const walletTitle = renderButtonText()

    const shouldDisplayChainIndicator =
        account && chainIdValid && chainDetailed?.network && chainDetailed.network !== 'mainnet'
    return {
        openWallet,
        isWalletValid,
        walletTitle,
        shouldDisplayChainIndicator,
        chainColor,
    }
}
