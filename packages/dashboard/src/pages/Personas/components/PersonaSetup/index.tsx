import { memo } from 'react'
import { Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { LinkIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 36,
        backgroundColor: MaskColorVar.secondaryBackground,
    },
    button: {
        borderRadius: Number(theme.shape.borderRadius) * 4.5,
        padding: theme.spacing(0.75, 4),
    },
}))
export interface PersonaSetupProps {
    networkIdentifier: string
    onConnect: () => void
}
export const PersonaSetup = memo(({ networkIdentifier, onConnect }: PersonaSetupProps) => {
    const { classes } = useStyles()
    const t = useDashboardI18N()
    return (
        <div className={classes.container}>
            <div className={classes.iconContainer}>
                <LinkIcon color="primary" fontSize="inherit" style={{ fill: 'none' }} viewBox="0 0 36 36" />
            </div>
            <Typography variant="body2" sx={{ marginTop: 2.5, marginBottom: 2.5 }}>
                {t.personas_setup_connect_tips({ type: networkIdentifier.replace('.com', '') })}
            </Typography>
            <Button className={classes.button} onClick={onConnect}>
                {t.personas_setup_connect()}
            </Button>
        </div>
    )
})
