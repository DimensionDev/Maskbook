import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListItemType, PopoverListTrigger, PopoverListTriggerProp } from './PopoverListTrigger'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
}))

export function EncryptionMethodRow(props: Partial<PopoverListTriggerProp>) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const renderScheme = [
        {
            type: PopoverListItemType.Text,
            title: t('compose_encryp_method_text'),
            subTitle: t('compose_encryp_method_text_sub_title'),
            personaRequired: false,
            event: null,
        },
        {
            type: PopoverListItemType.Image,
            title: t('compose_encryp_method_image'),
            subTitle: t('compose_encryp_method_image_sub_title'),
            personaRequired: false,
            event: null,
        },
    ]

    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_encryption_method')}</Typography>

            <PopoverListTrigger
                onConnect={props.onConnect}
                onCreate={props.onCreate}
                selected={props.selected ?? PopoverListItemType.Text}
                renderScheme={renderScheme}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange!}
            />
        </>
    )
}
