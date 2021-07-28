import { FC, useState } from 'react'
import {
    Alert,
    Button,
    Box,
    Card,
    Checkbox,
    FormControlLabel,
    makeStyles,
    useTheme,
    TextField,
    Typography,
} from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import { useI18N } from '../../locales'
import { WALLET_NAME_MAX_LEN } from '../..'

const useStyles = makeStyles((theme) => ({
    top: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(2, 0, 1),
    },
    bottom: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(4, 0, 0),
    },
    input: {
        width: '100%',
    },
    card: {
        position: 'relative',
        minHeight: 140,
        display: 'flex',
        flexFlow: 'row wrap',
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
    },
    cardButton: {
        padding: theme.spacing(1, 2, 3),
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.grey[50],
    },
    cardTextfield: {
        justifyContent: 'space-between',
    },
    word: {
        width: 101,
        minWidth: 101,
        whiteSpace: 'nowrap',
        marginTop: theme.spacing(2),
    },
    wordButton: {
        backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : theme.palette.common.white,
    },
    confirmation: {
        fontSize: 12,
        lineHeight: 1.75,
    },
    warning: {
        marginTop: theme.spacing(2),
    },
}))

interface StepStepNameAndWordsProps {
    name: string
    words: string[]
    onNameChange: (name: string) => void
    onRefreshWords: () => void
    onSubmit: () => void
}

export const StepNameAndWords: FC<StepStepNameAndWordsProps> = ({
    name,
    words,
    onNameChange,
    onRefreshWords,
    onSubmit,
}) => {
    const classes = useStyles()
    const theme = useTheme()
    const t = useI18N()
    const [confirmed, setConfirmed] = useState(false)
    return (
        <Box>
            <Box>
                <TextField
                    className={classes.input}
                    helperText={
                        name.length > WALLET_NAME_MAX_LEN
                            ? t.input_length_exceed_prompt({
                                  name: t.wallet_name().toLowerCase(),
                                  length: String(WALLET_NAME_MAX_LEN),
                              })
                            : undefined
                    }
                    required
                    autoFocus
                    label={t.wallet_name()}
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    variant="outlined"
                />
                <Box className={classes.top}>
                    <Typography variant="body1">Mnemonic</Typography>
                    <Button startIcon={<RefreshIcon />} onClick={onRefreshWords}>
                        {t.refresh_mnemonic()}
                    </Button>
                </Box>
                <Card
                    className={[classes.card, classes.cardButton].join(' ')}
                    elevation={0}
                    variant={theme.palette.mode === 'dark' ? 'outlined' : 'elevation'}>
                    {words.map((word, i) => (
                        <Button className={[classes.word, classes.wordButton].join('  ')} key={i} variant="text">
                            {word}
                        </Button>
                    ))}
                </Card>
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        color="primary"
                        checked={confirmed}
                        onChange={() => setConfirmed((confirmed) => !confirmed)}
                    />
                }
                label={
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'flex-start',
                        }}>
                        <Typography className={classes.confirmation} variant="body2">
                            I have securely written down my mnemonic word, I understand that lost mnemonic word cannot
                            be recovered.
                        </Typography>
                    </Box>
                }
            />
            <Box className={classes.bottom}>
                <Button variant="contained" fullWidth disabled={!name || !confirmed} onClick={onSubmit}>
                    {t.wallet_setup_create()}
                </Button>
            </Box>
            <Box className={classes.warning}>
                <Alert severity="info" color="warning">
                    Please properly back up your account’s mnemonic words.
                </Alert>
            </Box>
        </Box>
    )
}
