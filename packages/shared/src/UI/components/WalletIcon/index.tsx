import classNames from 'classnames'
import { makeStyles, useStylesExtends } from '@masknet/theme'
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
        right: -2,
        bottom: -2,
    },
    networkIcon: {},
    providerIcon: {},
}))

interface WalletIconProps extends withClasses<'networkIcon' | 'providerIcon'> {
    size?: number
    badgeSize?: number
    inverse?: boolean
    networkIcon?: URL
    providerIcon?: URL
}

export const WalletIcon = (props: WalletIconProps) => {
    const { size = 24, badgeSize = 14, inverse = false, networkIcon, providerIcon } = props
    const classes = useStylesExtends(useStyles({ size: badgeSize > size ? badgeSize : size }), props)

    //#region icon names
    const names = [
        classNames(classes.mainIcon, classes.networkIcon),
        classNames(classes.badgeIcon, classes.providerIcon),
    ]
    if (inverse) names.reverse()
    //#endregion

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
                        icon: names[0],
                    }}
                    size={size}
                    icon={networkIcon}
                />
            ) : null}
            {providerIcon ? (
                <ImageIcon
                    classes={{
                        icon: names[1],
                    }}
                    size={badgeSize}
                    icon={providerIcon}
                />
            ) : null}
        </div>
    )
}
