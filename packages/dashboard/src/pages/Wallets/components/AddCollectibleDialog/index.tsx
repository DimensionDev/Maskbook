import { memo, useMemo, useState } from 'react'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import { Box, Button, DialogActions, DialogContent, makeStyles, TextField } from '@material-ui/core'
import { useERC721TokenAssetDetailed, useERC721TokenDetailed, useWallet } from '@dimensiondev/web3-shared'
import { useSnackbarCallback } from '../../../../hooks/useSnackbarCallback'
import { PluginServices } from '../../../../API'
import { EthereumAddress } from 'wallet.ts'
import { useDashboardI18N } from '../../../../locales'

export interface AddCollectibleDialogProps {
    open: boolean
    onClose: () => void
}

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: theme.typography.pxToRem(12),
        color: MaskColorVar.textPrimary,
        fontWeight: 500,
        marginBottom: 10,
    },
}))

export const AddCollectibleDialog = memo<AddCollectibleDialogProps>(({ open, onClose }) => {
    const t = useDashboardI18N()
    const [address, setAddress] = useState('')

    const wallet = useWallet()
    const tokenDetailed = useERC721TokenDetailed(address)
    const assetDetailed = useERC721TokenAssetDetailed(tokenDetailed.value)

    const onSubmit = useSnackbarCallback({
        executor: async () => {
            if (!tokenDetailed.value || !assetDetailed.value || !wallet) return
            await Promise.all([
                PluginServices.Wallet.addERC721Token({
                    ...tokenDetailed.value,
                    asset: assetDetailed.value,
                }),
                PluginServices.Wallet.trustERC721Token(wallet.address, tokenDetailed.value),
            ])
        },
        deps: [wallet, tokenDetailed, assetDetailed],
        onSuccess: onClose,
    })

    return (
        <MaskDialog open={open} title={t.wallets_add_collectible()} onClose={onClose}>
            <AddCollectibleUI
                address={address}
                setAddress={setAddress}
                onSubmit={onSubmit}
                exclude={Array.from(wallet?.erc721_token_whitelist ?? [])}
            />
        </MaskDialog>
    )
})

export interface AddCollectibleUIProps {
    address: string
    exclude: string[]
    setAddress: (address: string) => void
    onSubmit: () => void
}

export const AddCollectibleUI = memo<AddCollectibleUIProps>(({ address, exclude, setAddress, onSubmit }) => {
    const t = useDashboardI18N()
    const classes = useStyles()

    const validateAddressMessage = useMemo(() => {
        if (address.length && !EthereumAddress.isValid(address)) return t.wallets_incorrect_address()
        if (exclude.find((item) => item === address)) return t.wallets_collectible_been_added()
        return ''
    }, [address])

    return (
        <>
            <DialogContent>
                <form>
                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className={classes.title}>Collectible Address</label>
                        <TextField
                            variant="filled"
                            InputProps={{ disableUnderline: true }}
                            value={address}
                            error={!!validateAddressMessage}
                            helperText={validateAddressMessage}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </Box>
                </form>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={onSubmit}>
                    {t.wallets_collectible_add()}
                </Button>
            </DialogActions>
        </>
    )
})
