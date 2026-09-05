import { useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { CheckBoxIndicator, RadioIndicator } from '@masknet/theme'

export const meta = {
    title: 'Radio / CheckBox indicators',
    description: 'Icon-only controlled indicators (no MUI input wrapper).',
}

export default function IndicatorsDemo() {
    const [radio, setRadio] = useState(true)
    const [check, setCheck] = useState(false)

    return (
        <Stack spacing={4}>
            <Stack spacing={1}>
                <Typography variant="subtitle2">RadioIndicator</Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <span onClick={() => setRadio(true)} style={{ cursor: 'pointer' }}>
                        <RadioIndicator checked={radio} size={20} />
                    </span>
                    <span onClick={() => setRadio(false)} style={{ cursor: 'pointer' }}>
                        <RadioIndicator checked={!radio} size={20} />
                    </span>
                </Stack>
            </Stack>

            <Stack spacing={1}>
                <Typography variant="subtitle2">CheckBoxIndicator</Typography>
                <span onClick={() => setCheck((v) => !v)} style={{ cursor: 'pointer' }}>
                    <CheckBoxIndicator checked={check} size={20} />
                </span>
            </Stack>
        </Stack>
    )
}
