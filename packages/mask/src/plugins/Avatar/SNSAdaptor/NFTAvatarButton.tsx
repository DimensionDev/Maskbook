import { Icons } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useI18N } from '../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        color: theme.palette.text.primary,
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.main,
    },
    setIcon: {
        width: 14,
        height: 14,
        marginLeft: 2,
    },
    icon: {
        color: theme.palette.text.buttonText,
    },
}))

export interface NFTAvatarButtonProps extends withClasses<'root' | 'text'> {
    onClick: () => void
    showSetting?: boolean
}

export function NFTAvatarButton(props: NFTAvatarButtonProps) {
    const { onClick } = props
    const { t } = useI18N()
    const { classes } = useStylesExtends(useStyles(), props)

    return (
        <div className={classes.root} onClick={onClick}>
            <Icons.Avatar className={classes.icon} size={20} />
            <Stack display="inline-flex" gap={1}>
                <Typography fontSize={14} style={{ marginLeft: 4 }} className={classes.text}>
                    {t('nft_avatar')}
                </Typography>
                {props.showSetting ? <Icons.GearSettings className={classes.setIcon} /> : null}
            </Stack>
        </div>
    )
}
