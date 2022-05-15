import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger, PopoverListTriggerProp } from './PopoverListTrigger'
import { PopoverListItem } from './PopoverListItem'
import { PropsWithChildren, useState } from 'react'

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

export interface EncryptionMethodSelectorProps extends PropsWithChildren<{}> {
    onChange(v: EncryptionMethodType): void
    selected: EncryptionMethodType
}
export enum EncryptionMethodType {
    Text = 'text',
    Image = 'image',
}
export function EncryptionMethodSelector(props: Partial<EncryptionMethodSelectorProps>) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const renderScheme = [
        {
            type: EncryptionMethodType.Text,
            title: t('compose_encrypt_method_text'),
            subTitle: t('compose_encrypt_method_text_sub_title'),
            personaRequired: false,
            event: null,
        },
        {
            type: EncryptionMethodType.Image,
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
                selected={props.selected ?? EncryptionMethodType.Text}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange!}
                selectedTitle={renderScheme.find((x) => x.type === props.selected)?.title}>
                {PopoverListRender()}
            </PopoverListTrigger>
        </>
    )
}
