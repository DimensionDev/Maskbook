import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger } from './PopoverListTrigger.js'
import { PopoverListItem } from './PopoverListItem.js'
import { type PropsWithChildren, useState } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        fontFamily: 'sans-serif',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    divider: {
        width: '100%',
        height: 1,
        background: theme.palette.divider,
        margin: '8px 0',
    },
}))

interface EncryptionMethodSelectorProps extends PropsWithChildren {
    onChange(v: EncryptionMethodType): void
    method: EncryptionMethodType
    textDisabled: boolean
    imageDisabled: boolean
}
export enum EncryptionMethodType {
    Text = 'text',
    Image = 'image',
}
export function EncryptionMethodSelector(props: EncryptionMethodSelectorProps) {
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const encryptMethod = props.method === EncryptionMethodType.Image ? 'image' : 'text'
    return (
        <>
            <Typography className={classes.optionTitle}>
                <Trans>Encryption Method</Trans>
            </Typography>
            <PopoverListTrigger
                selected={props.method ?? EncryptionMethodType.Text}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange}
                selectedTitle={props.method === EncryptionMethodType.Text ? <Trans>Text</Trans> : <Trans>Image</Trans>}>
                <PopoverListItem
                    value={EncryptionMethodType.Text}
                    title={<Trans>Text</Trans>}
                    subTitle={<Trans>Use text encryption</Trans>}
                    disabled={props.textDisabled}
                />
                <div className={classes.divider} />
                <PopoverListItem
                    value={EncryptionMethodType.Image}
                    title={<Trans>Image</Trans>}
                    subTitle={<Trans>Encrypt the message in an image</Trans>}
                    disabled={props.imageDisabled}
                />
            </PopoverListTrigger>
        </>
    )
}
