import { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Card, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'

export interface UnreviewedWarningProps {}

export function UnreviewedWarning(props: UnreviewedWarningProps) {
    const [expand, setExpand] = useState(true)
    return (
        <Card variant="outlined">
            <Accordion expanded={expand} disableGutters square onChange={() => setExpand((x) => !x)}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">This item has not been reviewd by OpenSea.</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="textSecondary" variant="body2">
                        You should proceed with extra caution. Anyone can create a digital item on a blockchain with any
                        name, including fake versions of existing items. Please take extra caution and do your research
                        when interacting with this item to ensure it's what it chaims to be.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Card>
    )
}
