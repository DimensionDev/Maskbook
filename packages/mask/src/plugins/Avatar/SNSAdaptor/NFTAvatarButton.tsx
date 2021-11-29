import { GearSettingsIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        border: '1px solid',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        color: theme.palette.mode === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
        cursor: 'pointer',
    },
    icon: {
        width: 14,
        height: 14,
        marginLeft: 2,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
    },
}))

interface NFTAvatarButtonProps extends withClasses<'root'> {
    onClick: () => void
}

export function NFTAvatarButton(props: NFTAvatarButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { onClick } = props
    const { t } = useI18N()

    return (
        <div className={classes.root} onClick={onClick}>
            <Typography variant="body1" className={classes.text}>
                {`🔥${t('nft_avatar')}`} <GearSettingsIcon className={classes.icon} />
            </Typography>
        </div>
    )
}
