import { Button, makeStyles, TextField } from '@material-ui/core'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useRemoteControlledDialog, useI18N } from '../../../../utils'
import { Image } from '../../../../components/shared/Image'
import { EthereumMessages } from '../../../../plugins/Ethereum/messages'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { MaskbookIconOutlined } from '../../../../resources/MaskbookIcon'
import { useTokenTransferCallback } from '../../../../web3/hooks/useTokenTransferCallback'
import { TransactionStateType } from '../../../../web3/hooks/useTransactionState'
import type { ERC1155TokenAssetDetailed, ERC721TokenAssetDetailed } from '../../../../web3/types'
import { CollectibleContext } from '../../DashboardComponents/CollectibleList'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { WalletProps } from './types'

const useTransferDialogStylesNFT = makeStyles((theme) => ({
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
    props: WrappedDialogProps<WalletProps & { token: ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed }>,
) {
    const { wallet, token } = props.ComponentProps!
    const { onClose } = props

    const { t } = useI18N()
    const classes = useTransferDialogStylesNFT()

    const [address, setAddress] = useState('')
    const { collectiblesRetry } = useContext(CollectibleContext)

    //#region transfer tokens
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        token.type,
        token.address,
        token.tokenId,
        address,
    )

    const onTransfer = useCallback(async () => {
        await transferCallback()
    }, [transferCallback])
    //#endregion

    //#region remote controlled transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        useCallback(
            (ev) => {
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
            summary: `Transfer ${token.name} to ${formatEthereumAddress(address, 4)}.`,
        })
    }, [transferState /* update tx dialog only if state changed */])
    //#endregion

    //#region validation
    const validationMessage = useMemo(() => {
        if (!address) return t('wallet_transfer_error_address_absence')
        if (!EthereumAddress.isValid(address)) return t('wallet_transfer_error_invalid_address')
        return ''
    }, [address, token])
    //#endregion

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_title')}
                icon={
                    token.asset?.image ? (
                        <Image
                            component="img"
                            width={160}
                            height={220}
                            style={{ objectFit: 'contain' }}
                            src={token.asset.image}
                        />
                    ) : (
                        <MaskbookIconOutlined className={classes.placeholder} />
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
