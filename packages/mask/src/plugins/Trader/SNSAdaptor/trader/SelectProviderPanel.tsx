import { Chip } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { getEnumAsArray } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import { resolveTradeProviderName } from '../../pipes'
import { TradeProviderIcon } from './TradeProviderIcon'
import { Flags } from '../../../../../shared'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        chip: {
            marginRight: theme.spacing(1),
        },
        chipRoot: {
            paddingLeft: theme.spacing(1),
        },
        chipLabel: {
            paddingLeft: theme.spacing(0.5),
        },
    }
})

export interface SelectProviderPanelProps {
    value: TradeProvider
    onChange(value: TradeProvider): void
}

export function SelectProviderPanel(props: SelectProviderPanelProps) {
    const { value, onChange } = props

    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            {getEnumAsArray(TradeProvider).map((x) => {
                if (x.value === TradeProvider.ZRX && !Flags.trader_zrx_enabled) return null
                return (
                    <Chip
                        classes={{ root: classes.chipRoot, label: classes.chipLabel }}
                        className={classes.chip}
                        color={x.value === value ? 'primary' : 'default'}
                        icon={<TradeProviderIcon provider={x.value} />}
                        clickable
                        key={x.value}
                        label={resolveTradeProviderName(x.value)}
                        onClick={() => onChange(x.value)}
                    />
                )
            })}
        </div>
    )
}
