import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { getUrl } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'

interface Props {
    next(): void
}
export default withStylesTyped(theme =>
    createStyles({
        paper: {
            padding: '2rem 1rem 1rem 1rem',
            textAlign: 'center',
            width: 600,
            boxSizing: 'border-box',
            '& > *': {
                marginBottom: theme.spacing.unit * 3,
            },
        },
        button: {
            minWidth: 180,
        },
        img: {
            border: '1px solid #ddd',
            borderRadius: 5,
        },
    }),
)<Props>(function Welcome({ classes, next }) {
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_1a2_title')}</Typography>
            <img
                alt={geti18nString('welcome_1a2_imgalt')}
                src={getUrl(require('./1a2.jpg'))}
                width="75%"
                className={classes.img}
            />
            <Typography variant="subtitle1">{geti18nString('welcome_1a2_description')}</Typography>
            <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                {geti18nString('welcome_1a2_done_button')}
            </Button>
        </Paper>
    )
})
