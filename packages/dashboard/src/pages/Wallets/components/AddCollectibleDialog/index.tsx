import { FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { MaskDialog, MaskTextField } from '@masknet/theme'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { EthereumAddress } from 'wallet.ts'
import { useDashboardI18N } from '../../../../locales'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    useWeb3Connection,
    useChainId,
    useNonFungibleTokenContract,
    useAccount,
    useWeb3Hub,
} from '@masknet/plugin-infra/web3'

export interface AddCollectibleDialogProps {
    open: boolean
    onClose: () => void
}

type FormInputs = {
    address: string
    tokenId: string
}

enum FormErrorType {
    Added = 'ADDED',
    NotExist = 'NOT_EXIST',
}

export const AddCollectibleDialog = memo<AddCollectibleDialogProps>(({ open, onClose }) => {
    const wallet = useAccount(NetworkPluginID.PLUGIN_EVM)
    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const hub = useWeb3Hub(NetworkPluginID.PLUGIN_EVM)

    const { value, loading, error, retry } = useNonFungibleTokenContract(NetworkPluginID.PLUGIN_EVM, address, tokenId)

    const onSubmit = useCallback(async () => {
        if (loading || !wallet || !value || !hub?.getNonFungibleAsset) return

        // const tokenInDB = await PluginServices.Wallet.getToken(SchemaType.ERC721, address, tokenId)
        // if (tokenInDB)
        if (!value) throw new Error(FormErrorType.Added)

        const tokenDetailed = await hub?.getNonFungibleAsset?.(address ?? '', tokenId, {
            chainId,
        })

        if (
            (tokenDetailed && !isSameAddress(tokenDetailed?.owner?.address, wallet)) ||
            !tokenDetailed ||
            !tokenDetailed.owner
        ) {
            throw new Error(FormErrorType.NotExist)
        } else {
            console.log(tokenDetailed)
            // await PluginServices.Wallet.addToken(tokenDetailed)
            onClose()
        }
    }, [wallet, address, tokenId, value, loading, hub?.getNonFungibleAsset])

    return (
        <AddCollectibleDialogUI
            open={open}
            onClose={onClose}
            address={address}
            onAddressChange={setAddress}
            onTokenIdChange={setTokenId}
            onSubmit={onSubmit}
        />
    )
})

export interface AddCollectibleDialogUIProps {
    open: boolean
    onClose: () => void
    address: string
    onAddressChange: (address: string) => void
    onTokenIdChange: (tokenId: string) => void
    onSubmit: () => void
}

export const AddCollectibleDialogUI = memo<AddCollectibleDialogUIProps>(
    ({ open, onClose, onAddressChange, onTokenIdChange, onSubmit }) => {
        const t = useDashboardI18N()

        const schema = z.object({
            address: z
                .string()
                .min(1, t.wallets_collectible_field_contract_require())
                .refine((address) => EthereumAddress.isValid(address), t.wallets_incorrect_address()),
            tokenId: z.string().min(1, t.wallets_collectible_field_token_id_require()),
        })

        const {
            control,
            handleSubmit,
            setError,
            watch,
            reset,
            formState: { errors, isSubmitting, isDirty },
        } = useForm<FormInputs>({
            resolver: zodResolver(schema),
            defaultValues: { address: '', tokenId: '' },
        })

        useEffect(() => {
            const subscription = watch((value) => {
                onAddressChange(value.address!)
                onTokenIdChange(value.tokenId!)
            })
            return () => subscription.unsubscribe()
        }, [watch])

        const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
            handleSubmit(onSubmit)(event).catch((error) => {
                setError('tokenId', {
                    type: 'value',
                    message:
                        error.message === FormErrorType.Added
                            ? t.wallets_collectible_been_added()
                            : t.wallets_collectible_error_not_exist(),
                })
            })
        }

        const handleClose = () => {
            reset()
            onClose()
        }

        return (
            <MaskDialog open={open} title={t.wallets_add_collectible()} onClose={handleClose}>
                <form noValidate onSubmit={handleFormSubmit}>
                    <DialogContent>
                        <Box>
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <MaskTextField
                                        {...field}
                                        label={t.wallets_collectible_address()}
                                        required
                                        helperText={errors.address?.message}
                                        error={!!errors.address}
                                    />
                                )}
                                name="address"
                            />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <MaskTextField
                                        {...field}
                                        label={t.wallets_collectible_token_id()}
                                        required
                                        helperText={errors.tokenId?.message}
                                        error={!!errors.tokenId}
                                    />
                                )}
                                name="tokenId"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ pt: 3 }}>
                        <Button sx={{ minWidth: 100 }} variant="outlined" color="primary" onClick={onClose}>
                            {t.cancel()}
                        </Button>
                        <Button
                            disabled={isSubmitting || !isDirty}
                            sx={{ minWidth: 100 }}
                            color="primary"
                            type="submit">
                            {t.wallets_collectible_add()}
                        </Button>
                    </DialogActions>
                </form>
            </MaskDialog>
        )
    },
)
