import { Grid, Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import type { FungibleTokenDetailed } from '../../types'

import { FarmTokenDetailed } from './FarmTokenDetailed'

import { useStylesAccordion } from '../styles'

export interface AccordionFarmProps extends React.PropsWithChildren<{}> {
    rewardToken?: FungibleTokenDetailed
    referredToken?: FungibleTokenDetailed
    totalValue: number
}

export function AccordionFarm({ rewardToken, referredToken, totalValue, children }: AccordionFarmProps) {
    const { classes } = useStylesAccordion()

    return (
        <Accordion className={classes.accordion}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                classes={{
                    root: classes.accordionSummary,
                    content: classes.accordionSummaryContent,
                }}>
                <Grid container className={classes.container}>
                    <Grid item xs={8}>
                        <FarmTokenDetailed token={referredToken} />
                    </Grid>
                    <Grid item xs={4} display="flex" alignItems="center">
                        {Number.parseFloat(totalValue.toFixed(5))} {rewardToken?.symbol || '-'}
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>{children}</AccordionDetails>
        </Accordion>
    )
}
