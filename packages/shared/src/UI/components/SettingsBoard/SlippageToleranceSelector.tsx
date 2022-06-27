import { useRef, useState } from 'react'
import { makeStyles, MaskColorVar, MaskTextField } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { Box, Paper } from '@mui/material'
import { RadioChip } from './RadioChip'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
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
        unit: {
            color: MaskColorVar.textLight,
        },
    }
})

export interface SlippageToleranceSelectorProps {
    slippageTolerances: number[]
    onChange?: (tolerance: number) => void
}

export function SlippageToleranceSelector(props: SlippageToleranceSelectorProps) {
    const { slippageTolerances, onChange } = props
    const t = useSharedI18N()
    const { classes } = useStyles()

    const ref = useRef<HTMLInputElement>()
    const [tolerance, setTolerance] = useState(1)
    const [customTolerance, setCustomTolerance] = useState(0)

    return (
        <Paper className={classes.root}>
            {slippageTolerances.map((x) => (
                <RadioChip
                    key={x}
                    label={`${x}%`}
                    checked={customTolerance === 0 && tolerance === x}
                    onClick={() => {
                        setTolerance(x)
                        setCustomTolerance(0)
                        if (ref.current) ref.current.value = ''
                        onChange?.(x)
                    }}
                />
            ))}
            <Box className={classes.textfield}>
                <MaskTextField
                    className={classes.textfield}
                    placeholder={t.gas_settings_custom()}
                    InputProps={{
                        type: 'number',
                    }}
                    inputProps={{
                        ref,
                    }}
                    onChange={(ev) => {
                        const v = Number.parseFloat(ev.target.value)
                        const tolerance = isNaN(v) ? 0 : v
                        setCustomTolerance(tolerance)
                        onChange?.(tolerance)
                    }}
                />
            </Box>
        </Paper>
    )
}
