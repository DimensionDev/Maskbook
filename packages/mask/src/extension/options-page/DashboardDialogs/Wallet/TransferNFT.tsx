import { Button, TextField } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { ChainId, formatEthereumAddress, SchemaType, TransactionStateType } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Image } from '../../../../components/shared/Image'
import { WalletMessages } from '../../../../plugins/Wallet/messages'
import { MaskIconOutlined } from '../../../../resources/MaskIcon'
import { CollectibleContext } from '../../DashboardComponents/CollectibleList'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import { useTokenTransferCallback } from '@masknet/plugin-infra/web3-evm'

const useTransferDialogStylesNFT = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1),
    },
    button: {
        marginTop: theme.spacing(3),
    },
    placeholder: {
        width: 48,
        height: 48,
        opacity: 0.1,
    },
}))

export function DashboardWalletTransferDialogNFT(
    props: WrappedDialogProps<{ token: NonFungibleToken<ChainId, SchemaType> }>,
) {
    const { token } = props.ComponentProps!
    const { onClose } = props

    const { t } = useI18N()
    const { classes } = useTransferDialogStylesNFT()

    const [address, setAddress] = useState('')
    const { collectiblesRetry } = useContext(CollectibleContext)

    // #region transfer tokens
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        token.schema,
        token.address,
    )

    const onTransfer = useCallback(async () => {
        await transferCallback(token.tokenId, address)
    }, [transferCallback, token.tokenId, address])
    // #endregion

    // #region remote controlled transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        useCallback(
            (ev: { open: boolean }) => {
                if (ev.open) return
                resetTransferCallback()
                if (transferState.type !== TransactionStateType.HASH) return
                onClose()
                collectiblesRetry()
            },
            [transferState.type, collectiblesRetry],
        ),
    )

    // open the transaction dialog
    useEffect(() => {
        if (transferState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: transferState,
            summary: `Transfer ${token.metadata?.name} to ${formatEthereumAddress(address, 4)}.`,
        })
    }, [transferState /* update tx dialog only if state changed */])
    // #endregion

    // #region validation
    const validationMessage = useMemo(() => {
        if (!address) return t('wallet_transfer_error_address_absence')
        if (!EthereumAddress.isValid(address)) return t('wallet_transfer_error_invalid_address')
        return ''
    }, [address, token])
    // #endregion

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_title')}
                icon={
                    token.metadata?.mediaURL ? (
                        <Image
                            component="img"
                            width={160}
                            height={220}
                            style={{ objectFit: 'contain' }}
                            src={token.metadata.mediaURL}
                        />
                    ) : (
                        <MaskIconOutlined className={classes.placeholder} />
                    )
                }
                size="medium"
                content={
                    <div className={classes.root}>
                        <TextField
                            required
                            label={t('wallet_transfer_to_address')}
                            placeholder={t('wallet_transfer_to_address')}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            inputProps={{ spellCheck: 'false' }}
                        />
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            disabled={
                                !!validationMessage || transferState.type === TransactionStateType.WAIT_FOR_CONFIRMING
                            }
                            onClick={onTransfer}>
                            {validationMessage || t('wallet_transfer_send')}
                        </Button>
                    </div>
                }
            />
        </DashboardDialogCore>
    )
}
