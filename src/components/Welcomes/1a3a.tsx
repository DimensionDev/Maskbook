import * as React from 'react'
import { geti18nString } from '../../utils/i18n'
import {
    Typography,
    Button,
    makeStyles,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    ExpansionPanelActions,
    CardContent,
    TextField,
} from '@material-ui/core'
import WelcomeContainer from './WelcomeContainer'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { ChooseIdentity } from '../shared/ChooseIdentity'

interface Props {
    next(): void
}
const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 1rem 1rem 1rem',
        textAlign: 'center',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
        background: theme.palette.background.default,
    },
    button: {
        minWidth: 180,
    },
    panelRoot: {
        width: '100%',
        textAlign: 'start',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '40%',
        paddingRight: theme.typography.pxToRem(6),
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}))
export default function Welcome({ next }: Props) {
    const classes = useStyles()
    return (
        <WelcomeContainer className={classes.paper}>
            <CardContent>
                <Typography variant="h5">{geti18nString('welcome_1a3a_title')}</Typography>
                <br />
                <ControlledExpansionPanels />
                <br />
                <Button onClick={next} variant="contained" color="primary" className={classes.button}>
                    {geti18nString('welcome_1a1_next')}
                </Button>
            </CardContent>
        </WelcomeContainer>
    )
}
enum Panels {
    CreateNew = 1,
    RecoverOld,
    ConnectOthers,
}
function ControlledExpansionPanels() {
    const classes = useStyles()
    const [expanded, setExpanded] = React.useState<number | false>(false)

    const handleChange = (panel: Panels) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false)
    }

    return (
        <div className={classes.panelRoot}>
            <ExpansionPanel expanded={expanded === Panels.CreateNew} onChange={handleChange(Panels.CreateNew)}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className={classes.heading}>
                        {geti18nString('welcome_1a3a_generate_new_key_title')}
                    </Typography>
                    <Typography className={classes.secondaryHeading}>
                        {geti18nString('welcome_1a3a_generate_new_key_subtitle')}
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                    <TextField
                        label={geti18nString('welcome_1a3a_generate_new_key_password_label')}
                        fullWidth
                        value="let me in"
                        variant="standard"
                        helperText={geti18nString('welcome_1a3a_generate_new_key_password_label')}
                    />
                    <br />
                    <TextField
                        label={geti18nString('welcome_1a3a_generate_new_key_result')}
                        InputProps={{
                            readOnly: true,
                        }}
                        fullWidth
                        value="bleak version runway tell hour unfold donkey defy digital abuse glide please omit much cement sea sweet tenant demise taste emerge inject cause link"
                        multiline
                        variant="standard"
                        rowsMax="4"
                        helperText={geti18nString('welcome_1a3a_generate_new_key_result_help')}
                    />
                    <ExpansionPanelActions>
                        <Button size="small" color="default">
                            {geti18nString('welcome_1a3a_generate_new_key')}
                        </Button>
                    </ExpansionPanelActions>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === Panels.ConnectOthers} onChange={handleChange(Panels.ConnectOthers)}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className={classes.heading}>{geti18nString('welcome_1a3a_connect_title')}</Typography>
                    <Typography className={classes.secondaryHeading}>
                        {geti18nString('welcome_1a3a_connect_subtitle')}
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <ChooseIdentity />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === Panels.RecoverOld} onChange={handleChange(Panels.RecoverOld)}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className={classes.heading}>{geti18nString('welcome_1a3a_recover_title')}</Typography>
                    <Typography className={classes.secondaryHeading}>
                        {geti18nString('welcome_1a3a_recover_subtitle')}
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                    <TextField
                        label={geti18nString('welcome_1a3a_recover_input_word')}
                        fullWidth
                        value="bleak version"
                        multiline
                        variant="standard"
                        rowsMax="4"
                    />
                    <br />
                    <TextField
                        label={geti18nString('welcome_1a3a_recover_input_password')}
                        fullWidth
                        value="let me in"
                        variant="standard"
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </div>
    )
}
