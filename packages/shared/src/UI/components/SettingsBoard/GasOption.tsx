import { makeStyles, MaskColorVar } from '@masknet/theme'
import { GasOptionType } from '@masknet/web3-shared-base'
import { useSharedI18N } from '@masknet/shared'
import { Typography } from '@mui/material'
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            fontWeight: 700,
            padding: theme.spacing(2.75, 0),
        },
        type: {
            fontWeight: 700,
            color: theme.palette.text.primary,
            margin: theme.spacing(0, 0.5, 0, 1),
        },
        estimate: {
            flex: 1,
            color: theme.palette.text.secondary,
            fontWeight: 400,
        },
        amount: {
            fontWeight: 700,
            color: theme.palette.text.primary,
        },
    }
})

export interface GasOption {
    type: GasOptionType
    estimatedSeconds: number
    suggestedMaxFeePerGas: string
}

export interface GasOptionItemProps extends GasOption {
    checked?: boolean
    onClick?: () => void
}

export function GasOptionItem(props: GasOptionItemProps) {
    const { type, checked = false, onClick } = props
    const { classes } = useStyles()
    const t = useSharedI18N()

    const map = {
        [GasOptionType.FAST]: t.gas_settings_gas_option_type_fast(),
        [GasOptionType.NORMAL]: t.gas_settings_gas_option_type_normal(),
        [GasOptionType.SLOW]: t.gas_settings_gas_option_type_slow(),
    }

    return (
        <div
            className={classes.root}
            style={{ color: checked ? MaskColorVar.primary : MaskColorVar.border }}
            onClick={onClick}>
            {checked ? <CheckCircle color="inherit" /> : <RadioButtonUnchecked color="inherit" />}
            <Typography className={classes.type}>{map[type]}</Typography>
            <Typography className={classes.estimate}>&lt; 10 sec</Typography>
            <Typography className={classes.amount}>up to 192.25 Gwei</Typography>
        </div>
    )
}
