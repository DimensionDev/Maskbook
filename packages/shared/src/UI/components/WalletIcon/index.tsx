import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { ImageIcon } from '..'
import { useStylesExtends } from '../..'

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
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
    networkIcon: {},
    providerIcon: {},
    badgeIcon: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#ffffff',
        borderRadius: '50%',
    },
}))

interface WalletIconProps extends withClasses<'networkIcon' | 'providerIcon'> {
    size?: number
    badgeSize?: number
    networkIcon?: string
    providerIcon?: string
}

export const WalletIcon = (props: WalletIconProps) => {
    const { size = 24, badgeSize = 14, networkIcon, providerIcon } = props
    const classes = useStylesExtends(useStyles({ size: badgeSize > size ? badgeSize : size }), props)

    return (
        <div
            className={classes.root}
            style={{
                height: size,
                width: size,
            }}>
            {networkIcon ? (
                <ImageIcon
                    classes={{
                        icon: classNames(badgeSize > size ? classes.badgeIcon : classes.mainIcon, classes.networkIcon),
                    }}
                    size={size}
                    icon={networkIcon}
                />
            ) : null}
            {providerIcon ? (
                <ImageIcon
                    classes={{
                        icon: classNames(badgeSize > size ? classes.mainIcon : classes.badgeIcon, classes.providerIcon),
                    }}
                    size={badgeSize}
                    icon={providerIcon}
                />
            ) : null}
        </div>
    )
}
