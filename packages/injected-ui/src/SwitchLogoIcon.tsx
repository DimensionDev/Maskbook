import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()(() => ({
    switchIcon: {
        position: 'absolute',
        display: 'flex',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
    },
    iconBox: {
        position: 'relative',
        flex: 1,
    },
    icon: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        width: 20,
        height: 20,
    },
    hover: {
        opacity: 0,
        '&:hover': {
            opacity: 1,
        },
    },
    hidden: {
        opacity: 0,
    },
}))

export interface SwitchLogoIconProps {
    /** Hides the click target (the SwitchLogo plugin is minimal-mode for this account). */
    minimal?: boolean
    onClick?: () => void
}

/**
 * The small click target overlaid on top of X's own logo that opens the switch-logo dialog.
 * Pure UI: the actual logo swap is an imperative DOM mutation against the live page and stays in
 * the container, see packages/plugins/SwitchLogo/src/SiteAdaptor/SwitchLogoButton.tsx.
 */
export function SwitchLogoIcon({ minimal, onClick }: SwitchLogoIconProps) {
    const { classes, cx } = useStyles()
    return (
        <div className={classes.switchIcon}>
            <div className={cx(classes.iconBox, minimal ? classes.hidden : classes.hover)}>
                <Icons.SwitchLogo className={classes.icon} onClickCapture={onClick} />
            </div>
        </div>
    )
}
