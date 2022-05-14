import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger, PopoverListTriggerProp } from './PopoverListTrigger'
import { useState } from 'react'

const renderScheme = [
    { type: 'all', title: 'All', subTitle: 'Everyone', personaRequired: false, event: null },
    { type: 'private', title: 'Private', subTitle: 'Just Me', personaRequired: true, event: null },
    {
        type: 'share',
        title: 'Share with',
        subTitle: 'Just Selected Contacts',
        personaRequired: true,
        event: null,
    },
]

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
}))

export function VisibleToRow(props: Partial<PopoverListTriggerProp>) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_visible_to')}</Typography>

            <PopoverListTrigger
                onConnect={props.onConnect}
                onCreate={props.onCreate}
                e2eDisabled={props.e2eDisabled}
                selected={props.selected ?? 'all'}
                renderScheme={renderScheme}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                shareWithNum={props.shareWithNum}
                onChange={props.onChange as any}
                toShare={props.toShare}
            />
        </>
    )
}
