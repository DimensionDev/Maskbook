import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger, PopoverListTriggerProp } from './PopoverListTrigger'
import { PopoverListItem, PopoverListItemType } from './PopoverListItem'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        fontFamily: 'sans-serif',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    rightIcon: {
        marginLeft: 'auto',
    },
}))

export function EncryptionMethodRow(props: Partial<PopoverListTriggerProp>) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const renderScheme = [
        {
            type: PopoverListItemType.Text,
            title: t('compose_encrypt_method_text'),
            subTitle: t('compose_encrypt_method_text_sub_title'),
            personaRequired: false,
            event: null,
        },
        {
            type: PopoverListItemType.Image,
            title: t('compose_encrypt_method_image'),
            subTitle: t('compose_encrypt_method_image_sub_title'),
            personaRequired: false,
            event: null,
        },
    ]

    const PopoverListRender = () => {
        return (
            <>
                {renderScheme.map((x, idx) => {
                    return (
                        <div key={x.type + idx}>
                            <PopoverListItem
                                showDivider={idx < renderScheme.length - 1}
                                value={x.type}
                                title={x.title}
                                subTitle={x.subTitle}
                            />
                        </div>
                    )
                })}
            </>
        )
    }

    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_encryption_method')}</Typography>

            <PopoverListTrigger
                selected={props.selected ?? PopoverListItemType.Text}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange!}
                selectedTitle={renderScheme.find((x) => x.type === props.selected)?.title}>
                {PopoverListRender()}
            </PopoverListTrigger>
        </>
    )
}
