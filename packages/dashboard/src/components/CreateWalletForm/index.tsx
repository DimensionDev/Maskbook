import {
    FormControl,
    ListItemIcon,
    MenuItem,
    Select,
    experimentalStyled as styled,
    Typography,
    makeStyles,
    createStyles,
    FilledInput,
} from '@material-ui/core'
import { memo, useState } from 'react'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: 380,
            marginTop: theme.spacing(1.5),
        },
        input: {
            padding: theme.spacing(2, 0),
        },
        filled: {
            display: 'flex',
            padding: theme.spacing(2, 0),
        },
    }),
)

// TODO: actions,  and icon may be an img url
export interface CreateWalletFormProps {
    options: Array<{ label: string; icon: React.ReactNode; value: number }>
}

export const CreateWalletForm = memo((props: CreateWalletFormProps) => {
    const { options } = props

    const classes = useStyles()

    const [selected, setSelected] = useState()

    return (
        <Container>
            <FormContainer>
                <Select
                    classes={{ filled: classes.filled }}
                    variant="filled"
                    value={selected}
                    onChange={(event) => setSelected(event.target.value)}>
                    {options.map(({ label, icon, value }) => (
                        <MenuItem value={value}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <Typography variant="inherit">{label}</Typography>
                        </MenuItem>
                    ))}
                </Select>
            </FormContainer>

            <FilledInput classes={{ root: classes.root, input: classes.input }} placeholder="Wallet Name" />
        </Container>
    )
})

const Container = styled('div')`
    display: flex;
    flex-direction: column;
`

const FormContainer = styled(FormControl)`
    // TODO: mobile
    width: 380px;
`
