import { Typography, Box } from '@mui/material'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useI18N } from '../locales'
import { ENSPostExtraInfoWrapper } from './ENSPostExtraInfoWrapper'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme) => {
    return {
        root: {
            padding: theme.spacing(0, 2),
        },
        preWrapper: {
            flexGrow: 1,
            width: '100%',
            height: 148,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        preContent: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 14,
        },
        loadFailedText: {
            color: theme.palette.maskColor.danger,
            fontSize: 14,
        },
        reloadButton: {
            width: 254,
            marginTop: 26,
        },
    }
})

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
        <ENSPostExtraInfoWrapper>
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
        </ENSPostExtraInfoWrapper>
    )
}
