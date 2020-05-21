import type { ValueRef } from '@holoflows/kit/es'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { texts } from './createSettings'
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Select,
    MenuItem,
    makeStyles,
    ListItemIcon,
    SelectProps,
    createStyles,
    IconButton,
} from '@material-ui/core'
import React from 'react'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: { listStyleType: 'none', width: '100%' },
        secondaryAction: { paddingLeft: theme.spacing(2) },
        listItemText: {
            fontWeight: 500,
        },
        listItemIcon: {
            marginLeft: 0,
        },
        arrowIcon: {
            color: theme.palette.text.secondary,
        },
    }),
)
type ExtraClasses = 'listItemRoot'

function withDefaultText<T>(props: SettingsUIProps<T>): SettingsUIProps<T> {
    const { value, primary, secondary } = props
    const text = texts.get(value)
    return {
        value,
        primary: primary ?? text?.primary?.() ?? '_unknown_setting_',
        secondary: secondary ?? text?.secondary?.(),
    }
}

interface SettingsUIProps<T> extends withClasses<KeysInferFromUseStyles<typeof useStyles> | ExtraClasses> {
    value: ValueRef<T>
    primary?: React.ReactNode
    secondary?: React.ReactNode
    icon?: React.ReactElement
}

function SharedListItem(
    props: Omit<SettingsUIProps<any>, 'value'> & { onClick?: () => void; action?: React.ReactNode; button?: boolean },
) {
    const { onClick, icon, action, primary, secondary, button } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <ListItem
            onClick={onClick}
            {...((button ? { button: true } : { component: 'div' }) as any)}
            disableGutters
            classes={{
                root: classes.listItemRoot,
                container: classes.container,
                secondaryAction: classes.secondaryAction,
            }}>
            {icon ? <ListItemIcon classes={{ root: classes.listItemIcon }}>{icon}</ListItemIcon> : null}
            <ListItemText classes={{ primary: classes.listItemText }} primary={primary} secondary={secondary} />
            {action}
        </ListItem>
    )
}

export function SettingsUI<T>(props: SettingsUIProps<T>) {
    const { value } = withDefaultText(props)
    const currentValue = useValueRef(value)
    switch (typeof currentValue) {
        case 'boolean':
            const [ui, change] = getBooleanSettingsUI(value as any, currentValue)
            const { primary, secondary } = withDefaultText(props)
            return (
                <SharedListItem
                    {...props}
                    button
                    primary={primary}
                    secondary={secondary}
                    onClick={change}
                    action={<ListItemSecondaryAction>{ui}</ListItemSecondaryAction>}
                />
            )
        default:
            return <SharedListItem {...props} primary={'Not implemented for type' + typeof currentValue} />
    }
}

export function SettingsUIDummy(props: Omit<SettingsUIProps<null>, 'value'> & { onClick: () => void }) {
    const classes = useStylesExtends(useStyles(), props)
    return (
        <SharedListItem
            {...props}
            button
            action={
                <ListItemSecondaryAction onClick={props.onClick}>
                    <IconButton>
                        <ArrowForwardIosIcon classes={{ root: classes.arrowIcon }} />
                    </IconButton>
                </ListItemSecondaryAction>
            }
        />
    )
}

export function SettingsUIEnum<T extends object>(
    props: {
        enumObject: T
        getText?: useEnumSettingsParams<T>[2]
        SelectProps?: SelectProps
    } & SettingsUIProps<T[keyof T]>,
) {
    const { primary, secondary } = withDefaultText(props)
    const [ui] = useEnumSettings(props.value, props.enumObject, props.getText, props.SelectProps)
    return (
        <SharedListItem
            {...props}
            primary={primary}
            secondary={secondary}
            action={<ListItemSecondaryAction>{ui}</ListItemSecondaryAction>}
        />
    )
}
type HookedUI<T> = [/** UI */ React.ReactNode, /** Changer */ T extends void ? () => void : (value: T) => void]
/**
 * Convert a ValueRef<boolean> into a Switch element.
 * This must not be a React hook because it need to run in a switch stmt
 */
function getBooleanSettingsUI(ref: ValueRef<boolean>, currentValue: boolean): HookedUI<void> {
    const change = () => (ref.value = !ref.value)
    const ui = <Switch color="primary" edge="end" checked={currentValue} onClick={change} />
    return [ui, change]
}
// TODO: should become generic in future
export function useSettingsUI(ref: ValueRef<boolean>) {
    const currentValue = useValueRef(ref)
    return getBooleanSettingsUI(ref, currentValue)
}
/**
 * Convert a ValueRef<Enum> into a Select element.
 * @param ref - The value ref
 * @param enumObject - The enum object
 * @param getText - Convert enum value into string.
 *
 * ? because the limit on the type system, I can't type it as an object which key is enum and value is string
 */
function useEnumSettings<Q extends object>(
    ...[ref, enumObject, getText, selectProps]: useEnumSettingsParams<Q>
): HookedUI<Q[keyof Q]> {
    const enum_ = Object.keys(enumObject)
        // Leave only key of enum
        .filter((x) => Number.isNaN(parseInt(x)))
        .map((key) => ({ key, value: enumObject[key as keyof Q] }))
    const change = (value: any) => {
        if (!Number.isNaN(parseInt(value))) {
            value = parseInt(value)
        }
        if (!enum_.some((x) => x.value === value)) {
            console.log(value)
            throw new Error('Invalid state')
        }
        ref.value = value
    }
    const ui = (
        <Select
            fullWidth
            variant="outlined"
            {...selectProps}
            value={useValueRef(ref)}
            onChange={(event) => change(event.target.value)}>
            {enum_.map(({ key, value }) => (
                <MenuItem value={String(value)} key={String(key)}>
                    {getText?.(value) ?? String(key)}
                </MenuItem>
            ))}
        </Select>
    )
    return [ui, change as any]
}
type useEnumSettingsParams<Q extends object> = [
    ValueRef<Q[keyof Q]>,
    Q,
    ((x: Q[keyof Q]) => string) | undefined,
    SelectProps | undefined,
]
