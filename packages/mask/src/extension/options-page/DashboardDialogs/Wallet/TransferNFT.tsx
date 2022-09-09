import { Button, TextField } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useCallback, useContext, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../utils'
import { MaskIconOutlined } from '../../../../resources/MaskIcon'
import { CollectibleContext } from '../../DashboardComponents/CollectibleList'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import { useTokenTransferCallback } from '@masknet/plugin-infra/web3-evm'
import { Image, useOpenShareTxDialog } from '@masknet/shared'

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
    const [{ loading }, transferCallback] = useTokenTransferCallback(token.schema, token.address)

    const openShareTxDialog = useOpenShareTxDialog()
    const onTransfer = useCallback(async () => {
        const hash = await transferCallback(token.tokenId, address)
        if (typeof hash === 'string') {
            await openShareTxDialog({
                hash,
            })
            onClose()
        }
        collectiblesRetry()
    }, [transferCallback, token.tokenId, address, collectiblesRetry, openShareTxDialog])
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
                            disabled={!!validationMessage || loading}
                            onClick={onTransfer}>
                            {validationMessage || t('wallet_transfer_send')}
                        </Button>
                    </div>
                }
            />
        </DashboardDialogCore>
    )
}
