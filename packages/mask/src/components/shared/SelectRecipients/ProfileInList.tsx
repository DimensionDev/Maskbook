import { useCallback } from 'react'
import { ListItemText, Checkbox, ListItemAvatar, ListItem } from '@mui/material'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import Highlighter from 'react-highlight-words'
import { formatPersonaFingerprint, formatPersonaPublicKey, ProfileInformation as Profile } from '@masknet/shared-base'
import { Avatar } from '../../../utils/components/Avatar'
import type { CheckboxProps } from '@mui/material/Checkbox'
import { CopyIcon } from '@masknet/icons'
import { truncate } from 'lodash-unified'
import { useI18N } from '../../../utils'

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
    toolTip: {
        maxWidth: 250,
        fontSize: 14,
        lineHeight: '18px',
        padding: 10,
        boxSizing: 'border-box',
        borderRadius: 4,
        whiteSpace: 'normal',
        marginTop: 0,
        transform: 'translate(5px,45px,0px)',
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
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const profile = props.item
    const resolveSecondaryText = () => {
        if (profile.publicHexKey) return formatPersonaPublicKey(profile.publicHexKey?.toUpperCase() ?? '', 4)
        return formatPersonaFingerprint(profile.fingerprint ?? '', 5)
    }
    const resolvePrimaryText = () => {
        if (profile.fromNextID) {
            const rawStr = profile.linkedTwitterNames!.map((x) => '@' + x).join(' ')
            if (rawStr.length > 15) {
                const len = profile.linkedTwitterNames?.length
                return truncate(rawStr, { length: 15 }) + (len! > 1 ? `(${len})` : '')
            }
            return rawStr
        }
        return `@${profile.identifier.userId || profile.nickname}`
    }

    const ToolTipText = () => {
        const linkedNames = profile.linkedTwitterNames!
        const len = linkedNames?.length!
        if (profile.fromNextID) {
            if (len === 1 && linkedNames[0]?.length > 14) {
                return `${t('select_friends_dialog_persona_connect')} @${linkedNames}.`
            }
            if (len > 1) {
                return `${t('select_friends_dialog_persona_connect')} ${profile
                    .linkedTwitterNames!.map((x) => '@' + x)
                    .join(', ')}.`
            }
        }
        return ''
    }

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
                        <ShadowRootTooltip
                            title={ToolTipText()}
                            arrow
                            classes={{
                                tooltip: classes.toolTip,
                            }}>
                            <div>
                                <Highlighter
                                    className={classes.highLightBase}
                                    highlightClassName={classes.highlighted}
                                    searchWords={[props.search ?? '']}
                                    autoEscape
                                    textToHighlight={resolvePrimaryText()}
                                />
                            </div>
                        </ShadowRootTooltip>
                    </div>
                }
                secondary={
                    <div className={classes.flex}>
                        <Highlighter
                            className={classes.highLightSecond}
                            highlightClassName={classes.highlighted}
                            searchWords={[props.search ?? '']}
                            autoEscape
                            textToHighlight={resolveSecondaryText()}
                        />
                        <CopyIcon
                            className={classes.actionIcon}
                            onClick={() =>
                                props.onCopy((profile.publicHexKey ?? profile.fingerprint)?.toUpperCase() ?? '')
                            }
                        />
                        {profile.fromNextID && <div className={classes.badge}>Next.ID</div>}
                    </div>
                }
            />
            <Checkbox onClick={onClick} checked={!!props.checked} color="primary" {...props.CheckboxProps} />
        </ListItem>
    )
}
