import { memo, useEffect, useMemo, useState } from 'react'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import { Box, Button, DialogActions, DialogContent, makeStyles, Stack, TextField, Typography } from '@material-ui/core'
import { EthereumAddress } from 'wallet.ts'
import { ERC20TokenDetailed, useERC20TokenBalance, useERC20TokenDetailed, useWallet } from '@dimensiondev/web3-shared'
import { TokenIcon } from '../TokenIcon'
import { useUpdateEffect } from 'react-use'
import { useSnackbarCallback } from '../../../../hooks/useSnackbarCallback'
import { PluginServices } from '../../../../API'

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
    const [step, setStep] = useState<AddTokenStep>(AddTokenStep.INFORMATION)
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

    //#region When dialog be closed, reset step and clear address input
    useUpdateEffect(() => {
        if (!open) {
            setStep(AddTokenStep.INFORMATION)
            setAddress('')
        }
    }, [open])

    return (
        <MaskDialog open={open} title="Add Token" onClose={onClose}>
            {step === AddTokenStep.INFORMATION ? (
                <AddTokenFormUI
                    address={address}
                    setAddress={setAddress}
                    token={token}
                    open={open}
                    exclude={Array.from(wallet?.erc20_token_whitelist ?? [])}
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
})

export interface AddTokenFormUIProps {
    open: boolean
    address: string
    exclude: string[]
    setAddress: (address: string) => void
    onNext: () => void
    onClose: () => void
    token?: ERC20TokenDetailed
}

export const AddTokenFormUI = memo<AddTokenFormUIProps>(
    ({ address, setAddress, token, open, exclude, onClose, onNext }) => {
        const classes = useStyles()
        const [symbol, setSymbol] = useState('')
        const [decimals, setDecimals] = useState('')

        const validateAddressMessage = useMemo(() => {
            if (address.length && !EthereumAddress.isValid(address)) return 'Incorrect contract address.'
            if (exclude.find((item) => item === address)) return 'Token has already been added'
            return ''
        }, [address])

        const validateSymbolMessage = useMemo(() => {
            if (symbol.length && symbol.length > 11) return 'Symbol must be 11 characters or fewer.'
            return ''
        }, [])

        const validateDecimalsMessage = useMemo(() => {
            if (decimals.length && (Number(decimals) < 0 || Number(decimals) > 18))
                return 'Decimals must be at least 0, and not over 18.'
            return ''
        }, [decimals])

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
                            <label className={classes.title}>Token Contract Address</label>
                            <TextField
                                variant="filled"
                                value={address}
                                InputProps={{ disableUnderline: true }}
                                error={!!validateAddressMessage}
                                helperText={validateAddressMessage}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div className={classes.item}>
                            <label className={classes.title}>Token Symbol</label>
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
                            <label className={classes.title}>Decimals of Precision</label>
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
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        className={classes.button}
                        onClick={onNext}
                        disabled={
                            !address ||
                            !symbol ||
                            !decimals ||
                            !!validateAddressMessage ||
                            !!validateSymbolMessage ||
                            !!validateDecimalsMessage
                        }>
                        Next
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
    const classes = useStyles()

    return (
        <>
            <DialogContent className={classes.content}>
                <Stack spacing={4.5} className={classes.container}>
                    <Box>
                        <Typography className={classes.confirmTitle}>Token</Typography>
                        <Typography className={classes.confirmTitle}>Balance</Typography>
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
                    Cancel
                </Button>
                <Button color="primary" className={classes.button} onClick={onConfirm}>
                    Add Token
                </Button>
            </DialogActions>
        </>
    )
})
