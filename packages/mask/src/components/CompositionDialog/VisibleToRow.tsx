import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListItemType, PopoverListTrigger, PopoverListTriggerProp } from './PopoverListTrigger'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        fontFamily: 'sans-serif',
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
    const renderScheme = [
        {
            type: PopoverListItemType.All,
            title: t('compose_encrypt_visible_to_all'),
            subTitle: t('compose_encrypt_visible_to_all_sub'),
            personaRequired: false,
            event: null,
        },
        {
            type: PopoverListItemType.Private,
            title: t('compose_encrypt_visible_to_private'),
            subTitle: t('compose_encrypt_visible_to_private_sub'),
            personaRequired: true,
            event: null,
        },
        {
            type: PopoverListItemType.Share,
            title: t('compose_encrypt_visible_to_share'),
            subTitle: t('compose_encrypt_visible_to_share_sub'),
            personaRequired: true,
            event: null,
        },
    ]

    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_visible_to')}</Typography>

            <PopoverListTrigger
                onConnect={props.onConnect}
                onCreate={props.onCreate}
                e2eDisabled={props.e2eDisabled}
                selected={props.selected ?? PopoverListItemType.All}
                renderScheme={renderScheme}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                shareWithNum={props.shareWithNum}
                onChange={props.onChange!}
                toShare={props.toShare}
            />
        </>
    )
}
