import { makeStyles } from '@masknet/theme'
import { ImageIcon } from '../ImageIcon'

interface StyleProps {
    size: number
    badgeIconBorderColor?: string
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        position: 'relative',
        display: 'flex',
        height: props.size,
        width: props.size,
    },
    mainIcon: {
        display: 'block',
    },
    badgeIcon: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${props.badgeIconBorderColor ?? theme.palette.common.white}`,
        borderRadius: '50%',
    },
}))

interface WalletIconProps {
    size?: number
    badgeSize?: number
    mainIcon?: URL
    badgeIcon?: URL
    badgeIconBorderColor?: string
}

export const WalletIcon = (props: WalletIconProps) => {
    const { size = 24, badgeSize = 14, mainIcon, badgeIcon, badgeIconBorderColor } = props
    const { classes } = useStyles({
        size: badgeSize > size ? badgeSize : size,
        badgeIconBorderColor,
    })

    return (
        <div
            className={classes.root}
            style={{
                height: size,
                width: size,
            }}>
            {mainIcon ? (
                <ImageIcon
                    classes={{
                        icon: classes.mainIcon,
                    }}
                    size={size}
                    icon={mainIcon}
                />
            ) : null}
            {badgeIcon ? (
                <ImageIcon
                    classes={{
                        icon: classes.badgeIcon,
                    }}
                    size={badgeSize}
                    icon={badgeIcon}
                />
            ) : null}
        </div>
    )
}
