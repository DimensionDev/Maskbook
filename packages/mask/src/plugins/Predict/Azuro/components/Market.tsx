import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { marketRegistry } from '../helpers'
import { Event, Markets, Sports } from '../types.js'
import gameTypeRegistry from '../helpers/gameTypeRegistry.js'

const useStyles = makeStyles()((theme) => ({
    label: { fontWeight: 300 },
    title: {
        fontWeight: 500,
        color: theme.palette.primary.main,
    },
}))

interface MarketProps {
    event: Event
}

export function Market(props: Event) {
    const t = useI18N()
    const { classes } = useStyles()
    const { marketRegistryId, sportTypeId, conditions } = props

    return (
        <Typography className={classes.label}>
            <span className={classes.title}>
                {Sports.CSGO === sportTypeId
                    ? Markets.WinnerOfMatch === marketRegistryId && conditions[0].gamePeriodIds
                        ? gameTypeRegistry[conditions[0].gamePeriodIds[0]]
                        : ''
                    : ''}
                {marketRegistry[marketRegistryId]}
            </span>
        </Typography>
    )
}
