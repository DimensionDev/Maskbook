import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { IdeaToken } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        padding: theme.spacing(2),
    },
    svg: {
        display: 'block',
        color: theme.palette.text.primary,
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        position: 'absolute',
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        position: 'absolute',
        fontSize: 15,
    },
    placeholder: {
        paddingTop: theme.spacing(10),
        paddingBottom: theme.spacing(10),
        borderStyle: 'none',
    },
}))

interface PerformanceChartProps {
    ideaToken: IdeaToken
}

export function ChartsView(props: PerformanceChartProps) {
    const { ideaToken } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    return <div>charts view</div>
}
