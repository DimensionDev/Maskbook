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
    useWeb3State,
    useTrustedNonFungibleTokens,
    useCurrentWeb3NetworkPluginID,
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
    const currentNetworkPluginID = useCurrentWeb3NetworkPluginID()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { Token } = useWeb3State<'all'>()
    const trustedNonFungibleTokens = useTrustedNonFungibleTokens(currentNetworkPluginID)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const [address, setAddress] = useState('')
    const [tokenId, setTokenId] = useState('')

    const { value, loading } = useNonFungibleTokenContract(NetworkPluginID.PLUGIN_EVM, address, tokenId)

    const onSubmit = useCallback(async () => {
        if (loading || !account || !value || !connection?.getNonFungibleToken) return

        // If the NonFungible token is added
        const tokenInDB = trustedNonFungibleTokens.find(
            (x) => isSameAddress(x.contract?.owner, account) && x.tokenId === tokenId && x.address === address,
        )
        if (tokenInDB) throw new Error(FormErrorType.Added)

        const tokenDetailed = await connection?.getNonFungibleToken(address ?? '', tokenId, {
            chainId,
        })

        // If the NonFungible token is belong this account
        if (
            (tokenDetailed && !isSameAddress(tokenDetailed?.contract?.owner, account)) ||
            !tokenDetailed ||
            !tokenDetailed.contract?.owner
        ) {
            throw new Error(FormErrorType.NotExist)
        } else {
            await Token?.addToken?.(tokenDetailed)
            onClose()
        }
    }, [account, address, tokenId, value, loading, connection?.getNonFungibleToken, trustedNonFungibleTokens.length])

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
