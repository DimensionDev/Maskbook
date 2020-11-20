import React, { useCallback } from 'react'
import { makeStyles, Theme, createStyles, Button, ButtonProps } from '@material-ui/core'
import ErrorIcon from '@material-ui/icons/Error'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { ProviderIcon } from '../../components/shared/ProviderIcon'
import { formatEthereumAddress } from '../../plugins/Wallet/formatter'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useChainId, useChainIdValid } from '../hooks/useChainState'
import { resolveChainColor } from '../pipes'
import { ChainId } from '../types'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'
import { Flags } from '../../utils/flags'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {},
        providerIcon: {
            fontSize: 18,
            width: 18,
            height: 18,
        },
        chainIcon: {
            fontSize: 18,
            width: 18,
            height: 18,
            marginLeft: theme.spacing(0.5),
        },
    })
})

export interface EthereumAccountButtonProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    ButtonProps?: Partial<ButtonProps>
}

export function EthereumAccountButton(props: EthereumAccountButtonProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const selectedWallet = useWallet()
    const selectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)

    const [, setSelectWalletDialogOpen] = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onOpen = useCallback(() => {
        if (selectedWallet)
            setSelectWalletDialogOpen({
                open: true,
            })
        else
            setSelectProviderDialogOpen({
                open: true,
            })
    }, [selectedWallet, setSelectWalletDialogOpen, setSelectProviderDialogOpen])

    return Flags.has_native_nav_bar ? (
        <AccountBalanceWalletIcon onClick={onOpen} />
    ) : (
        <Button
            className={classes.root}
            variant="outlined"
            startIcon={
                chainIdValid && selectedWallet ? (
                    <ProviderIcon
                        classes={{ icon: classes.providerIcon }}
                        size={18}
                        providerType={selectedWalletProvider}
                    />
                ) : !chainIdValid ? (
                    <ErrorIcon />
                ) : (
                    void 0
                )
            }
            color={!chainIdValid ? 'secondary' : 'primary'}
            onClick={onOpen}
            {...props.ButtonProps}>
            {chainIdValid
                ? selectedWallet?.address
                    ? formatEthereumAddress(selectedWallet.address, 4)
                    : t('plugin_wallet_connect_a_wallet')
                : t('plugin_wallet_wrong_network')}
            {chainIdValid && chainId !== ChainId.Mainnet ? (
                <FiberManualRecordIcon
                    className={classes.chainIcon}
                    style={{
                        color: resolveChainColor(chainId),
                    }}
                />
            ) : null}
        </Button>
    )
}
