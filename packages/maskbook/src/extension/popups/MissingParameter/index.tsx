import { Card, CardContent, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils'

export function MissingParameter(props: { message: string }) {
    const { t } = useI18N()
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">{props.message}</Typography>
                <Typography variant="caption">{t('popups_missing_parameter_caption')}</Typography>
            </CardContent>
        </Card>
    )
}
