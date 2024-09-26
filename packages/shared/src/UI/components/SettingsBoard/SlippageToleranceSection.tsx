import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { formatBalance, multipliedBy } from '@masknet/web3-shared-base'
import { Section } from './Section.js'
import { SlippageToleranceForm } from './SlippageToleranceForm.js'
import { SettingsContext } from './Context.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        additions: {
            fontWeight: 700,
        },
        percentage: {},
    }
})

export function SlippageToleranceSection() {
    const { classes } = useStyles()
    const { DEFAULT_SLIPPAGE_TOLERANCES, slippageTolerance, setSlippageTolerance } = SettingsContext.useContainer()

    return (
        <div className={classes.root}>
            <Section
                title={<Trans>Slippage Tolerance</Trans>}
                additions={
                    <Typography className={classes.additions} component="span">
                        <span className={classes.percentage}>
                            {formatBalance(multipliedBy(slippageTolerance, 100), 2, { significant: 2 })}%
                        </span>
                    </Typography>
                }>
                <SlippageToleranceForm
                    slippageTolerance={slippageTolerance}
                    slippageTolerances={DEFAULT_SLIPPAGE_TOLERANCES}
                    onChange={(data) => {
                        setSlippageTolerance(data ? Number.parseFloat(data.customSlippageTolerance) : 0)
                    }}
                />
            </Section>
        </div>
    )
}
