import { useCallback } from 'react'
import { difference } from 'lodash-es'
import { makeStyles, createStyles, Checkbox, FormControlLabel } from '@material-ui/core'
import { TradePool } from '../../types'
import { getEnumAsArray } from '../../../../utils/enum'
import { resolveTradePoolName } from '../../pipes'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        control: {
            boxSizing: 'border-box',
            width: '50%',
            padding: `0 ${theme.spacing(1)}px`,
            marginRight: 0,
        },
    })
})

export interface SelectPoolPanelProps {
    value: TradePool[]
    onChange: (value: TradePool[]) => void
}

export function SelectPoolPanel(props: SelectPoolPanelProps) {
    const { value } = props
    const classes = useStyles()

    const onChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            const source = Number.parseInt(ev.target.name, 10) as TradePool
            props.onChange(value.includes(source) ? difference(value, [source]) : value.concat(source))
        },
        [value, props.onChange],
    )

    return (
        <div className={classes.root}>
            {getEnumAsArray(TradePool).map((source) => (
                <FormControlLabel
                    className={classes.control}
                    label={resolveTradePoolName(source.value)}
                    control={
                        <Checkbox
                            color="primary"
                            name={String(source.value)}
                            checked={value.includes(source.value)}
                            onChange={onChange}
                        />
                    }
                />
            ))}
        </div>
    )
}
