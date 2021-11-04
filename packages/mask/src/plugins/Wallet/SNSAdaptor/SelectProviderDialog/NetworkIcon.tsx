import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        icon: {
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: theme.palette.background.paper,
        },
    }
})

export interface NetworkIconProps {
    size?: number
    icon: string
}
export function NetworkIcon({ size = 48, icon }: NetworkIconProps) {
    const { classes } = useStyles()
    return <img height={size} width={size} src={icon} className={classes.icon} />
}
