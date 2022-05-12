import { makeStyles } from '@masknet/theme'
import { ImageIcon } from '../ImageIcon'

interface StyleProps {
    size: number
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
        width: '100%',
        height: '100%',
    },
    badgeIcon: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${theme.palette.background.default}`,
        borderRadius: '50%',
    },
}))

interface WalletIconProps {
    size?: number
    badgeSize?: number
    mainIcon?: URL
    badgeIcon?: URL
}

export const WalletIcon = (props: WalletIconProps) => {
    const { size = 24, badgeSize = 14, mainIcon, badgeIcon } = props
    const { classes } = useStyles({
        size: badgeSize > size ? badgeSize : size,
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
