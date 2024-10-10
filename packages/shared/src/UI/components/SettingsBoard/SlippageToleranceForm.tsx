import { useState, useMemo, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { makeStyles, MaskTextField, MaskAlert } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Box, Paper } from '@mui/material'
import { isZero } from '@masknet/web3-shared-base'
import { NUMERIC_INPUT_REGEXP_PATTERN } from '@masknet/shared-base'
import type { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { RadioChip } from './RadioChip.js'
import { useSlippageToleranceSchema } from './hooks/index.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'center',
            boxShadow: `0px 0px 20px 0px ${theme.palette.mode === 'dark' ? '#FFFFFF1F' : '#0000000D'}`,
            backdropFilter: 'blur(16px)',
            marginTop: theme.spacing(1),
            padding: theme.spacing(2),
            justifyContent: 'space-between',
        },
        textfield: {
            flex: 1,
            maxWidth: 100,
        },
    }
})

interface SlippageToleranceFormProps {
    slippageTolerance: number
    slippageTolerances: number[]
    onChange?: (data?: zod.infer<ReturnType<typeof useSlippageToleranceSchema>>) => void
}

export function SlippageToleranceForm(props: SlippageToleranceFormProps) {
    const { _ } = useLingui()
    const { slippageTolerance, slippageTolerances, onChange } = props
    const { classes } = useStyles()

    const schema = useSlippageToleranceSchema()
    const [tolerance, setTolerance] = useState(slippageTolerance)

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
                                placeholder={_(msg`Custom`)}
                                InputProps={{
                                    type: 'number',
                                    inputProps: {
                                        pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                    },
                                }}
                                value={customSlippageTolerance}
                                error={!!methods.formState.errors.customSlippageTolerance?.message}
                                onChange={(ev) => {
                                    const v = Number.parseFloat(ev.target.value)
                                    const tolerance = Math.min(50, Number.isNaN(v) ? 0 : v)
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
            {error ?
                <MaskAlert icon={<Icons.Warning />} severity="error">
                    {error}
                </MaskAlert>
            : tolerance < slippageTolerances[0] ?
                <MaskAlert icon={<Icons.WarningTriangle color="warning" />} severity="warning">
                    <Trans>
                        Transaction with extremely low slippage tolerance might be reverted because of very small market
                        movement.
                    </Trans>
                </MaskAlert>
            : tolerance > slippageTolerances.at(-1)! ?
                <MaskAlert icon={<Icons.Warning />} severity="error">
                    <Trans>
                        You may have {tolerance.toString()}% less received with this level of slippage tolerance.
                    </Trans>
                </MaskAlert>
            :   null}
        </FormProvider>
    )
}
