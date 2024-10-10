import { makeStyles } from '@masknet/theme'
import { ImageIcon } from '../ImageIcon/index.js'
import type { HTMLProps } from 'react'

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

interface WalletIconProps extends withClasses<'root' | 'mainIcon'>, HTMLProps<HTMLDivElement> {
    size?: number
    badgeSize?: number
    mainIcon?: string
    badgeIcon?: string
    badgeIconBorderColor?: string
    iconFilterColor?: string
}

export function WalletIcon(props: WalletIconProps) {
    const { size = 24, badgeSize = 14, mainIcon, badgeIcon, badgeIconBorderColor, iconFilterColor, ...rest } = props
    const { classes, cx } = useStyles(
        {
            size: Math.max(badgeSize, size),
            badgeIconBorderColor,
        },
        { props: { classes: props.classes } },
    )

    return (
        <div
            {...rest}
            className={cx(classes.root, rest.className)}
            style={{
                height: size,
                width: size,
                ...rest.style,
            }}>
            {mainIcon ?
                <ImageIcon className={classes.mainIcon} size={size} icon={mainIcon} iconFilterColor={iconFilterColor} />
            :   null}
            {badgeIcon ?
                <ImageIcon className={classes.badgeIcon} size={badgeSize} icon={badgeIcon} />
            :   null}
        </div>
    )
}
