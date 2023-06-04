import { Icons } from '@masknet/icons'
import { useSnackbarCallback } from '@masknet/shared'
import { formatPersonaFingerprint, type ProfileInformationFromNextID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Checkbox, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { truncate } from 'lodash-es'
import { useCallback } from 'react'
import Highlighter from 'react-highlight-words'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../../utils/index.js'
import { Avatar } from '../../../utils/components/Avatar.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: 8,
        cursor: 'pointer',
        padding: 0,
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
        width: 16,
        height: 16,
        cursor: 'pointer',
        marginLeft: theme.spacing(0.5),
    },
    badge: {
        width: 32,
        height: 18,
        marginLeft: theme.spacing(0.5),
    },
    highLightBg: {
        background: theme.palette.maskColor.bg,
    },
    avatarBox: {
        padding: '6px 0px 6px 8px',
        minWidth: 46,
    },
    avatar: {
        width: 36,
        height: 36,
    },
    highLightBase: {
        lineHeight: '20px',
        fontSize: 14,
    },
    highLightSecond: {
        fontSize: 16,
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
        fontSize: 14,
        lineHeight: '18px',
        padding: 10,
        boxSizing: 'border-box',
        borderRadius: 4,
        whiteSpace: 'normal',
        marginTop: 0,
    },
}))

export interface ProfileInListProps {
    item: ProfileInformationFromNextID
    highlightText?: string
    selected?: boolean
    disabled?: boolean
    onChange: (ev: React.MouseEvent<HTMLElement>, checked: boolean) => void
}

export function ProfileInList(props: ProfileInListProps) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const profile = props.item

    const [, copyToClipboard] = useCopyToClipboard()
    const rawPublicKey = profile.linkedPersona?.rawPublicKey
    const onCopyPubkey = useSnackbarCallback(
        async () => {
            if (!rawPublicKey) return
            copyToClipboard(rawPublicKey)
        },
        [rawPublicKey],
        undefined,
        undefined,
        undefined,
        t('copied'),
    )
    const highlightText = (() => {
        if (!profile.fromNextID) return `@${profile.identifier.userId || profile.nickname}`
        const mentions = profile.linkedTwitterNames?.map((x) => '@' + x).join(' ') ?? ''
        if (mentions.length < 15) return mentions
        const len = profile.linkedTwitterNames?.length ?? 0
        return truncate(mentions, { length: 15 }) + (len > 1 ? `(${len})` : '')
    })()

    const tooltipTitle = (() => {
        const linkedNames = profile.linkedTwitterNames ?? []
        if (linkedNames.length < 2) return ''
        const mentions = profile.linkedTwitterNames?.map((username) => '@' + username) ?? []
        return `${t('select_friends_dialog_persona_connect')} ${mentions.join(', ')}.`
    })()

    const onClick = useCallback((ev: React.MouseEvent<HTMLElement>) => props.onChange(ev, !props.selected), [props])
    const textToHighlight = formatPersonaFingerprint(profile.linkedPersona?.rawPublicKey?.toUpperCase() ?? '', 3)
    return (
        <ListItem
            onClick={onClick}
            className={cx(classes.root, props.selected ? classes.highLightBg : null)}
            secondaryAction={
                <Checkbox
                    disabled={props.disabled}
                    checked={!!props.selected}
                    color="primary"
                    size="small"
                    sx={{ width: 20, height: 20 }}
                />
            }>
            <ListItemAvatar classes={{ root: classes.avatarBox }}>
                <Avatar classes={{ root: classes.avatar }} person={profile} />
            </ListItemAvatar>
            <ListItemText
                classes={{
                    root: profile.fromNextID ? classes.columnReverse : classes.listItemRoot,
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primaryTypographyProps={{ component: 'div' }}
                primary={
                    <ShadowRootTooltip
                        title={tooltipTitle}
                        arrow
                        placement="top"
                        classes={{ tooltip: classes.toolTip }}>
                        <div className={classes.flex}>
                            <Highlighter
                                className={classes.highLightBase}
                                highlightClassName={classes.highlighted}
                                searchWords={[props.highlightText ?? '']}
                                autoEscape
                                textToHighlight={highlightText}
                            />
                        </div>
                    </ShadowRootTooltip>
                }
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                    <div className={classes.flex}>
                        <Highlighter
                            className={classes.highLightSecond}
                            highlightClassName={classes.highLightSecond}
                            searchWords={[props.highlightText ?? '']}
                            autoEscape
                            textToHighlight={textToHighlight}
                        />
                        <Icons.Copy className={classes.actionIcon} onClick={onCopyPubkey} />
                        <Icons.LinkOut className={classes.actionIcon} />
                        {profile.fromNextID ? <Icons.NextIDMini className={classes.badge} /> : null}
                    </div>
                }
            />
        </ListItem>
    )
}
