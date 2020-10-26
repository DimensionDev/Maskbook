import React, { useCallback } from 'react'
import {
    Chip,
    ChipProps,
    makeStyles,
    Theme,
    createStyles,
    IconButton,
    Typography,
    Box,
    Divider,
} from '@material-ui/core'
import { ChevronDown, Copy } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useWallets } from '../../plugins/Wallet/hooks/useWallet'
import { isSameAddress } from '../helpers'
import { ProviderIcon } from '../../components/shared/ProviderIcon'
import { formatEthereumAddress } from '../../plugins/Wallet/formatter'
import { useSnackbarCallback } from '../../extension/options-page/DashboardDialogs/Base'
import { MaskbookWalletMessages, WalletMessageCenter } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            lineHeight: 1,
        },
        address: {
            fontSize: 14,
            lineHeight: 1,
            marginRight: theme.spacing(1),
        },
        label: {
            paddingRight: theme.spacing(1),
        },
        divider: {
            height: 20,
            margin: theme.spacing(0, 1),
            backgroundColor: theme.palette.divider,
        },
        dropButton: {
            width: 24,
            height: 24,
        },
        copyButton: {
            width: 24,
            height: 24,
        },
        providerIcon: {
            fontSize: 18,
            width: 18,
            height: 18,
            marginLeft: theme.spacing(1),
        },
    })
})

export interface EthereumAccountChipProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    address?: string
    ChipProps?: Partial<ChipProps>
}

export function EthereumAccountChip(props: EthereumAccountChipProps) {
    const { t } = useI18N()
    const { address = '', ChipProps } = props
    const classes = useStylesExtends(useStyles(), props)

    const wallets = useWallets()
    const currentWallet = wallets.find((x) => isSameAddress(x.address, address))
    const avatar = (
        <ProviderIcon classes={{ icon: classes.providerIcon }} size={18} providerType={currentWallet?.provider} />
    )
    const address_ = address.replace(/^0x/i, '')

    //#region copy addr to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLDivElement>) => {
            ev.stopPropagation()
            copyToClipboard(address_)
        },
        [],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_wallet_addr'),
    )
    //#endregion

    //#region select wallet dialog
    const [, setSelectWalletOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectWalletDialogUpdated'>(
        WalletMessageCenter,
        'selectWalletDialogUpdated',
    )
    const onOpen = useCallback(() => {
        setSelectWalletOpen({
            open: true,
        })
    }, [])
    //#endregion

    if (!address_) return null

    const content = (
        <Box display="inline-flex" component="span" alignItems="center">
            <Typography className={classes.address} color="textPrimary">
                {formatEthereumAddress(address_, 4)}
            </Typography>
            <IconButton className={classes.dropButton} size="small">
                <ChevronDown size={14} />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" />
            <IconButton className={classes.copyButton} size="small" onClick={onCopy}>
                <Copy size={14} />
            </IconButton>
        </Box>
    )

    return (
        <>
            {avatar ? (
                <Chip
                    avatar={avatar}
                    className={classes.root}
                    classes={{ label: classes.label }}
                    size="small"
                    label={content}
                    clickable
                    onClick={onOpen}
                    {...ChipProps}
                />
            ) : (
                <Chip
                    className={classes.root}
                    classes={{ label: classes.label }}
                    size="small"
                    label={content}
                    {...ChipProps}
                />
            )}
        </>
    )
}
