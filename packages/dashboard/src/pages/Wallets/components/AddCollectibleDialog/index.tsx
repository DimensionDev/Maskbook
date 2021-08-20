import { memo, useEffect, useState } from 'react'
import { MaskDialog, MaskTextField } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { Box, Button, DialogActions, DialogContent } from '@material-ui/core'
import { useWallet } from '@masknet/web3-shared'
import { EthereumAddress } from 'wallet.ts'
import { useDashboardI18N } from '../../../../locales'
import { z } from 'zod'
import { Controller, useForm, ErrorOption } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export interface AddCollectibleDialogProps {
    open: boolean
    onClose: () => void
}

type FormInputs = {
    address: string
    //  all the tokenId is number?
    tokenId: string
}
type FormError = {
    name: keyof FormInputs
    option: ErrorOption
}

export const AddCollectibleDialog = memo<AddCollectibleDialogProps>(({ open, onClose }) => {
    const t = useDashboardI18N()
    const [address, setAddress] = useState('')
    const [error, setError] = useState<FormError>()

    const wallet = useWallet()
    // Todo: The current implement does not work, please refactor this component according to dashboard 1.0 Add Asset:
    // Todo: maskbook/src/extension/options-page/DashboardDialogs/Wallet/AddERC721Token.tsx
    // const tokenDetailed = useERC721TokenDetailed(address)
    // const assetDetailed = useERC721TokenAssetDetailed(tokenDetailed.value)

    const onSubmit = useSnackbarCallback({
        executor: async () => {
            // if (!tokenDetailed.value || !assetDetailed.value || !wallet) return
            // await Promise.all([
            //     PluginServices.Wallet.addERC721Token({
            //         ...tokenDetailed.value,
            //         asset: assetDetailed.value,
            //     }),
            //     PluginServices.Wallet.trustERC721Token(wallet.address, tokenDetailed.value),
            // ])
        },
        deps: [wallet],
        onSuccess: onClose,
        // todo: handle error
        onError: () =>
            setError({ name: 'tokenId', option: { type: 'value', message: t.wallets_collectible_error_not_exist() } }),
    })

    return (
        <AddCollectibleDialogUI
            open={open}
            onClose={onClose}
            address={address}
            onAddressChange={setAddress}
            onSubmit={onSubmit}
            error={error}
            exclude={Array.from(wallet?.erc721_token_whitelist ?? [])}
        />
    )
})

export interface AddCollectibleDialogUIProps {
    open: boolean
    onClose: () => void
    address: string
    exclude: string[]
    error?: FormError
    onAddressChange: (address: string) => void
    onSubmit: () => void
}

export const AddCollectibleDialogUI = memo<AddCollectibleDialogUIProps>(
    ({ open, error, onClose, address, exclude, onAddressChange, onSubmit }) => {
        const t = useDashboardI18N()

        useEffect(() => {
            if (!error) return
            setError(error.name, error.option)
        })

        const schema = z.object({
            address: z
                .string()
                .min(1)
                .refine((address) => EthereumAddress.isValid(address), t.wallets_incorrect_address()),
            tokenId: z
                .string()
                .min(1)
                .refine((address) => !exclude.find((item) => item === address), t.wallets_collectible_been_added()),
        })

        const {
            control,
            handleSubmit,
            setError,
            formState: { errors },
        } = useForm<FormInputs>({
            resolver: zodResolver(schema),
            defaultValues: {
                address: '',
                tokenId: '',
            },
        })

        return (
            <MaskDialog open={open} title={t.wallets_add_collectible()} onClose={onClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
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
                        <Button sx={{ minWidth: 100 }} color="primary" type="submit">
                            {t.wallets_collectible_add()}
                        </Button>
                    </DialogActions>
                </form>
            </MaskDialog>
        )
    },
)
