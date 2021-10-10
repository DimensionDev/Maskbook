import { GearSettingsIcon } from '@masknet/icons'
import { useStylesExtends } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        border: '1px solid',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        color: theme.palette.mode === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
        marginRight: theme.spacing(0.5),
        marginBottom: theme.spacing(1),
    },
    icon: {
        width: 14,
        heigth: 14,
        marginLeft: 2,
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
            {`🔥${t('nft_avatar')}`} <GearSettingsIcon className={classes.icon} />
        </div>
    )
}
