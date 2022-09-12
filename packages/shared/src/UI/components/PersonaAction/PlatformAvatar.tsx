import classNames from 'classnames'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { PersonaImageIcon } from './PersonaImageIcon.js'

interface StyleProps {
    size: number
    isBorderColorNotDefault?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        position: 'relative',
        alignSelf: 'center',
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
}))

interface PlatformAvatarProps extends withClasses<'networkIcon' | 'providerIcon'> {
    size?: number
    badgeSize?: number
    inverse?: boolean
    networkIcon?: URL | string
    providerIcon?: URL | string
    isBorderColorNotDefault?: boolean
}

export const PlatformAvatar = (props: PlatformAvatarProps) => {
    const { size = 24, badgeSize = 14, inverse = false, networkIcon, providerIcon } = props
    const classes = useStylesExtends(
        useStyles({
            size: badgeSize > size ? badgeSize : size,
            isBorderColorNotDefault: props.isBorderColorNotDefault,
        }),
        props,
    )

    // #region icon names
    const names = inverse
        ? [classNames(classes.badgeIcon, classes.providerIcon), classNames(classes.mainIcon, classes.networkIcon)]
        : [classNames(classes.mainIcon, classes.networkIcon), classNames(classes.badgeIcon, classes.providerIcon)]
    // #endregion

    return (
        <div
            className={classes.root}
            style={{
                height: size,
                width: size,
            }}>
            {networkIcon ? (
                <PersonaImageIcon
                    classes={{
                        icon: names[0],
                    }}
                    size={size}
                    icon={networkIcon}
                />
            ) : (
                <Icons.Masks
                    size={size}
                    sx={{
                        display: 'inline-block',
                        borderRadius: '50%',
                    }}
                />
            )}
            {providerIcon ? (
                <PersonaImageIcon
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
