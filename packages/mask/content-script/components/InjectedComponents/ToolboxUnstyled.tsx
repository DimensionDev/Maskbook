import { useCallback } from 'react'
import {
    CircularProgress,
    type ListItemButtonProps,
    type ListItemIconProps,
    type ListItemTextProps,
    type TypographyProps,
    Typography as MuiTypography,
    ListItemButton as MuiListItemButton,
    ListItemIcon as MuiListItemIcon,
    ListItemText as MuiListItemText,
    Box,
    useTheme,
} from '@mui/material'
import { FiberManualRecord as FiberManualRecordIcon } from '@mui/icons-material'
import { ProviderType } from '@masknet/web3-shared-evm'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import {
    useProviderDescriptor,
    useChainContext,
    useChainColor,
    useChainIdValid,
    useWeb3Utils,
    useReverseAddress,
    useChainIdMainnet,
    useRecentTransactions,
} from '@masknet/web3-hooks-base'
import { WalletIcon, SelectProviderModal, WalletStatusModal } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import GuideStep from '../GuideStep/index.js'
import { useOpenApplicationBoardDialog } from '../shared/openApplicationBoardDialog.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()(() => ({
    title: {
        display: 'flex',
        alignItems: 'center',
    },
    chainIcon: {
        fontSize: 18,
        width: 18,
        height: 18,
    },
}))

interface ToolboxHintProps {
    Container?: React.ComponentType<React.PropsWithChildren>
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

    const openApplicationBoardDialog = useOpenApplicationBoardDialog()

    return (
        <GuideStep step={1} total={4} tip={<Trans>Explore multi-chain dApps.</Trans>}>
            <Container>
                <ListItemButton onClick={openApplicationBoardDialog}>
                    <ListItemIcon>
                        <Icons.MaskBlue size={iconSize} />
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
                                    <Typography className={classes.title}>
                                        <Trans>Mask Network</Trans>
                                    </Typography>
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
    const {
        ListItemButton = MuiListItemButton,
        ListItemText = MuiListItemText,
        ListItemIcon = MuiListItemIcon,
        Container = 'div',
        Typography = MuiTypography,
        iconSize = 24,
        badgeSize = 12,
        mini,
    } = props
    const { classes } = useStyles()
    const { onClickToolbox, title, chainColor, shouldDisplayChainIndicator, account, provider } = useToolbox()

    const theme = useTheme()

    return (
        <GuideStep step={2} total={4} tip={<Trans>Connect and switch between your wallets.</Trans>}>
            <Container>
                <ListItemButton onClick={onClickToolbox}>
                    <ListItemIcon>
                        {account && provider && provider.type !== ProviderType.MaskWallet ?
                            <WalletIcon
                                size={iconSize}
                                badgeSize={badgeSize}
                                mainIcon={provider.icon}
                                badgeIconBorderColor={theme.palette.background.paper}
                            />
                        :   <Icons.Wallet size={iconSize} />}
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
                                    <Typography className={classes.title}>{title}</Typography>
                                    {shouldDisplayChainIndicator ?
                                        <FiberManualRecordIcon
                                            className={classes.chainIcon}
                                            style={{
                                                color: chainColor,
                                            }}
                                        />
                                    :   null}
                                </Box>
                            }
                        />
                    )}
                </ListItemButton>
            </Container>
        </GuideStep>
    )
}

function useToolbox() {
    const t = useMaskSharedTrans()
    const { account } = useChainContext()
    const chainColor = useChainColor()
    const chainIdValid = useChainIdValid()
    const chainIdMainnet = useChainIdMainnet()
    const provider = useProviderDescriptor()
    const Utils = useWeb3Utils()
    const pendingTransactions = useRecentTransactions(undefined, TransactionStatusType.NOT_DEPEND)
    const { data: domain } = useReverseAddress(undefined, account, true)

    function getToolboxTitle() {
        if (!account || !provider) return <Trans>Connect Wallet</Trans>
        if (pendingTransactions.length <= 0)
            return Utils.formatDomainName?.(domain) || Utils.formatAddress(account, 4) || account
        return (
            <>
                <span style={{ marginRight: 12 }}>
                    {t.plugin_wallet_pending_transactions({
                        count: pendingTransactions.length,
                    })}
                </span>
                <CircularProgress thickness={6} size={20} color="inherit" />
            </>
        )
    }

    const onClickToolbox = useCallback(() => {
        return account && provider ? WalletStatusModal.open() : SelectProviderModal.open()
    }, [account, provider])

    return {
        account,
        chainColor,
        provider,
        onClickToolbox,
        title: getToolboxTitle(),
        shouldDisplayChainIndicator: account && chainIdValid && !chainIdMainnet,
    }
}
