import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger } from './PopoverListTrigger'
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
    method: EncryptionMethodType
}
export enum EncryptionMethodType {
    Text = 'text',
    Image = 'image',
}
export function EncryptionMethodSelector(props: EncryptionMethodSelectorProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_encryption_method')}</Typography>
            <PopoverListTrigger
                selected={props.method ?? EncryptionMethodType.Text}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange}
                selectedTitle={
                    props.method === EncryptionMethodType.Text
                        ? t('compose_encrypt_method_text')
                        : t('compose_encrypt_method_image')
                }>
                <PopoverListItem
                    value={EncryptionMethodType.Text}
                    title={t('compose_encrypt_method_text')}
                    subTitle={t('compose_encrypt_method_text_sub_title')}
                />
                <PopoverListItem
                    showDivider
                    value={EncryptionMethodType.Image}
                    title={t('compose_encrypt_method_image')}
                    subTitle={t('compose_encrypt_method_image_sub_title')}
                />
            </PopoverListTrigger>
        </>
    )
}
