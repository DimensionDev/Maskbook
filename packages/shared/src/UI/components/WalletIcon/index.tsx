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
        display: 'block',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
    badgeIcon: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        borderRadius: '50%',
    },
    networkIcon: {},
    providerIcon: {},
}))

interface WalletIconProps extends withClasses<'networkIcon' | 'providerIcon'> {
    size?: number
    badgeSize?: number
    networkIcon?: URL
    providerIcon?: URL
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
                        icon: classNames(classes.mainIcon, classes.networkIcon),
                    }}
                    size={size}
                    icon={networkIcon}
                />
            ) : null}
            {providerIcon ? (
                <ImageIcon
                    classes={{
                        icon: classNames(classes.badgeIcon, classes.providerIcon),
                    }}
                    size={badgeSize}
                    icon={providerIcon}
                />
            ) : null}
        </div>
    )
}
