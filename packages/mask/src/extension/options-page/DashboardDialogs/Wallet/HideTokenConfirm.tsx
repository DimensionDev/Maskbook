import { Trash2 as TrashIcon } from 'react-feather'
import { Button } from '@mui/material'
import { unreachable } from '@dimensiondev/kit'
import {
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    isZeroAddress,
} from '@masknet/web3-shared-evm'
import { useSnackbarCallback } from '@masknet/shared'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../utils'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
// eslint-disable-next-line import/no-deprecated
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { Wallet } from '@masknet/web3-shared-evm'
import { Box, BoxProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'

export function DashboardWalletHideTokenConfirmDialog(
    // eslint-disable-next-line import/no-deprecated
    props: WrappedDialogProps<{ wallet: Wallet; token: FungibleTokenDetailed | ERC721TokenDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()
    const tokenAddress =
        (token as FungibleTokenDetailed).address ?? (token as ERC721TokenDetailed).contractDetailed.address
    const tokenName = (token as FungibleTokenDetailed).name ?? (token as ERC721TokenDetailed).info.name
    const onConfirm = useSnackbarCallback(
        () => {
            const type = ((token as FungibleTokenDetailed).type ??
                (token as ERC721TokenDetailed).contractDetailed.type) as
                | EthereumTokenType.Native
                | EthereumTokenType.ERC20
                | EthereumTokenType.ERC721
            switch (type) {
                case EthereumTokenType.Native:
                    throw new Error('Unable to hide the native token.')
                case EthereumTokenType.ERC20:
                    return WalletRPC.updateWalletToken(wallet.address, token as ERC20TokenDetailed, {
                        strategy: 'block',
                    })
                case EthereumTokenType.ERC721:
                    return WalletRPC.removeToken(token as ERC721TokenDetailed)
                default:
                    unreachable(type)
            }
        },
        [wallet.address, token],
        props.onClose,
    )

    if (isZeroAddress(tokenAddress)) return null
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<TrashIcon />}
                iconColor="#F4637D"
                primary={t('hide_token')}
                secondary={t('hide_token_hint', { token: tokenName })}
                footer={
                    <SpacedButtonGroup>
                        <DebounceButton variant="contained" color="danger" onClick={onConfirm}>
                            {t('confirm')}
                        </DebounceButton>
                        <Button variant="outlined" color="inherit" onClick={props.onClose}>
                            {t('cancel')}
                        </Button>
                    </SpacedButtonGroup>
                }
            />
        </DashboardDialogCore>
    )
}

const useStyles = makeStyles()((theme) => ({
    buttonGroup: {
        flexGrow: 0,
        flexShrink: 0,
        '& > *:not(:last-child)': {
            marginRight: theme.spacing(2),
        },
    },
}))

function SpacedButtonGroup(_props: BoxProps) {
    const { classes } = useStyles()
    const { className, ...props } = _props
    return <Box className={classNames(className, classes.buttonGroup)} {...props} />
}
