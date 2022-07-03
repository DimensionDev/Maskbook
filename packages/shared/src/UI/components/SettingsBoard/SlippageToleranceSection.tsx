import { makeStyles } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { Typography } from '@mui/material'
import { formatBalance, multipliedBy } from '@masknet/web3-shared-base'
import { Section } from './Section'
import { SlippageToleranceForm } from './SlippageToleranceForm'
import { SettingsContext } from './Context'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        paper: {
            boxShadow: `0px 0px 20px 0px ${theme.palette.mode === 'dark' ? '#FFFFFF1F' : '#0000000D'}`,
            backdropFilter: 'blur(16px)',
            marginTop: theme.spacing(1),
        },
        additions: {
            fontWeight: 700,
        },
        percentage: {},
        warning: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(1.5),
            backgroundColor: 'rgba(255, 177, 0, 0.1)',
        },
        warningMessage: {
            fontWeight: 400,
            color: '#FFB100',
            padding: 0,
        },
    }
})

export interface SlippageToleranceSectionProps {}

export function SlippageToleranceSection(props: SlippageToleranceSectionProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { DEFAULT_SLIPPAGE_TOLERANCES, slippageTolerance, setSlippageTolerance } = SettingsContext.useContainer()

    const percentage = formatBalance(multipliedBy(slippageTolerance, 100), 2, 2)

    return (
        <div className={classes.root}>
            <Section
                title={t.gas_settings_section_title_slippage_tolerance()}
                additions={
                    <Typography className={classes.additions} component="span">
                        <span className={classes.percentage}>{percentage}%</span>
                    </Typography>
                }>
                <SlippageToleranceForm
                    slippageTolerances={DEFAULT_SLIPPAGE_TOLERANCES}
                    onChange={(data) => {
                        setSlippageTolerance(data ? Number.parseFloat(data.customSlippageTolerance) : 0)
                    }}
                />
            </Section>
        </div>
    )
}
