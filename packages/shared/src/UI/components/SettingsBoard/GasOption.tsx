import { useMemo } from 'react'
import { formatDistanceStrict, addSeconds } from 'date-fns'
import { makeStyles } from '@masknet/theme'
import { type GasOptionType, getLocale, formatCurrency } from '@masknet/web3-shared-base'
import { Typography, useTheme } from '@mui/material'
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatWeiToGwei } from '@masknet/web3-shared-evm'
import type { SupportedLanguages } from '@masknet/public-api'
import { SettingsContext } from './Context.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            fontWeight: 700,
            padding: theme.spacing(2.5, 0),
        },
        type: {
            fontWeight: 700,
            color: theme.palette.text.primary,
            margin: theme.spacing(0, 0.5, 0, 1),
            fontSize: 16,
        },
        estimate: {
            flex: 1,
            color: theme.palette.text.secondary,
            fontWeight: 400,
            fontSize: 16,
        },
        amount: {
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: 16,
        },
    }
})

interface GasOptionProps {
    type: GasOptionType
    option: Web3Helper.GasOptionAll
    lang?: SupportedLanguages
    checked?: boolean
    onClick?: () => void
}

export function GasOption(props: GasOptionProps) {
    const { type, option, lang, checked = false, onClick } = props
    const { classes } = useStyles()
    const theme = useTheme()
    const { GAS_OPTION_NAMES } = SettingsContext.useContainer()

    const now = useMemo(() => {
        return new Date()
    }, [option])

    return (
        <div
            className={classes.root}
            style={{ color: checked ? theme.palette.maskColor.primary : theme.palette.maskColor.line }}
            onClick={onClick}>
            {checked ?
                <CheckCircle color="inherit" />
            :   <RadioButtonUnchecked color="inherit" />}
            <Typography className={classes.type}>{GAS_OPTION_NAMES[type]}</Typography>
            <Typography className={classes.estimate}>
                ~{' '}
                {formatDistanceStrict(addSeconds(now, option.estimatedSeconds), now, {
                    addSuffix: true,
                    locale: getLocale(lang),
                })}
            </Typography>
            <Typography className={classes.amount}>
                <Trans>up to {formatCurrency(formatWeiToGwei(option.suggestedMaxFeePerGas), '')} Gwei</Trans>
            </Typography>
        </div>
    )
}
