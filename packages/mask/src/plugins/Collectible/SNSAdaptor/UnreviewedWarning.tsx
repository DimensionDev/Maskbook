import { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Card, Typography } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { useI18N } from '../../../utils'
import { getMaskColor, makeStyles } from '@masknet/theme'
import AlertIcon from '@mui/icons-material/Error'

const useStyles = makeStyles()((theme) => {
    const warningMain = getMaskColor(theme).warning
    const warningBackground = getMaskColor(theme).warningBackground
    return {
        box: {
            border: `1px solid ${warningMain}`,
            borderRadius: theme.spacing(0.5),
        },
        colorBox: {
            backgroundColor: warningBackground,
            color: warningMain,
        },
        tipTitleBox: {
            display: 'flex',
            alignItems: 'center',
        },
        tipTitle: {
            borderBottom: `1px solid ${warningMain}`,
        },
        tipContent: {
            color: warningMain,
        },
        icon: {
            marginRight: theme.spacing(1.5),
        },
    }
})

export function UnreviewedWarning() {
    const { t } = useI18N()
    const [expand, setExpand] = useState(true)
    const { classes } = useStyles()
    return (
        <Card variant="outlined" className={classes.box}>
            <Accordion
                className={classes.colorBox}
                expanded={expand}
                disableGutters
                square
                onChange={() => setExpand((x) => !x)}>
                <AccordionSummary
                    expandIcon={<ExpandMore className={classes.tipContent} />}
                    className={classes.tipTitle}>
                    <div className={classes.tipTitleBox}>
                        <AlertIcon className={classes.icon} />
                        <Typography>{t('plugin_collectible_not_been_reviewed_by_opensea')}</Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails className={classes.tipContent}>
                    <Typography variant="body2">{t('plugin_collectible_reviewed_tips')}</Typography>
                </AccordionDetails>
            </Accordion>
        </Card>
    )
}
