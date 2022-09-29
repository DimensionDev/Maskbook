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
        border: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        color: theme.palette.text.primary,
        cursor: 'pointer',
        background: theme.palette.maskColor.main,
    },
    setIcon: {
        width: 14,
        height: 14,
        marginLeft: 2,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 4,
    },
    icon: {
        color: theme.palette.text.buttonText,
    },
}))

interface NFTAvatarButtonProps extends withClasses<'root' | 'text'> {
    onClick: () => void
    showSetting?: boolean
}

export function NFTAvatarButton(props: NFTAvatarButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { onClick } = props
    const { t } = useI18N()

    return (
        <div className={classes.root} onClick={onClick}>
            <Icons.Avatar className={classes.icon} size={20} />
            <Stack display="inline-flex" gap={1}>
                <Typography
                    fontSize={14}
                    style={{ marginLeft: 4 }}
                    fontWeight={500}
                    color={(t) => t.palette.text.buttonText}>
                    {t('nft_avatar')}
                </Typography>
                {props.showSetting ? <Icons.GearSettings className={classes.setIcon} /> : null}
            </Stack>
        </div>
    )
}
