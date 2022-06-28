import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { GasOptionType, getLocale } from '@masknet/web3-shared-base'
import { useSharedI18N } from '@masknet/shared'
import { Typography } from '@mui/material'
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import formatDistanceStrict from 'date-fns/formatDistanceStrict'
import addSeconds from 'date-fns/addSeconds'
import type { SupportedLanguages } from '@masknet/public-api'
import { SettingsContext } from './Context'

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

export interface GasOptionProps {
    type: GasOptionType
    option: Web3Helper.GasOptionAll
    lang?: SupportedLanguages
    checked?: boolean
    onClick?: () => void
}

export function GasOption(props: GasOptionProps) {
    const { type, option, lang, checked = false, onClick } = props
    const { classes } = useStyles()
    const t = useSharedI18N()
    const { GAS_OPTION_NAMES } = SettingsContext.useContainer()

    const now = useMemo(() => {
        return new Date()
    }, [option])

    return (
        <div
            className={classes.root}
            style={{ color: checked ? MaskColorVar.primary : MaskColorVar.border }}
            onClick={onClick}>
            {checked ? <CheckCircle color="inherit" /> : <RadioButtonUnchecked color="inherit" />}
            <Typography className={classes.type}>{GAS_OPTION_NAMES[type]}</Typography>
            <Typography className={classes.estimate}>
                &lt;{' '}
                {formatDistanceStrict(addSeconds(now, option.estimatedSeconds), now, {
                    addSuffix: true,
                    locale: getLocale(lang),
                })}
            </Typography>
            <Typography className={classes.amount}>
                {t.gas_settings_gas_option_amount_in_gwei({
                    amount: new BigNumber(option.suggestedMaxFeePerGas).toFixed(2),
                })}
            </Typography>
        </div>
    )
}
