import { memo, useEffect, useMemo, useState } from 'react'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import { Box, Button, DialogActions, DialogContent, makeStyles, Stack, TextField, Typography } from '@material-ui/core'
import { EthereumAddress } from 'wallet.ts'
import { ERC20TokenDetailed, useERC20TokenBalance, useERC20TokenDetailed, useWallet } from '@dimensiondev/web3-shared'
import { TokenIcon } from '../TokenIcon'
import { useUpdateEffect } from 'react-use'
import { useSnackbarCallback } from '../../../../hooks/useSnackbarCallback'
import { PluginServices } from '../../../../API'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(3.5, 5, 5),
        minWidth: 600,
    },
    actions: {
        padding: theme.spacing(1, 5, 6.75, 5),
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(3.5),
    },
    button: {
        borderRadius: Number(theme.shape.borderRadius) * 5,
    },
    item: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: theme.spacing(3.75),
        '&:last-child': {
            marginBottom: 0,
        },
    },
    title: {
        fontSize: theme.typography.pxToRem(12),
        fontWeight: 500,
        color: MaskColorVar.textPrimary,
        marginBottom: theme.spacing(1.2),
    },
    container: {
        '& > *': {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
    },
    confirmTitle: {
        fontWeight: 500,
    },
}))

export interface AddTokenDialogProps {
    open: boolean
    onClose: () => void
}

enum AddTokenStep {
    INFORMATION,
    CONFIRM,
}

export const AddTokenDialog = memo<AddTokenDialogProps>(({ open, onClose }) => {
    const [address, setAddress] = useState('')

    const wallet = useWallet()
    const { value: token } = useERC20TokenDetailed(address)
    const { value: balance } = useERC20TokenBalance(address)

    const onSubmit = useSnackbarCallback({
        executor: async () => {
            if (!token || !wallet) return
            await Promise.all([
                PluginServices.Wallet.addERC20Token(token),
                PluginServices.Wallet.trustERC20Token(wallet.address, token),
            ])
        },
        deps: [token, wallet],
        onSuccess: onClose,
    })

    return (
        <AddTokenDialogUI
            address={address}
            onAddressChange={setAddress}
            open={open}
            onClose={onClose}
            token={token}
            exclude={Array.from(wallet?.erc20_token_whitelist ?? [])}
            balance={balance}
            onSubmit={onSubmit}
        />
    )
})

export interface AddTokenDialogUIProps {
    address: string
    onAddressChange: (address: string) => void
    open: boolean
    onClose: () => void
    token?: ERC20TokenDetailed
    exclude: string[]
    balance?: string
    onSubmit: () => void
}

export const AddTokenDialogUI = memo<AddTokenDialogUIProps>(
    ({ address, onAddressChange, open, onClose, token, exclude, balance, onSubmit }) => {
        const t = useDashboardI18N()
        const [step, setStep] = useState<AddTokenStep>(AddTokenStep.INFORMATION)

        //#region When dialog be closed, reset step and clear address input
        useUpdateEffect(() => {
            if (!open) {
                setStep(AddTokenStep.INFORMATION)
                onAddressChange('')
            }
        }, [open])

        return (
            <MaskDialog open={open} title={t.wallets_add_token()} onClose={onClose}>
                {step === AddTokenStep.INFORMATION ? (
                    <AddTokenFormUI
                        address={address}
                        onAddressChange={onAddressChange}
                        token={token}
                        open={open}
                        exclude={exclude}
                        onClose={onClose}
                        onNext={() => setStep(AddTokenStep.CONFIRM)}
                    />
                ) : null}
                {step === AddTokenStep.CONFIRM ? (
                    <>
                        <AddTokenConfirmUI
                            token={token}
                            balance={balance}
                            onBack={() => setStep(AddTokenStep.INFORMATION)}
                            onConfirm={onSubmit}
                        />
                    </>
                ) : null}
            </MaskDialog>
        )
    },
)

export interface AddTokenFormUIProps {
    open: boolean
    address: string
    exclude: string[]
    onAddressChange: (address: string) => void
    onNext: () => void
    onClose: () => void
    token?: ERC20TokenDetailed
}

export const AddTokenFormUI = memo<AddTokenFormUIProps>(
    ({ address, onAddressChange, token, open, exclude, onClose, onNext }) => {
        const t = useDashboardI18N()
        const classes = useStyles()
        const [symbol, setSymbol] = useState('')
        const [decimals, setDecimals] = useState('')

        const validateAddressMessage = useMemo(() => {
            if (address.length && !EthereumAddress.isValid(address)) return t.wallets_incorrect_address()
            if (exclude.find((item) => item === address)) return t.wallets_token_been_added()
            return ''
        }, [address])

        const validateSymbolMessage = useMemo(() => {
            if (symbol.length && symbol.length > 11) return t.wallets_token_symbol_tips()
            return ''
        }, [])

        const validateDecimalsMessage = useMemo(() => {
            if (decimals.length && (Number(decimals) < 0 || Number(decimals) > 18))
                return t.wallets_token_decimals_tips()
            return ''
        }, [decimals])

        const disableButton = useMemo(
            () =>
                !address ||
                !symbol ||
                !decimals ||
                !!validateAddressMessage ||
                !!validateSymbolMessage ||
                !!validateDecimalsMessage,
            [address, symbol, decimals, validateAddressMessage, validateSymbolMessage, validateDecimalsMessage],
        )

        useEffect(() => {
            if (token) {
                setSymbol(token.symbol ?? '')
                setDecimals(String(token.decimals))
            }
        }, [token])

        //#region when dialog be closed, clear input
        useUpdateEffect(() => {
            if (!open) {
                setSymbol('')
                setDecimals('')
            }
        }, [open])

        return (
            <>
                <DialogContent className={classes.content}>
                    <form>
                        <div className={classes.item}>
                            <label className={classes.title}>{t.wallets_add_token_contract_address()}</label>
                            <TextField
                                variant="filled"
                                value={address}
                                InputProps={{ disableUnderline: true }}
                                error={!!validateAddressMessage}
                                helperText={validateAddressMessage}
                                onChange={(e) => onAddressChange(e.target.value)}
                            />
                        </div>
                        <div className={classes.item}>
                            <label className={classes.title}>{t.wallets_add_token_symbol()}</label>
                            <TextField
                                variant="filled"
                                value={symbol}
                                InputProps={{ disableUnderline: true }}
                                error={!!validateSymbolMessage}
                                onChange={(e) => setSymbol(e.target.value)}
                                helperText={validateSymbolMessage}
                            />
                        </div>
                        <div className={classes.item}>
                            <label className={classes.title}>{t.wallets_add_token_decimals()}</label>
                            <TextField
                                variant="filled"
                                type="number"
                                value={decimals}
                                disabled={!!token?.decimals}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                InputProps={{ disableUnderline: true }}
                                error={!!validateDecimalsMessage}
                                helperText={validateDecimalsMessage}
                                onChange={(e) => setDecimals(e.target.value)}
                            />
                        </div>
                    </form>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <Button color="secondary" className={classes.button} onClick={onClose}>
                        {t.wallets_add_token_cancel()}
                    </Button>
                    <Button color="primary" className={classes.button} onClick={onNext} disabled={disableButton}>
                        {t.wallets_add_token_next()}
                    </Button>
                </DialogActions>
            </>
        )
    },
)

export interface AddTokenConfirmUIProps {
    onBack: () => void
    onConfirm: () => void
    token?: ERC20TokenDetailed
    balance?: string
}

export const AddTokenConfirmUI = memo<AddTokenConfirmUIProps>(({ token, balance, onBack, onConfirm }) => {
    const t = useDashboardI18N()
    const classes = useStyles()

    return (
        <>
            <DialogContent className={classes.content}>
                <Stack spacing={4.5} className={classes.container}>
                    <Box>
                        <Typography className={classes.confirmTitle}>{t.wallets_assets_token()}</Typography>
                        <Typography className={classes.confirmTitle}>{t.wallets_assets_balance()}</Typography>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TokenIcon
                                address={token?.address ?? ''}
                                name={token?.name}
                                chainId={token?.chainId}
                                AvatarProps={{ sx: { width: 48, height: 48 } }}
                            />
                            <Typography className={classes.confirmTitle} sx={{ marginLeft: 1.2 }}>
                                {token?.symbol}
                            </Typography>
                        </Box>
                        <Typography className={classes.confirmTitle}>
                            {balance} {token?.symbol}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button color="secondary" className={classes.button} onClick={onBack}>
                    {t.wallets_add_token_cancel()}
                </Button>
                <Button color="primary" className={classes.button} onClick={onConfirm}>
                    {t.wallets_add_token()}
                </Button>
            </DialogActions>
        </>
    )
})
