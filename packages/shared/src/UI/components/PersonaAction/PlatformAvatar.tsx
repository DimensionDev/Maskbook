import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { PersonaImageIcon } from './PersonaImageIcon.js'
import { memo } from 'react'

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
    networkIcon?: string
    providerIcon?: string
    isBorderColorNotDefault?: boolean
}

export const PlatformAvatar = memo(function PlatformAvatar(props: PlatformAvatarProps) {
    const { size = 24, badgeSize = 14, inverse = false, networkIcon, providerIcon } = props
    const { classes, cx } = useStyles(
        {
            size: Math.max(badgeSize, size),
            isBorderColorNotDefault: props.isBorderColorNotDefault,
        },
        { props },
    )

    // #region icon names
    const names =
        inverse ?
            [cx(classes.badgeIcon, classes.providerIcon), cx(classes.mainIcon, classes.networkIcon)]
        :   [cx(classes.mainIcon, classes.networkIcon), cx(classes.badgeIcon, classes.providerIcon)]
    // #endregion
    return (
        <div
            className={classes.root}
            style={{
                height: size,
                width: size,
            }}>
            {networkIcon ?
                <PersonaImageIcon
                    classes={{
                        icon: names[0],
                    }}
                    size={size}
                    icon={networkIcon}
                />
            :   <Icons.Masks
                    size={size}
                    sx={{
                        display: 'inline-block',
                        borderRadius: '50%',
                    }}
                />
            }
            {providerIcon ?
                <PersonaImageIcon
                    classes={{
                        icon: names[1],
                    }}
                    size={badgeSize}
                    icon={providerIcon}
                />
            :   null}
        </div>
    )
})
