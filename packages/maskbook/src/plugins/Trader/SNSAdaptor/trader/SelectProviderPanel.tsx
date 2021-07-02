import { Chip, makeStyles } from '@material-ui/core'
import { getEnumAsArray } from '@dimensiondev/kit'
import { TradeProvider } from '../../types'
import { resolveTradeProviderName } from '../../pipes'
import { TradeProviderIcon } from './TradeProviderIcon'
import { Flags } from '../../../../utils/flags'

const useStyles = makeStyles((theme) => {
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
    const classes = useStyles()

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
