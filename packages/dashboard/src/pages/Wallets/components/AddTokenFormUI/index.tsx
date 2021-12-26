import { memo } from 'react'
import { useDashboardI18N } from '../../../../locales'
import { Button, DialogActions, DialogContent, TextField } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { ERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useFormContext, Controller } from 'react-hook-form'

export interface AddTokenFormUIProps {
    onNext: () => void
    onClose: () => void
    token?: ERC20TokenDetailed
}

const useStyles = makeStyles()((theme) => ({
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

type AddTokenFormData = {
    address: string
    symbol: string
    decimals: number
}

export const AddTokenFormUI = memo<AddTokenFormUIProps>(({ token, onClose, onNext }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const {
        formState: { errors, isValid },
    } = useFormContext<AddTokenFormData>()

    return (
        <>
            <DialogContent className={classes.content}>
                <div className={classes.item}>
                    <Controller
                        render={({ field }) => (
                            <TextField
                                {...field}
                                variant="filled"
                                label={t.wallets_add_token_contract_address()}
                                InputProps={{ disableUnderline: true }}
                                error={!!errors.address?.message}
                                helperText={errors.address?.message}
                            />
                        )}
                        name="address"
                    />
                </div>
                <div className={classes.item}>
                    <Controller
                        render={({ field }) => (
                            <TextField
                                {...field}
                                variant="filled"
                                label={t.wallets_add_token_symbol()}
                                InputProps={{ disableUnderline: true }}
                                error={!!errors.symbol?.message}
                                helperText={errors.symbol?.message}
                            />
                        )}
                        name="symbol"
                    />
                </div>
                <div className={classes.item}>
                    <Controller
                        render={({ field }) => (
                            <TextField
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                variant="filled"
                                label={t.wallets_add_token_decimals()}
                                disabled={!!token?.decimals}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                InputProps={{ disableUnderline: true }}
                                error={!!errors.decimals?.message}
                                helperText={errors.decimals?.message}
                            />
                        )}
                        name="decimals"
                    />
                </div>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button color="secondary" className={classes.button} onClick={onClose}>
                    {t.wallets_add_token_cancel()}
                </Button>
                <Button color="primary" className={classes.button} onClick={onNext} disabled={!isValid}>
                    {t.wallets_add_token_next()}
                </Button>
            </DialogActions>
        </>
    )
})
