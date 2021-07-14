import { useCallback } from 'react'
import { difference } from 'lodash-es'
import { Checkbox, FormControlLabel, makeStyles } from '@material-ui/core'
import { ZrxTradePool } from '../../types'
import { getEnumAsArray } from '@dimensiondev/kit'
import { resolveZrxTradePoolName } from '../../pipes'

const useStyles = makeStyles((theme) => {
    return {
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
    }
})

export interface SelectPoolPanelProps {
    value: ZrxTradePool[]
    onChange: (value: ZrxTradePool[]) => void
}

export function SelectPoolPanel(props: SelectPoolPanelProps) {
    const { value } = props
    const classes = useStyles()

    const onChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            const pool = ev.target.name as ZrxTradePool
            props.onChange(value.includes(pool) ? difference(value, [pool]) : value.concat(pool))
        },
        [value, props.onChange],
    )

    return (
        <div className={classes.root}>
            {getEnumAsArray(ZrxTradePool).map((pool) => (
                <FormControlLabel
                    className={classes.control}
                    label={resolveZrxTradePoolName(pool.value)}
                    key={pool.value}
                    control={
                        <Checkbox
                            color="primary"
                            name={String(pool.value)}
                            checked={value.includes(pool.value)}
                            onChange={onChange}
                        />
                    }
                />
            ))}
        </div>
    )
}
