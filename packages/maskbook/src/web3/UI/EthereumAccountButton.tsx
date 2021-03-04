import { useCallback } from 'react'
import classNames from 'classnames'
import { makeStyles, createStyles, Button, ButtonProps, Chip, Typography } from '@material-ui/core'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import BigNumber from 'bignumber.js'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { ProviderIcon } from '../../components/shared/ProviderIcon'
import { formatBalance, formatEthereumAddress } from '../../plugins/Wallet/formatter'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useChainId } from '../hooks/useChainState'
import { resolveChainColor } from '../pipes'
import { ChainId } from '../types'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'
import { Flags } from '../../utils/flags'
import { useEtherTokenBalance } from '../hooks/useEtherTokenBalance'
import { useAccount } from '../hooks/useAccount'

const useStyles = makeStyles((theme) => {
    return createStyles({
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

export interface EthereumAccountButtonProps extends withClasses<never> {
    disableEther?: boolean
    ButtonProps?: Partial<ButtonProps>
}

export function EthereumAccountButton(props: EthereumAccountButtonProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainId = useChainId()
    const account = useAccount()
    const { value: balance = '0' } = useEtherTokenBalance(account)

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

    if (Flags.has_native_nav_bar) return <AccountBalanceWalletIcon onClick={onOpen} />

    return (
        <div className={props.disableEther ? '' : classes.root}>
            {!props.disableEther ? (
                <Typography className={classes.balance}>{formatBalance(new BigNumber(balance), 18, 4)} ETH</Typography>
            ) : null}
            <Button
                className={classNames(classes.button, props.disableEther ? classes.buttonTransparent : '')}
                variant="outlined"
                startIcon={
                    selectedWallet ? (
                        <ProviderIcon
                            classes={{ icon: classes.providerIcon }}
                            size={18}
                            providerType={selectedWalletProvider}
                        />
                    ) : null
                }
                color="primary"
                onClick={onOpen}
                {...props.ButtonProps}>
                {selectedWallet?.name ?? ''}
                {selectedWallet?.address
                    ? ` (${formatEthereumAddress(selectedWallet.address, 4)})`
                    : t('plugin_wallet_on_connect')}
                {chainId !== ChainId.Mainnet && selectedWallet ? (
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
