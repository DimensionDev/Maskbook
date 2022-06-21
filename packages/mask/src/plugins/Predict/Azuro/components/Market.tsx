import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { marketRegistry } from '../helpers'

const useStyles = makeStyles()((theme) => ({
    label: { fontWeight: 300 },
    title: {
        fontWeight: 500,
        color: theme.palette.primary.main,
    },
}))

interface MarketProps {
    marketRegistryId: number
}

export function Market(props: MarketProps) {
    const t = useI18N()
    const { marketRegistryId } = props
    const { classes } = useStyles()

    return (
        <Typography className={classes.label}>
            {t.plugin_market()}:&nbsp;
            <span className={classes.title}>{marketRegistry[marketRegistryId]}</span>
        </Typography>
    )
}
