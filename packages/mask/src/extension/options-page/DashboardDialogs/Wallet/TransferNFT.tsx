import { useCallback, useContext, useMemo, useState } from 'react'
import { Button, TextField } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { isValidAddress, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import { useTokenTransferCallback } from '@masknet/web3-hooks-evm'
import { Image } from '@masknet/shared'
import { useI18N } from '../../../../utils/index.js'
import { CollectibleListContext } from '../../DashboardComponents/CollectibleList/index.js'
import { DashboardDialogCore, DashboardDialogWrapper, type WrappedDialogProps } from '../Base.js'
import { Icons } from '@masknet/icons'

const useTransferDialogStylesNFT = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1),
    },
    button: {
        marginTop: theme.spacing(3),
    },
    placeholder: {
        opacity: 0.1,
    },
}))

export function DashboardWalletTransferDialogNFT(
    props: WrappedDialogProps<{
        token: NonFungibleToken<ChainId, SchemaType>
    }>,
) {
    const { token } = props.ComponentProps!
    const { onClose } = props

    const { t } = useI18N()
    const { classes } = useTransferDialogStylesNFT()

    const [address, setAddress] = useState('')
    const { collectiblesRetry } = useContext(CollectibleListContext)

    // #region transfer tokens
    const [{ loading }, transferCallback] = useTokenTransferCallback(token.schema, token.address)

    const onTransfer = useCallback(async () => {
        const hash = await transferCallback(token.tokenId, address)
        if (typeof hash === 'string') {
            onClose()
        }
        collectiblesRetry()
    }, [transferCallback, token.tokenId, address, collectiblesRetry])
    // #endregion

    // #region validation
    const validationMessage = useMemo(() => {
        if (!address) return t('wallet_transfer_error_address_absence')
        if (!isValidAddress(address)) return t('wallet_transfer_error_invalid_address')
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
                        <Icons.OutlinedMask size={48} className={classes.placeholder} />
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
