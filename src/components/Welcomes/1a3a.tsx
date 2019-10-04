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
import { useIsolatedChooseIdentity } from '../shared/ChooseIdentity'
import { PersonIdentifier } from '../../database/type'

interface Props {
    next(): void
    onGenerateKey(password: string): void
    onRestoreByMnemonicWord(mnemonicWord: string, password: string): void
    onConnectOtherPerson(target: PersonIdentifier): void
    generatedMnemonicWord: string | null
    availableIdentityCount: number
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
enum Panels {
    CreateNew = 1,
    RecoverOld,
    ConnectOthers,
}
export default function Welcome(props: Props) {
    const classes = useStyles()
    const [expanded, setExpanded] = React.useState<number | false>(false)

    const [password, setPassword] = React.useState('')

    const [recMnemonicWord, setMnemonicWord] = React.useState('')
    const [password2, setPassword2] = React.useState('')

    const [selectingPerson, ChooseIdentityJSX] = useIsolatedChooseIdentity()

    const handleChange = (panel: Panels) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false)
    }

    const creatNewPanel = (
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
                {props.generatedMnemonicWord === null && (
                    <TextField
                        label={geti18nString('welcome_1a3a_generate_new_key_password_label')}
                        fullWidth
                        value={password}
                        onChange={v => setPassword(v.currentTarget.value)}
                        variant="standard"
                        helperText={geti18nString('welcome_1a3a_generate_new_key_password_label')}
                    />
                )}
                <br />
                {props.generatedMnemonicWord && (
                    <TextField
                        label={geti18nString('welcome_1a3a_generate_new_key_result')}
                        InputProps={{
                            readOnly: true,
                        }}
                        fullWidth
                        value={props.generatedMnemonicWord}
                        multiline
                        variant="standard"
                        rowsMax="4"
                        helperText={geti18nString('welcome_1a3a_generate_new_key_result_help')}
                    />
                )}
                {props.generatedMnemonicWord === null && (
                    <ExpansionPanelActions>
                        <Button size="small" color="default" onClick={() => props.onGenerateKey(password)}>
                            {geti18nString('welcome_1a3a_generate_new_key')}
                        </Button>
                    </ExpansionPanelActions>
                )}
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
    const reusePanel = (
        <ExpansionPanel
            disabled={props.availableIdentityCount === 0}
            expanded={expanded === Panels.ConnectOthers}
            onChange={handleChange(Panels.ConnectOthers)}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{geti18nString('welcome_1a3a_connect_title')}</Typography>
                <Typography className={classes.secondaryHeading}>
                    {geti18nString('welcome_1a3a_connect_subtitle')}
                </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>{ChooseIdentityJSX}</ExpansionPanelDetails>
        </ExpansionPanel>
    )
    const recoverPanel = (
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
                    value={recMnemonicWord}
                    onChange={e => setMnemonicWord(e.currentTarget.value)}
                    multiline
                    variant="standard"
                    rowsMax="4"
                />
                <br />
                <TextField
                    label={geti18nString('welcome_1a3a_recover_input_password')}
                    fullWidth
                    value={password2}
                    onChange={e => setPassword2(e.currentTarget.value)}
                    variant="standard"
                />
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
    return (
        <WelcomeContainer className={classes.paper}>
            <CardContent>
                <Typography variant="h5">{geti18nString('welcome_1a3a_title')}</Typography>
                <br />
                <div className={classes.panelRoot}>
                    {creatNewPanel}
                    {props.generatedMnemonicWord === null && reusePanel}
                    {props.generatedMnemonicWord === null && recoverPanel}
                </div>
                <br />
                <Button
                    disabled={
                        expanded === false ||
                        (expanded === Panels.RecoverOld && recMnemonicWord.length < 12) ||
                        (expanded === Panels.CreateNew && props.generatedMnemonicWord === null) ||
                        (expanded === Panels.ConnectOthers && selectingPerson === null)
                    }
                    onClick={
                        expanded === Panels.RecoverOld
                            ? () => props.onRestoreByMnemonicWord(recMnemonicWord, password2)
                            : expanded === Panels.ConnectOthers
                            ? () => props.onConnectOtherPerson(selectingPerson!.identifier)
                            : props.next
                    }
                    variant="contained"
                    color="primary"
                    className={classes.button}>
                    {geti18nString('welcome_1a1_next')}
                </Button>
            </CardContent>
        </WelcomeContainer>
    )
}
