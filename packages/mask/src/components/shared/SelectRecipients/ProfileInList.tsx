import { useCallback } from 'react'
import { ListItemText, Checkbox, ListItemAvatar, ListItem, Tooltip } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import Highlighter from 'react-highlight-words'
import { formatPersonaPublicKey, ProfileInformation as Profile } from '@masknet/shared-base'
import { Avatar } from '../../../utils/components/Avatar'
import type { CheckboxProps } from '@mui/material/Checkbox'
import { CopyIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    root: {
        maxWidth: 'calc(50% - 6px)',
        padding: '0 0 0 8px',
        borderRadius: 8,
    },
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    highlighted: {
        backgroundColor: 'inherit',
        color: 'inherit',
        fontWeight: 'bold',
    },
    flex: {
        display: 'flex',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 16,
        cursor: 'pointer',
    },
    badge: {
        background: theme.palette.background.input,
        color: theme.palette.text.strong,
        fontSize: 10,
        fontWeight: 700,
        marginLeft: 12,
        padding: '2px 4px',
        borderRadius: 2,
    },
    highLightBg: {
        background: theme.palette.background.default,
    },
    avatarBox: {
        minWidth: 46,
    },
    avatar: {
        width: 36,
        height: 36,
    },
    highLightBase: {
        lineHeight: '20px',
    },
    highLightSecond: {
        fontSize: 14,
        lineHeight: '20px',
    },
    listItemRoot: {
        margin: '4px 0',
    },
    columnReverse: {
        margin: '4px 0',
        display: 'flex',
        flexDirection: 'column-reverse',
    },
}))

export interface ProfileInListProps extends withClasses<never> {
    item: Profile
    search?: string
    checked?: boolean
    disabled?: boolean
    onChange: (ev: React.MouseEvent<HTMLButtonElement>, checked: boolean) => void
    onCopy(v: string): void
    CheckboxProps?: Partial<CheckboxProps>
}
export function ProfileInList(props: ProfileInListProps) {
    const { classes, cx } = useStyles()
    const profile = props.item
    const name = profile.nickname || profile.identifier.userId

    const secondary = formatPersonaPublicKey(profile.publicHexKey?.toUpperCase() ?? '', 4)

    const onClick = useCallback(
        (ev: React.MouseEvent<HTMLButtonElement>) => props.onChange(ev, !props.checked),
        [props],
    )
    return (
        <ListItem
            disabled={props.disabled}
            className={props.checked ? cx(classes.root, classes.highLightBg) : classes.root}>
            <ListItemAvatar
                classes={{
                    root: classes.avatarBox,
                }}>
                <Avatar
                    classes={{
                        root: classes.avatar,
                    }}
                    person={profile}
                />
            </ListItemAvatar>
            <ListItemText
                classes={{
                    root: profile.fromNextID ? classes.columnReverse : classes.listItemRoot,
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={
                    <div className={classes.flex}>
                        <Highlighter
                            className={classes.highLightBase}
                            highlightClassName={classes.highlighted}
                            searchWords={[props.search ?? '']}
                            autoEscape
                            textToHighlight={`@${name}`}
                        />
                    </div>
                }
                secondary={
                    <Tooltip title="sxqsxqsxq" placement="top" arrow>
                        <div className={classes.flex}>
                            <Highlighter
                                className={classes.highLightSecond}
                                highlightClassName={classes.highlighted}
                                searchWords={[props.search ?? '']}
                                autoEscape
                                textToHighlight={secondary || ''}
                            />
                            <CopyIcon
                                className={classes.actionIcon}
                                onClick={() => props.onCopy(profile.publicHexKey?.toUpperCase() ?? '')}
                            />
                            {profile.fromNextID && <div className={classes.badge}>Next.ID</div>}
                        </div>
                    </Tooltip>
                }
            />
            <Checkbox onClick={onClick} checked={!!props.checked} color="primary" {...props.CheckboxProps} />
        </ListItem>
    )
}
