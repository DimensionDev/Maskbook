import { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Card, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import { useI18N } from '../../../utils'

export function UnreviewedWarning() {
    const { t } = useI18N()
    const [expand, setExpand] = useState(true)
    return (
        <Card variant="outlined">
            <Accordion expanded={expand} disableGutters square onChange={() => setExpand((x) => !x)}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">{t('plugin_collectible_not_been_reviewed_by_opensea')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="textSecondary" variant="body2">
                        {t('plugin_collectible_reviewed_tips')}
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Card>
    )
}
