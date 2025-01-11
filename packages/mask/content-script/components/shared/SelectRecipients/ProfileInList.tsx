import { Icons } from '@masknet/icons'
import { CopyButton } from '@masknet/shared'
import { EMPTY_LIST, formatPersonaFingerprint, type ProfileInformationFromNextID } from '@masknet/shared-base'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Checkbox, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import { truncate } from 'lodash-es'
import { memo, useCallback, useMemo } from 'react'
import Highlighter from 'react-highlight-words'
import { Avatar } from '../../../../shared-ui/components/Avatar.js'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react'

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

interface ProfileInListProps {
    profile: ProfileInformationFromNextID
    highlightText?: string
    selected?: boolean
    disabled?: boolean
    onChange: (profile: ProfileInformationFromNextID, checked: boolean) => void
}

export const ProfileInList = memo(function ProfileInList(props: ProfileInListProps) {
    const { i18n } = useLingui()
    const { classes, cx } = useStyles()
    const { profile, selected, disabled, highlightText, onChange } = props
    const searchWords = useMemo(() => (highlightText ? [highlightText] : EMPTY_LIST), [highlightText])

    const rawPublicKey = profile.linkedPersona?.rawPublicKey
    const primaryText = (() => {
        if (!profile.fromNextID) return `@${profile.identifier.userId || profile.nickname}`
        const mentions = profile.linkedTwitterNames?.map((x) => '@' + x).join(' ') ?? ''
        if (mentions.length < 15) return mentions
        const len = profile.linkedTwitterNames?.length ?? 0
        return truncate(mentions, { length: 15 }) + (len > 1 ? `(${len})` : '')
    })()

    const tooltipTitle = (() => {
        const linkedNames = profile.linkedTwitterNames ?? []
        if (linkedNames.length === 0) return <Trans>The Persona is not connected to any accounts.</Trans>
        if (linkedNames.length === 1)
            return <Trans>The Persona is connected to the account @${profile.identifier.userId}.</Trans>
        const mentions = profile.linkedTwitterNames?.map((username) => '@' + username) ?? []
        const list = new Intl.ListFormat(i18n.locale).format(mentions)
        return <Trans>The Persona is connected to the following accounts: {list}</Trans>
    })()

    const handleClick = useCallback(() => onChange(profile, !selected), [onChange, selected])
    const secondaryText = formatPersonaFingerprint(profile.linkedPersona?.rawPublicKey?.toUpperCase() ?? '', 3)
    return (
        <ListItem
            onClick={handleClick}
            className={cx(classes.root, selected ? classes.highLightBg : null)}
            secondaryAction={
                <Checkbox
                    disabled={disabled}
                    checked={!!selected}
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
                                searchWords={searchWords}
                                autoEscape
                                textToHighlight={primaryText}
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
                            searchWords={searchWords}
                            autoEscape
                            textToHighlight={secondaryText}
                        />
                        {rawPublicKey ?
                            <CopyButton className={classes.actionIcon} size={16} text={rawPublicKey} />
                        :   null}
                        {profile.fromNextID ?
                            <Icons.NextIDMini className={classes.badge} />
                        :   null}
                    </div>
                }
            />
        </ListItem>
    )
})
