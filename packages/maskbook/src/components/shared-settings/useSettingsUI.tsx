import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import { getEnumAsArray } from '@dimensiondev/kit'
import {
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    SelectProps,
    Switch,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { texts } from '../../settings/createSettings'
import { useMatchXS } from '../../utils'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: { listStyleType: 'none', width: '100%' },
    secondaryAction: { paddingLeft: theme.spacing(2) },
    listItemText: {
        fontWeight: 500,
    },
    listItemIcon: {
        marginLeft: 0,
    },
    listItemActionMobile: {
        maxWidth: '60%',
    },
    arrowIcon: {
        color: theme.palette.text.primary,
    },
}))

function withDefaultText<T>(props: SettingsUIProps<T>): SettingsUIProps<T> {
    const { value, primary, secondary } = props
    const text = texts.get(value)
    return {
        value,
        primary: primary ?? text?.primary?.() ?? '_unknown_setting_',
        secondary: secondary ?? text?.secondary?.(),
    }
}

interface SettingsUIProps<T> extends withClasses<'listItemRoot'> {
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
            classes={{
                root: classes.listItemRoot,
                container: classes.container,
                secondaryAction: classes.secondaryAction,
            }}
            onClick={onClick}
            {...((button ? { button: true } : { component: 'div' }) as any)}>
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
        case 'boolean': {
            const ref = value as unknown as ValueRef<boolean>
            const change = () => void (ref.value = !ref.value)
            const ui = <Switch color="primary" edge="end" checked={currentValue} onClick={change} />
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
        }
        case 'number':
        case 'string':
        default:
            return <SharedListItem {...props} primary={'Unknown settings type ' + typeof currentValue} />
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
                    <ArrowForwardIosIcon classes={{ root: classes.arrowIcon }} />
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
        ignoredItems?: T[keyof T][]
    } & SettingsUIProps<T[keyof T]>,
) {
    const { primary, secondary } = withDefaultText(props)
    const xsMatched = useMatchXS()
    const { classes } = useStyles()
    const { value, enumObject, getText, SelectProps, ignoredItems } = props
    const ui = useEnumSettings(value, enumObject, getText, SelectProps, ignoredItems)
    return (
        <SharedListItem
            {...props}
            primary={primary}
            secondary={secondary}
            action={
                xsMatched ? (
                    <div className={classes.listItemActionMobile}>{ui}</div>
                ) : (
                    <ListItemSecondaryAction>{ui}</ListItemSecondaryAction>
                )
            }
        />
    )
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
    ...[ref, enumObject, getText, selectProps, ignoredItems]: useEnumSettingsParams<Q>
) {
    const enum_ = getEnumAsArray(enumObject)
    const change = (value: any) => {
        if (!Number.isNaN(Number.parseInt(value, 10))) {
            value = Number.parseInt(value, 10)
        }
        if (!enum_.some((x) => x.value === value)) {
            throw new Error('Invalid state')
        }
        ref.value = value
    }

    return (
        <Select
            fullWidth
            variant="outlined"
            value={useValueRef(ref)}
            onChange={(event) => change(event.target.value)}
            {...selectProps}>
            {enum_
                .filter((x) => !ignoredItems?.includes(x.value))
                .map(({ key, value }) => (
                    <MenuItem value={String(value)} key={String(key)}>
                        {getText?.(value) ?? String(key)}
                    </MenuItem>
                ))}
        </Select>
    )
}

type useEnumSettingsParams<Q extends object> = [
    ref: ValueRef<Q[keyof Q]>,
    enumObject: Q,
    getText: ((x: Q[keyof Q]) => string) | undefined,
    selectProps: SelectProps | undefined,
    ignoredItems: Q[keyof Q][] | undefined,
]
