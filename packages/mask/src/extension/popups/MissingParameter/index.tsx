import { Card, CardContent, Typography } from '@mui/material'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'

export function MissingParameter(props: { message: string }) {
    const t = useMaskSharedTrans()
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">{props.message}</Typography>
                <Typography variant="caption">{t.popups_missing_parameter_caption()}</Typography>
            </CardContent>
        </Card>
    )
}
