import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { texts, SettingsTexts } from './createSettings'
import {
    ListItem,
    ListItemText,
    Switch,
    Select,
    MenuItem,
    makeStyles,
    Paper,
    createStyles,
    Typography,
    List,
    Box,
} from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles({
    container: { listStyleType: 'none', width: '100%', display: 'flex', alignItems: 'center' },
})
interface SettingsTextsDisplay {
    primary?: React.ReactNode | string
    secondary?: React.ReactNode | string
}
export type SettingsMode = (
    | {
          type: 'auto'
      }
    | {
          type: 'enum'
          enum: any
      }
) &
    SettingsTextsDisplay

const usePaperStyles = makeStyles(theme =>
    createStyles({
        paper: {
            '&:not(:last-child)': {
                borderBottom: `1px solid ${theme.palette.divider}`,
            },
        },
    }),
)

export function SettingsUI<T>(props: { value: ValueRef<T>; mode?: SettingsMode }) {
    const { value: valueRef, mode = { type: 'auto' } as SettingsMode } = props
    // This file is share between context. prevent loading in the background.
    const currentValue = useValueRef(valueRef)
    const text = texts.get(valueRef)
    const classes = usePaperStyles()

    const _props: Props = {
        primaryText: mode.primary ?? text?.primary?.() ?? '_unknown_setting_',
        settingsRef: valueRef,
        secondaryText: mode.secondary ?? text?.secondary?.(),
    }

    return (
        <Paper className={classes.paper} elevation={0}>
            {mode.type === 'enum' ? (
                <EnumUI {..._props} enumObject={mode.enum} />
            ) : (
                <AutoUI {..._props} currentValue={currentValue} />
            )}
        </Paper>
    )
}

interface SettingsUIGroupProps {
    children: React.ReactNode
    title: string
}

export function SettingsUIGroup(props: SettingsUIGroupProps) {
    const { children, title } = props
    return (
        <List>
            <Typography component={Box} py={1} variant="h5">
                {title}
            </Typography>
            <Paper elevation={1}>{children}</Paper>
        </List>
    )
}

const useListItemStyles = makeStyles({
    secondaryActionSwitch: {
        pointerEvents: 'none',
    },
    secondaryActionSelect: {
        width: 150,
    },
    select: {
        width: '100%',
    },
    selectOutlined: {
        padding: 8,
    },
})

interface Props {
    primaryText: React.ReactNode
    secondaryText?: React.ReactNode
    settingsRef: ValueRef<any>
}
function EnumUI(props: Props & { enumObject: any }) {
    const classes = useStyles()
    const classes2 = useListItemStyles()
    const { enumObject, settingsRef, primaryText, secondaryText } = props
    const enum_ = Object.keys(enumObject)
        .filter(x => Number.isNaN(parseInt(x)))
        .map(key => ({ key, value: enumObject[key] }))
    return (
        <ListItem component="div" classes={classes}>
            <ListItemText primary={primaryText} secondary={secondaryText} />
            <div className={classes2.secondaryActionSelect}>
                <Select
                    variant="outlined"
                    classes={{ outlined: classes2.selectOutlined }}
                    className={classes2.select}
                    value={settingsRef.value}
                    onChange={(event: React.ChangeEvent<any>) => {
                        let value = event.target.value
                        if (!Number.isNaN(parseInt(value))) {
                            value = parseInt(value)
                        }
                        if (!enum_.some(x => x.value === value)) {
                            console.log(value)
                            throw new Error('Invalid state')
                        }
                        settingsRef.value = value
                    }}>
                    {enum_.map(({ key, value }) => (
                        <MenuItem value={String(value)} key={String(key)}>
                            {String(key)}
                        </MenuItem>
                    ))}
                </Select>
            </div>
        </ListItem>
    )
}

function AutoUI(props: Props & { currentValue: unknown }) {
    const { currentValue, primaryText, settingsRef, secondaryText } = props
    const classes = useStyles()
    const classes2 = useListItemStyles()
    switch (typeof currentValue) {
        case 'boolean':
            const ref = (settingsRef as ValueRef<unknown>) as ValueRef<boolean>
            const aria_id = Math.random().toString()
            return (
                <ListItem classes={classes} button onClick={() => (ref.value = !ref.value)}>
                    <ListItemText id={aria_id} primary={primaryText} secondary={secondaryText} />
                    <div className={classes2.secondaryActionSwitch}>
                        <Switch inputProps={{ 'aria-labelledby': aria_id }} edge="end" checked={currentValue} />
                    </div>
                </ListItem>
            )
        default:
            throw new Error('Not implemented yet')
    }
}
