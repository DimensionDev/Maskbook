import { makeStyles } from '@masknet/theme'
import { ImageIcon } from '..'

const useStyles = makeStyles()({
    root: {
        position: 'relative',
        display: 'flex',
    },
    mainIcon: {
        width: '100%',
        height: '100%',
    },
    badgeIcon: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#ffffff',
        borderRadius: '50%',
    },
})

interface WalletIconProps {
    size?: number
    badgeSize?: number
    networkIcon: string
    providerIcon: string
}

export const WalletIcon = ({ size = 24, badgeSize = 14, networkIcon, providerIcon }: WalletIconProps) => {
    const { classes } = useStyles()
    return (
        <div
            className={classes.root}
            style={{
                height: size,
                width: size,
            }}>
            <ImageIcon classes={{ icon: classes.mainIcon }} size={size} icon={networkIcon} />
            <ImageIcon classes={{ icon: classes.badgeIcon }} size={badgeSize} icon={providerIcon} />
        </div>
    )
}
