import { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { texts, SettingsTexts } from './createSettings'
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Select,
    MenuItem,
    makeStyles,
} from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles({
    container: { listStyleType: 'none', width: '100%' },
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
export function SettingsUI<T>(props: { value: ValueRef<T>; mode?: SettingsMode }) {
    const { value: valueRef, mode = { type: 'auto' } as SettingsMode } = props
    // This file is share between context. prevent loading in the background.
    const currentValue = useValueRef(valueRef)
    const text: SettingsTextsDisplay = mode || texts.get(valueRef) || {}

    const _props: Props = {
        primaryText: text.primary ?? '_unknown_setting_',
        settingsRef: valueRef,
        secondaryText: text.secondary,
    }

    if (mode.type === 'enum') return <EnumUI {..._props} enumObject={mode.enum} />
    else return <AutoUI {..._props} currentValue={currentValue} />
}
interface Props {
    primaryText: string
    secondaryText?: string
    settingsRef: ValueRef<any>
}
function EnumUI(props: Props & { enumObject: any }) {
    const classes = useStyles()
    const { enumObject, settingsRef, primaryText, secondaryText } = props
    const enum_ = Object.keys(enumObject)
        .filter(x => Number.isNaN(parseInt(x)))
        .map(key => ({ key, value: enumObject[key] }))
    return (
        <ListItem component="div" classes={classes}>
            <ListItemText id={primaryText} primary={primaryText} secondary={secondaryText} />
            <ListItemSecondaryAction>
                <Select
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
            </ListItemSecondaryAction>
        </ListItem>
    )
}

function AutoUI(props: Props & { currentValue: unknown }) {
    const { currentValue, primaryText, settingsRef, secondaryText } = props
    switch (typeof currentValue) {
        case 'boolean':
            const ref = (settingsRef as ValueRef<unknown>) as ValueRef<boolean>
            return (
                <ListItem button onClick={() => (ref.value = !ref.value)}>
                    <ListItemText id={primaryText} primary={primaryText} secondary={secondaryText} />
                    <ListItemSecondaryAction>
                        <Switch
                            inputProps={{ 'aria-labelledby': primaryText }}
                            edge="end"
                            checked={currentValue}
                            onClick={() => (ref.value = !ref.value)}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
            )
        default:
            throw new Error('Not implemented yet')
    }
}
