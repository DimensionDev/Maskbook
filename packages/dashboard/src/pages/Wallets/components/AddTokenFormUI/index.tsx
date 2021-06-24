import { memo, useEffect, useMemo, useState } from 'react'
import { useDashboardI18N } from '../../../../locales'
import { EthereumAddress } from 'wallet.ts'
import { useUpdateEffect } from 'react-use'
import { Button, DialogActions, DialogContent, makeStyles, TextField } from '@material-ui/core'
import type { ERC20TokenDetailed } from '@masknet/web3-shared'
import { isSameAddress } from '@masknet/web3-shared'

export interface AddTokenFormUIProps {
    open: boolean
    address: string
    exclude: string[]
    onAddressChange: (address: string) => void
    onNext: () => void
    onClose: () => void
    token?: ERC20TokenDetailed
}

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
}))

export const AddTokenFormUI = memo<AddTokenFormUIProps>(
    ({ address, onAddressChange, token, open, exclude, onClose, onNext }) => {
        const t = useDashboardI18N()
        const classes = useStyles()
        const [symbol, setSymbol] = useState('')
        const [decimals, setDecimals] = useState('')

        const validateAddressMessage = useMemo(() => {
            if (address.length && !EthereumAddress.isValid(address)) return t.wallets_incorrect_address()
            if (exclude.find((item) => isSameAddress(item, address))) return t.wallets_token_been_added()
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
                            <TextField
                                variant="filled"
                                value={address}
                                label={t.wallets_add_token_contract_address()}
                                InputProps={{ disableUnderline: true }}
                                error={!!validateAddressMessage}
                                helperText={validateAddressMessage}
                                onChange={(e) => onAddressChange(e.target.value)}
                            />
                        </div>
                        <div className={classes.item}>
                            <TextField
                                variant="filled"
                                value={symbol}
                                label={t.wallets_add_token_symbol()}
                                InputProps={{ disableUnderline: true }}
                                error={!!validateSymbolMessage}
                                onChange={(e) => setSymbol(e.target.value)}
                                helperText={validateSymbolMessage}
                            />
                        </div>
                        <div className={classes.item}>
                            <TextField
                                variant="filled"
                                type="number"
                                value={decimals}
                                label={t.wallets_add_token_decimals()}
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
