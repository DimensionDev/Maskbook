import { makeStyles } from '@masknet/theme'
import { Stack, Typography, Button } from '@mui/material'
import { useI18N } from '../../../utils/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            padding: theme.spacing(1, 2, 2, 2),
            minHeight: 148,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

interface ErrorPanelProps {
    onRetry(): void
}

export function ErrorPanel({ onRetry }: ErrorPanelProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <Stack className={classes.root} justifyContent="center" height="100%">
            <Stack justifyContent="center" height="100%" gap={1.5} alignItems="center">
                <Typography fontSize={12} fontWeight={700}>
                    {t('persona_load_failed')}
                </Typography>
                <Button variant="roundedContained" color="primary" sx={{ minWidth: 88 }} size="small" onClick={onRetry}>
                    {t('reload')}
                </Button>
            </Stack>
        </Stack>
    )
}
