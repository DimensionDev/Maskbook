import { Trash2 as TrashIcon } from 'react-feather'
import { Button, Box, BoxProps } from '@mui/material'
import { SchemaType, isNativeTokenAddress, ChainId } from '@masknet/web3-shared-evm'
import { useSnackbarCallback } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import type { FungibleToken, NonFungibleToken, Wallet } from '@masknet/web3-shared-base'

export function DashboardWalletHideTokenConfirmDialog(
    props: WrappedDialogProps<{
        wallet: Wallet
        token: FungibleToken<ChainId, SchemaType> | NonFungibleToken<ChainId, SchemaType>
    }>,
) {
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()
    const tokenAddress =
        (token as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>).address ??
        (token as NonFungibleToken<ChainId, SchemaType>).contract?.address
    const tokenName =
        (token as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>).name ??
        (token as NonFungibleToken<ChainId, SchemaType>).metadata?.name
    const onConfirm = useSnackbarCallback(
        async () => {
            return
            // const schema = ((token as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>).schema ??
            //     (token as NonFungibleToken<ChainId, SchemaType.ERC721>).schema) as
            //     | SchemaType.Native
            //     | SchemaType.ERC20
            //     | SchemaType.ERC721
            // switch (schema) {
            //     case SchemaType.Native:
            //         throw new Error('Unable to hide the native token.')
            //     case SchemaType.ERC20:
            //         return WalletRPC.updateWalletToken(
            //             wallet.address,
            //             token as FungibleToken<ChainId, SchemaType.ERC20>,
            //             {
            //                 strategy: 'block',
            //             },
            //         )
            //     case SchemaType.ERC721:
            //         return WalletRPC.removeToken(token as NonFungibleToken<ChainId, SchemaType.ERC721>)
            //     default:
            //         unreachable(schema)
            // }
        },
        [wallet.address, token],
        props.onClose,
    )

    if (isNativeTokenAddress(tokenAddress)) return null
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
