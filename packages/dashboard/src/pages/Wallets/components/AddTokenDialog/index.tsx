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
    const classes = useStyles()
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
                <>
                    <DialogContent className={classes.content}>
                        <AddTokenFormUI address={address} setAddress={setAddress} token={token} open={open} />
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Button color="secondary" className={classes.button} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={() => setStep(AddTokenStep.CONFIRM)}>
                            Next
                        </Button>
                    </DialogActions>
                </>
            ) : null}
            {step === AddTokenStep.CONFIRM ? (
                <>
                    <DialogContent className={classes.content}>
                        <AddTokenConfirmUI token={token} balance={balance} />
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Button color="secondary" className={classes.button} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button color="primary" className={classes.button} onClick={onSubmit}>
                            Add Token
                        </Button>
                    </DialogActions>
                </>
            ) : null}
        </MaskDialog>
    )
})

const useAddTokenFormUIStyles = makeStyles((theme) => ({
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
}))

export interface AddTokenFormUIProps {
    open: boolean
    address: string
    setAddress: (address: string) => void
    token?: ERC20TokenDetailed
}

export const AddTokenFormUI = memo<AddTokenFormUIProps>(({ address, setAddress, token, open }) => {
    const classes = useAddTokenFormUIStyles()
    const [symbol, setSymbol] = useState('')
    const [decimals, setDecimals] = useState('')

    const validateAddressMessage = useMemo(() => {
        if (address.length && !EthereumAddress.isValid(address)) return 'Incorrect contract address.'
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
    )
})

const useAddTokenConfirmStyle = makeStyles((theme) => ({
    container: {
        '& > *': {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
    },
    title: {
        fontWeight: 500,
    },
}))

export interface AddTokenConfirmUIProps {
    token?: ERC20TokenDetailed
    balance?: string
}

export const AddTokenConfirmUI = memo<AddTokenConfirmUIProps>(({ token, balance }) => {
    const classes = useAddTokenConfirmStyle()

    return (
        <Stack spacing={4.5} className={classes.container}>
            <Box>
                <Typography className={classes.title}>Token</Typography>
                <Typography className={classes.title}>Balance</Typography>
            </Box>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon
                        address={token?.address ?? ''}
                        name={token?.name}
                        chainId={token?.chainId}
                        AvatarProps={{ sx: { width: 48, height: 48 } }}
                    />
                    <Typography className={classes.title} sx={{ marginLeft: 1.2 }}>
                        {token?.symbol}
                    </Typography>
                </Box>
                <Typography className={classes.title}>
                    {balance} {token?.symbol}
                </Typography>
            </Box>
        </Stack>
    )
})
