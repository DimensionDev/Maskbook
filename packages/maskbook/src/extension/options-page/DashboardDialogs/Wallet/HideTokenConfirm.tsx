import { Trash2 as TrashIcon } from 'react-feather'
import { Button } from '@material-ui/core'
import { unreachable } from '@dimensiondev/kit'
import {
    ERC1155TokenDetailed,
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    isNative,
    NonFungibleTokenDetailed,
} from '@masknet/web3-shared'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../utils'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import SpacedButtonGroup from '../../DashboardComponents/SpacedButtonGroup'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'
import type { WalletProps } from './types'

export function DashboardWalletHideTokenConfirmDialog(
    props: WrappedDialogProps<WalletProps & { token: FungibleTokenDetailed | NonFungibleTokenDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()

    const onConfirm = useSnackbarCallback(
        () => {
            const type = token.type
            switch (type) {
                case EthereumTokenType.Native:
                    throw new Error('Unable to hide the native token.')
                case EthereumTokenType.ERC20:
                    return WalletRPC.blockERC20Token(wallet.address, token as ERC20TokenDetailed)
                case EthereumTokenType.ERC721:
                    return WalletRPC.blockERC721Token(wallet.address, token as ERC721TokenDetailed)
                case EthereumTokenType.ERC1155:
                    return WalletRPC.blockERC1155Token(wallet.address, token as ERC1155TokenDetailed)
                default:
                    unreachable(type)
            }
        },
        [wallet.address],
        props.onClose,
    )

    if (isNative(token.address)) return null
    return (
        <DashboardDialogCore fullScreen={false} {...props}>
            <DashboardDialogWrapper
                size="small"
                icon={<TrashIcon />}
                iconColor="#F4637D"
                primary={t('hide_token')}
                secondary={t('hide_token_hint', { token: token.name })}
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
