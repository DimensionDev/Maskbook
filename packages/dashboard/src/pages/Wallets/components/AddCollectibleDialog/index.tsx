import { FormEvent, memo, useEffect, useState } from 'react'
import { MaskDialog, MaskTextField } from '@masknet/theme'
import { Box, Button, DialogActions, DialogContent } from '@material-ui/core'
import {
    isSameAddress,
    useERC721ContractDetailed,
    useERC721TokenDetailedCallback,
    useWallet,
} from '@masknet/web3-shared'
import { EthereumAddress } from 'wallet.ts'
import { useDashboardI18N } from '../../../../locales'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PluginServices } from '../../../../API'

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
    const wallet = useWallet()
    const [address, setAddress] = useState('')
    const { value: contractDetailed, loading: contractDetailLoading } = useERC721ContractDetailed(address)
    const [tokenId, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(contractDetailed)

    const onSubmit = async () => {
        if (contractDetailLoading || !wallet) return

        const tokenInDB = await PluginServices.Wallet.getERC721Token(address, tokenId)
        if (tokenInDB) throw new Error(FormErrorType.Added)

        const _tokenDetailed = await erc721TokenDetailedCallback()

        if (
            (_tokenDetailed && !isSameAddress(_tokenDetailed.info.owner, wallet.address)) ||
            !_tokenDetailed ||
            !_tokenDetailed.info.owner
        ) {
            throw new Error(FormErrorType.NotExist)
        } else {
            await PluginServices.Wallet.addERC721Token(_tokenDetailed)
            onClose()
        }
    }

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
                .min(1)
                .refine((address) => EthereumAddress.isValid(address), t.wallets_incorrect_address()),
            tokenId: z.string().min(1),
        })

        const {
            control,
            handleSubmit,
            setError,
            watch,
            reset,
            formState: { errors, isSubmitting },
        } = useForm<FormInputs>({
            resolver: zodResolver(schema),
            defaultValues: { address: '', tokenId: '' },
        })

        useEffect(() => {
            const subscription = watch((value) => {
                onAddressChange(value.address)
                onTokenIdChange(value.tokenId)
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
                <form onSubmit={handleFormSubmit}>
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
                    <DialogActions sx={{ mt: 3 }}>
                        <Button sx={{ minWidth: 100 }} variant="outlined" color="primary" onClick={onClose}>
                            {t.cancel()}
                        </Button>
                        <Button disabled={isSubmitting} sx={{ minWidth: 100 }} color="primary" type="submit">
                            {t.wallets_collectible_add()}
                        </Button>
                    </DialogActions>
                </form>
            </MaskDialog>
        )
    },
)
