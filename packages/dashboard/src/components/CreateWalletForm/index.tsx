import {
    FormControl,
    ListItemIcon,
    MenuItem,
    Select,
    experimentalStyled as styled,
    Typography,
    makeStyles,
    FilledInput,
} from '@material-ui/core'
import { useCallback, useState } from 'react'
import { useDashboardI18N } from '../../locales'

const useStyles = makeStyles((theme) => ({
    root: {
        // TODO: mobile
        width: 380,
        marginTop: theme.spacing(1.5),
    },
    input: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    filled: {
        display: 'flex',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}))

// TODO: actions, and icon may be an img url
export interface CreateWalletFormProps {
    options: { label: string; icon: React.ReactNode; value: number }[]
}

export function CreateWalletForm(props: CreateWalletFormProps) {
    const { options } = props
    const classes = useStyles()
    const [selected, setSelected] = useState()

    const t = useDashboardI18N()

    return (
        <Container>
            <FormContainer variant="standard">
                <Select
                    classes={{ filled: classes.filled }}
                    variant="filled"
                    value={selected}
                    onChange={useCallback((event) => setSelected(event.target.value), [])}>
                    {options.map(({ label, icon, value }) => (
                        <MenuItem value={value} key={label}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <Typography variant="inherit">{label}</Typography>
                        </MenuItem>
                    ))}
                </Select>
            </FormContainer>

            <FilledInput
                classes={{ root: classes.root, input: classes.input }}
                placeholder={t.wallets_create_wallet_input_placeholder()}
            />
        </Container>
    )
}

const Container = styled('div')`
    display: flex;
    flex-direction: column;
`

const FormContainer = styled(FormControl)`
    // TODO: mobile
    width: 380px;
`
