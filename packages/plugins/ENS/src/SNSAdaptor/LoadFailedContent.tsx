import { Typography, Box } from '@mui/material'
import { ActionButton } from '@masknet/theme'
import useStyles from './useStyles'
import { useI18N } from '../locales'

export function LoadFailedContent({
    retry,
    isLoading = false,
}: {
    retry: (() => void) | undefined
    isLoading: boolean
}) {
    const { classes, cx } = useStyles({})

    const t = useI18N()
    return (
        <Box className={classes.root}>
            <div className={classes.preWrapper}>
                <div className={cx(classes.preContent, classes.loadFailedText)}>
                    <Typography>{t.load_failed()}</Typography>
                    <ActionButton
                        onClick={retry}
                        loading={isLoading}
                        variant="roundedDark"
                        className={classes.reloadButton}>
                        {t.reload()}
                    </ActionButton>
                </div>
            </div>
        </Box>
    )
}
