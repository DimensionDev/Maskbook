import { useCallback } from 'react'
import classNames from 'classnames'
import { formatEthereumAddress, FormattedBalance } from '@dimensiondev/maskbook-shared'
import {
    resolveChainColor,
    useChainDetailed,
    useChainId,
    useChainIdValid,
    useNativeTokenBalance,
} from '@dimensiondev/web3-shared'
import { Button, ButtonProps, makeStyles, Typography } from '@material-ui/core'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { WalletIcon } from '../../components/shared/WalletIcon'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { Flags, useI18N, useRemoteControlledDialog } from '../../utils'

const useStyles = makeStyles((theme) => {
    return {
        root: {
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 16,
            paddingLeft: theme.spacing(2),
            backgroundColor: theme.palette.background.default,
        },
        balance: {
            marginRight: theme.spacing(1),
        },
        button: {
            borderRadius: 16,
            backgroundColor: theme.palette.background.paper,
        },
        buttonTransparent: {
            backgroundColor: 'transparent',
        },
        chainIcon: {
            fontSize: 18,
            width: 18,
            height: 18,
            marginLeft: theme.spacing(0.5),
        },
    }
})

export interface EthereumAccountButtonProps extends withClasses<never> {
    disableNativeToken?: boolean
    ButtonProps?: Partial<ButtonProps>
}

export function EthereumAccountButton(props: EthereumAccountButtonProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const chainDetailed = useChainDetailed()
    const { value: balance = '0' } = useNativeTokenBalance()

    const selectedWallet = useWallet()

    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const onOpen = useCallback(() => {
        if (selectedWallet) openSelectWalletDialog()
        else openSelectProviderDialog()
    }, [selectedWallet, openSelectWalletDialog, openSelectProviderDialog])

    if (Flags.has_native_nav_bar) return <AccountBalanceWalletIcon onClick={onOpen} />

    return (
        <div className={props.disableNativeToken ? '' : classes.root}>
            {!props.disableNativeToken ? (
                <Typography className={classes.balance}>
                    <FormattedBalance value={balance} decimals={18} significant={4} symbol="ETH" />
                </Typography>
            ) : null}
            <Button
                className={classNames(classes.button, props.disableNativeToken ? classes.buttonTransparent : '')}
                variant="outlined"
                startIcon={
                    selectedWallet?.address && chainIdValid ? (
                        <WalletIcon size={18} badgeSize={9} />
                    ) : (
                        <InfoOutlinedIcon fontSize="medium" />
                    )
                }
                color="primary"
                onClick={onOpen}
                {...props.ButtonProps}>
                {selectedWallet?.address
                    ? chainIdValid
                        ? `${selectedWallet?.name ?? ''} (${formatEthereumAddress(selectedWallet.address, 4)})`
                        : t('plugin_wallet_wrong_network')
                    : t('plugin_wallet_on_connect')}
                {selectedWallet?.address && chainIdValid && chainDetailed?.network !== 'mainnet' ? (
                    <FiberManualRecordIcon
                        className={classes.chainIcon}
                        style={{
                            color: resolveChainColor(chainId),
                        }}
                    />
                ) : null}
            </Button>
        </div>
    )
}
