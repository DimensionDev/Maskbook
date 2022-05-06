import { useCallback } from 'react'
import { ListItemText, Checkbox, ListItemAvatar, ListItem } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import Highlighter from 'react-highlight-words'
import type { ProfileInformation as Profile } from '@masknet/shared-base'
import { Avatar } from '../../../utils/components/Avatar'
import type { CheckboxProps } from '@mui/material/Checkbox'
import { CopyIcon } from '@masknet/icons'
import { formatPersonaFingerprint } from '@masknet/shared-base'

const useStyle = makeStyles()((theme) => ({
    root: {
        maxWidth: 'calc(50% - 6px)',
        paddingLeft: 8,
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
    const classes = useStylesExtends(useStyle(), props)
    const profile = props.item
    const name = profile.nickname || profile.identifier.userId

    const secondary = formatPersonaFingerprint(profile.fingerprint?.toUpperCase() ?? '', 5)

    const onClick = useCallback(
        (ev: React.MouseEvent<HTMLButtonElement>) => props.onChange(ev, !props.checked),
        [props],
    )
    return (
        <ListItem disabled={props.disabled} className={classes.root}>
            <ListItemAvatar>
                <Avatar person={profile} />
            </ListItemAvatar>
            <ListItemText
                classes={{
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={
                    <div className={classes.flex}>
                        <Highlighter
                            highlightClassName={classes.highlighted}
                            searchWords={[props.search ?? '']}
                            autoEscape
                            textToHighlight={name}
                        />
                        {profile.fromNextID && <div className={classes.badge}>Next.ID</div>}
                    </div>
                }
                secondary={
                    <div className={classes.flex}>
                        <Highlighter
                            highlightClassName={classes.highlighted}
                            searchWords={[props.search ?? '']}
                            autoEscape
                            textToHighlight={secondary || ''}
                        />
                        <CopyIcon
                            className={classes.actionIcon}
                            onClick={() => props.onCopy(profile.fingerprint?.toUpperCase() ?? '')}
                        />
                    </div>
                }
            />
            <Checkbox onClick={onClick} checked={!!props.checked} color="primary" {...props.CheckboxProps} />
        </ListItem>
    )
}
