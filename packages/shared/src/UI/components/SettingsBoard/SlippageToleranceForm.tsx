import { useState, useMemo, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { makeStyles, MaskTextField, MaskAlert } from '@masknet/theme'
import { WarningIcon } from '@masknet/icons'
import { useSharedI18N } from '@masknet/shared'
import { Box, Paper } from '@mui/material'
import { isZero } from '@masknet/web3-shared-base'
import type { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { RadioChip } from './RadioChip'
import { useSlippageToleranceSchema } from './hooks'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'center',
            boxShadow: `0px 0px 20px 0px ${theme.palette.mode === 'dark' ? '#FFFFFF1F' : '#0000000D'}`,
            backdropFilter: 'blur(16px)',
            marginTop: theme.spacing(1),
        },
        textfield: {
            flex: 1,
            paddingRight: 9,
            '& input[type=number]': {
                '-moz-appearance': 'textfield',
            },
            '& input[type=number]::-webkit-outer-spin-button': {
                '-webkit-appearance': 'none',
            },
            '& input[type=number]::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
            },
        },
    }
})

export interface SlippageToleranceFormProps {
    slippageTolerances: number[]
    onChange?: (data?: zod.infer<ReturnType<typeof useSlippageToleranceSchema>>) => void
}

export function SlippageToleranceForm(props: SlippageToleranceFormProps) {
    const { slippageTolerances, onChange } = props
    const t = useSharedI18N()
    const { classes } = useStyles()

    const schema = useSlippageToleranceSchema()
    const [tolerance, setTolerance] = useState(1)

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            customSlippageTolerance: '',
        },
    })

    const [customSlippageTolerance] = methods.watch(['customSlippageTolerance'])

    const error = useMemo(() => {
        return methods.formState.errors.customSlippageTolerance?.message
    }, [methods.formState.errors.customSlippageTolerance?.message])

    useEffect(() => {
        onChange?.({
            customSlippageTolerance: !error ? tolerance.toString() : '0',
        })
    }, [tolerance, error])

    return (
        <FormProvider {...methods}>
            <Paper className={classes.root}>
                {slippageTolerances.map((x) => (
                    <RadioChip
                        key={x}
                        label={`${x}%`}
                        checked={isZero(customSlippageTolerance || '0') && tolerance === x}
                        onClick={() => {
                            methods.setValue('customSlippageTolerance', '')
                            methods.clearErrors('customSlippageTolerance')
                            setTolerance(x)
                            onChange?.({
                                customSlippageTolerance: x.toString(),
                            })
                        }}
                    />
                ))}
                <Box className={classes.textfield}>
                    <Controller
                        render={({ field }) => (
                            <MaskTextField
                                {...field}
                                placeholder={t.gas_settings_custom()}
                                InputProps={{
                                    type: 'number',
                                }}
                                inputProps={{
                                    pattern: '^[0-9]*[.,]?[0-9]*$',
                                }}
                                value={customSlippageTolerance}
                                error={!!methods.formState.errors.customSlippageTolerance?.message}
                                onChange={(ev) => {
                                    const v = Number.parseFloat(ev.target.value)
                                    const tolerance = Number.isNaN(v) ? 0 : v
                                    setTolerance(tolerance)
                                    methods.setValue(
                                        'customSlippageTolerance',
                                        ev.target.value === '' ? '' : tolerance.toString(),
                                        {
                                            shouldValidate: true,
                                        },
                                    )
                                }}
                            />
                        )}
                        name="customSlippageTolerance"
                    />
                </Box>
            </Paper>
            {error ? (
                <MaskAlert icon={<WarningIcon />} severity="error">
                    {error}
                </MaskAlert>
            ) : null}
        </FormProvider>
    )
}
