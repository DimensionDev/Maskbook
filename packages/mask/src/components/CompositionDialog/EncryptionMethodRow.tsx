import { useI18N } from '../../utils'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger, PopoverListTriggerProp } from './PopoverListTrigger'
import { useState } from 'react'

const renderScheme = [
    { type: 'text', title: 'Text', subTitle: 'Use text encryption', personaRequired: false, event: null },
    {
        type: 'image',
        title: 'Image',
        subTitle: 'Encrypt messages in images',
        personaRequired: false,
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

export function EncryptionMethodRow(props: Partial<PopoverListTriggerProp>) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_encryption_method')}</Typography>

            <PopoverListTrigger
                onConnect={props.onConnect}
                onCreate={props.onCreate}
                selected={props.selected ?? 'text'}
                renderScheme={renderScheme}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange as any}
            />
        </>
    )
}
