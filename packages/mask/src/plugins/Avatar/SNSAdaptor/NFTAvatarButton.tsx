import { GearSettingsIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../../utils'
import { ApplicationSmallIcon } from '../assets/applicationsmall'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        border: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        // backgroundColor: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        // color: theme.palette.mode === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
        color: theme.palette.text.primary,
        cursor: 'pointer',
        width: 106,
        height: 36,
    },
    icon: {
        width: 14,
        height: 14,
        marginLeft: 2,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
    },
}))

interface NFTAvatarButtonProps extends withClasses<'root'> {
    onClick: () => void
    showSetting?: boolean
}

export function NFTAvatarButton(props: NFTAvatarButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { onClick } = props
    const { t } = useI18N()

    return (
        <div className={classes.root} onClick={onClick}>
            <ApplicationSmallIcon />
            <Typography variant="body1" className={classes.text}>
                <span style={{ marginLeft: 4, fontFamily: 'Roboto', fontWeight: 600 }}>{t('nft_avatar')}</span>
                {props.showSetting ? <GearSettingsIcon className={classes.icon} /> : null}
            </Typography>
        </div>
    )
}
