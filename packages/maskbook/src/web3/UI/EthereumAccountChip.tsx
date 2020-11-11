import React, { useCallback } from 'react'
import { Chip, ChipProps, makeStyles, Theme, createStyles, Typography, Box } from '@material-ui/core'
import { ChevronDown } from 'react-feather'
import ErrorIcon from '@material-ui/icons/Error'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { ProviderIcon } from '../../components/shared/ProviderIcon'
import { formatEthereumAddress } from '../../plugins/Wallet/formatter'
import { WalletMessageCenter } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useChainIdValid } from '../hooks/useChainState'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            lineHeight: 1,
        },
        content: {
            display: 'inline-flex',
            alignItems: 'center',
        },
        address: {
            fontSize: 14,
            lineHeight: 1,
            marginRight: theme.spacing(1),
        },
        placeholder: {},
        label: {
            overflow: 'visible',
            paddingRight: theme.spacing(1),
        },
        divider: {
            height: 20,
            margin: theme.spacing(0, 1),
            backgroundColor: theme.palette.divider,
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
    ChipProps?: Partial<ChipProps>
}

export function EthereumAccountChip(props: EthereumAccountChipProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainIdValid = useChainIdValid()
    const selectedWallet = useWallet()

    //#region select wallet dialog
    const [, setSelectWalletOpen] = useRemoteControlledDialog(WalletMessageCenter, 'walletStatusDialogUpdated')
    const onOpen = useCallback(() => {
        setSelectWalletOpen({
            open: true,
        })
    }, [setSelectWalletOpen])
    //#endregion

    const content = (
        <Box className={classes.content} component="span">
            <Typography className={classes.address} color={chainIdValid ? 'textPrimary' : 'secondary'}>
                {chainIdValid
                    ? selectedWallet?.address
                        ? formatEthereumAddress(selectedWallet.address, 4)
                        : t('plugin_wallet_connect_a_wallet')
                    : t('plugin_wallet_wrong_network')}
            </Typography>
            {chainIdValid ? <ChevronDown size={14} /> : null}
        </Box>
    )

    if (!chainIdValid)
        return (
            <Chip
                icon={<ErrorIcon />}
                className={classes.root}
                classes={{ label: classes.label }}
                color="secondary"
                size="small"
                label={content}
                clickable
                onClick={onOpen}
                {...props.ChipProps}
            />
        )
    return (
        <>
            {chainIdValid && selectedWallet ? (
                <Chip
                    avatar={
                        <ProviderIcon
                            classes={{ icon: classes.providerIcon }}
                            size={18}
                            providerType={selectedWallet.provider}
                        />
                    }
                    className={classes.root}
                    classes={{ label: classes.label }}
                    size="small"
                    label={content}
                    clickable
                    onClick={onOpen}
                    {...props.ChipProps}
                />
            ) : (
                <Chip
                    className={classes.root}
                    classes={{ label: classes.label }}
                    size="small"
                    label={content}
                    {...props.ChipProps}
                />
            )}
        </>
    )
}
