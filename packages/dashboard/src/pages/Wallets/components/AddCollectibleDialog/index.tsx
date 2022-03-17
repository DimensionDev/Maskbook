import { FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { makeStyles, MaskDialog, MaskTextField } from '@masknet/theme'
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { ImageIcon } from '@masknet/shared'
import {
    isSameAddress,
    useERC721ContractDetailed,
    useERC721TokenDetailedCallback,
    useWallet,
} from '@masknet/web3-shared-evm'
import { Web3TokenType } from '@masknet/web3-shared-base'
import { EthereumAddress } from 'wallet.ts'
import { useDashboardI18N } from '../../../../locales'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PluginServices } from '../../../../API'
import { useNetworkDescriptor } from '@masknet/plugin-infra'

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

    const onSubmit = useCallback(async () => {
        if (contractDetailLoading || !wallet) return

        const tokenInDB = await PluginServices.Wallet.getToken(Web3TokenType.ERC721, address, tokenId)
        if (tokenInDB) throw new Error(FormErrorType.Added)

        const tokenDetailed = await erc721TokenDetailedCallback()

        if (
            (tokenDetailed && !isSameAddress(tokenDetailed.info.owner, wallet.address)) ||
            !tokenDetailed ||
            !tokenDetailed.info.owner
        ) {
            throw new Error(FormErrorType.NotExist)
        } else {
            await PluginServices.Wallet.addToken(tokenDetailed)
            onClose()
        }
    }, [contractDetailLoading, wallet, address, tokenId, erc721TokenDetailedCallback])

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

const useStyles = makeStyles()((theme) => ({
    chainTipWrapper: {
        display: 'flex',
        alignItems: 'center',
    },
    tip: {
        marginLeft: 16,
        maxWidth: 400,
    },
}))

export const AddCollectibleDialogUI = memo<AddCollectibleDialogUIProps>(
    ({ open, onClose, onAddressChange, onTokenIdChange, onSubmit }) => {
        const t = useDashboardI18N()
        const network = useNetworkDescriptor()
        const { classes } = useStyles()

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
                        <Box className={classes.chainTipWrapper} sx={{ mb: 3 }}>
                            <ImageIcon icon={network?.icon} />
                            <Typography className={classes.tip}>
                                {t.wallets_add_collectible_network_tip({ network: network?.name ?? '' })}
                            </Typography>
                        </Box>
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
