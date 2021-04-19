import { memo } from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import classNames from 'classnames'
import { SettingsIcon } from '@dimensiondev/icons'
import { IconButton, Link, MenuItem, Typography } from '@material-ui/core'
import { useMenu } from '../../../../hooks/useMenu'

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            borderRadius: Number(theme.shape.borderRadius) * 3,
            backgroundColor: MaskColorVar.secondaryBackground,
            display: 'flex',
            padding: theme.spacing(1.25),
        },
        active: {
            backgroundColor: MaskColorVar.primaryBackground,
        },
        status: {
            width: 10,
            height: 10,
            borderRadius: '50%',
            marginRight: theme.spacing(1.25),
            marginTop: theme.spacing(0.625),
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
        },
        content: {
            marginTop: theme.spacing(1.25),
        },
        line: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
        },
        link: {},
    }),
)

export interface PersonaCardProps {
    active: boolean
    nickName?: string
    providers: { userId?: string; internalName: string; network: string; connected?: boolean; onAction?: () => void }[]
}

export const PersonaCard = memo(({ active, nickName, providers }: PersonaCardProps) => {
    const classes = useStyles()
    const t = useDashboardI18N()

    const [menu, openMenu] = useMenu([
        <MenuItem>Edit</MenuItem>,
        <MenuItem style={{ color: MaskColorVar.redMain }}>Delete</MenuItem>,
    ])

    return (
        <div className={classNames(classes.card, { [classes.active]: active })}>
            <div className={classes.status} style={{ backgroundColor: active ? '#77E0B5' : '#A6A9B6' }} />
            <div style={{ flex: 1 }}>
                <div className={classes.header}>
                    <Typography style={{ fontSize: 14 }}>{nickName}</Typography>
                    <IconButton onClick={openMenu} style={{ fontSize: 12, padding: 0 }}>
                        <SettingsIcon fontSize="inherit" style={{ fill: MaskColorVar.textPrimary }} />
                    </IconButton>
                </div>
                <div className={classes.content}>
                    {providers.map((provider) => {
                        return (
                            <div className={classes.line}>
                                <Typography variant="caption">
                                    {provider.userId ?? `Connect to ${provider.internalName}`}
                                </Typography>
                                {provider.connected && (
                                    <Link component="button" variant="caption">
                                        Disconnect
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            {menu}
        </div>
    )
})
