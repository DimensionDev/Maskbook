import { makeStyles, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useGrant } from '../hooks/useGrant'

const useStyles = makeStyles((theme) => createStyles({}))

interface PreviewCardProps {
    id: string
    onRequest(): void
}

export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { value: grant, error, loading } = useGrant(props.id)

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>ERROR</h1>
    if (!grant) return null

    return <h1>Grant</h1>
}
