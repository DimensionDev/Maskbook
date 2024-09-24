import { MaskLightTheme, makeStyles } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import { TrendingCard, type TrendingCardProps } from './TrendingCard.js'
import { EmptyStatus } from '@masknet/shared'
import { TrendingViewDescriptor, type TrendingViewDescriptorProps } from './TrendingViewDescriptor.js'
import { Trans } from '@lingui/macro'

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
}))

interface Props extends TrendingCardProps, TrendingViewDescriptorProps {}

export function FailedTrendingView({ result, resultList, setResult, ...rest }: Props) {
    const { classes } = useStyles()
    return (
        <ThemeProvider theme={MaskLightTheme}>
            <TrendingCard {...rest}>
                <div className={classes.content}>
                    <EmptyStatus style={{ height: 'auto', flexGrow: 1 }}>
                        <Trans>Load failed</Trans>
                    </EmptyStatus>
                    <TrendingViewDescriptor result={result} resultList={resultList} setResult={setResult} />
                </div>
            </TrendingCard>
        </ThemeProvider>
    )
}
