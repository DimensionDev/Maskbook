import { memo, useMemo, useState } from 'react'
import { MaskDialog } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { Box, Button, DialogActions, DialogContent, TextField } from '@material-ui/core'
import { useWallet } from '@masknet/web3-shared'
import { EthereumAddress } from 'wallet.ts'
import { useDashboardI18N } from '../../../../locales'

export interface AddCollectibleDialogProps {
    open: boolean
    onClose: () => void
}

export const AddCollectibleDialog = memo<AddCollectibleDialogProps>(({ open, onClose }) => {
    const [address, setAddress] = useState('')

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
    })

    return (
        <AddCollectibleDialogUI
            open={open}
            onClose={onClose}
            address={address}
            onAddressChange={setAddress}
            onSubmit={onSubmit}
            exclude={Array.from(wallet?.erc721_token_whitelist ?? [])}
        />
    )
})

export interface AddCollectibleDialogUIProps {
    open: boolean
    onClose: () => void
    address: string
    exclude: string[]
    onAddressChange: (address: string) => void
    onSubmit: () => void
}

export const AddCollectibleDialogUI = memo<AddCollectibleDialogUIProps>(
    ({ open, onClose, address, exclude, onAddressChange, onSubmit }) => {
        const t = useDashboardI18N()
        const validateAddressMessage = useMemo(() => {
            if (address.length && !EthereumAddress.isValid(address)) return t.wallets_incorrect_address()
            if (exclude.find((item) => item === address)) return t.wallets_collectible_been_added()
            return ''
        }, [address])

        return (
            <MaskDialog open={open} title={t.wallets_add_collectible()} onClose={onClose}>
                <DialogContent>
                    <form>
                        <Box style={{ display: 'flex', flexDirection: 'column' }}>
                            <TextField
                                variant="filled"
                                label={t.wallets_collectible_address()}
                                InputProps={{ disableUnderline: true }}
                                value={address}
                                error={!!validateAddressMessage}
                                helperText={validateAddressMessage}
                                onChange={(e) => onAddressChange(e.target.value)}
                            />
                        </Box>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={onSubmit}>
                        {t.wallets_collectible_add()}
                    </Button>
                </DialogActions>
            </MaskDialog>
        )
    },
)
