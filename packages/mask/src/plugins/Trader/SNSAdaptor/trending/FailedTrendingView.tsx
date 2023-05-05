import { EmptyStatus } from '@masknet/shared'
import { MaskLightTheme, makeStyles } from '@masknet/theme'
import { Button, ThemeProvider } from '@mui/material'
import { Stack } from '@mui/system'
import { type FC } from 'react'
import { useI18N } from '../../../../utils/index.js'
import { TrendingCard, type TrendingCardProps } from './TrendingCard.js'
import { TrendingViewDescriptor, type TrendingViewDescriptorProps } from './TrendingViewDescriptor.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        padding: theme.spacing(1, 1.5),
        boxSizing: 'border-box',
        height: 202,
        display: 'flex',
        flexDirection: 'column',
    },
    retryButton: {
        marginTop: theme.spacing(1),
        borderRadius: 16,
    },
}))

interface Props extends TrendingCardProps, TrendingViewDescriptorProps {
    onRetry?(): void
}

export const FailedTrendingView: FC<Props> = ({ result, resultList, setResult, onRetry, ...rest }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    return (
        <ThemeProvider theme={MaskLightTheme}>
            <TrendingCard {...rest}>
                <div className={classes.content}>
                    <EmptyStatus style={{ height: 'auto', flexGrow: 1 }}>
                        <Stack direction="column">
                            {t('load_failed')}
                            <Button size="small" className={classes.retryButton} onClick={onRetry}>
                                {t('retry')}
                            </Button>
                        </Stack>
                    </EmptyStatus>
                    <TrendingViewDescriptor
                        result={result}
                        resultList={resultList}
                        setResult={setResult}
                        omitProvider={resultList.length < 2}
                    />
                </div>
            </TrendingCard>
        </ThemeProvider>
    )
}
