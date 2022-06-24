import { makeStyles, MaskAlert } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { Typography } from '@mui/material'
import { Section } from './Section'
import { WarningIcon, WarningTriangleIcon } from '@masknet/icons'
import { SlippageToleranceSelector } from './SlippageToleranceSelector'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        paper: {
            boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
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

    return (
        <div className={classes.root}>
            <Section
                title={t.gas_settings_section_title_slippage_tolerance()}
                additions={
                    <Typography className={classes.additions} component="span">
                        <span className={classes.percentage}>0.1%</span>
                    </Typography>
                }>
                <SlippageToleranceSelector onChange={console.log} />
                <MaskAlert icon={<WarningTriangleIcon />} severity="warning">
                    {t.gas_settings_alert_low_slippage_tolerance()}
                </MaskAlert>
                <MaskAlert icon={<WarningIcon />} severity="error">
                    {t.gas_settings_alert_high_slippage_tolerance({
                        percentage: '23',
                    })}
                </MaskAlert>
            </Section>
        </div>
    )
}
