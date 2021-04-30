import { memo, useRef } from 'react'
import {
    createStyles,
    makeStyles,
    Button,
    alpha,
    experimentalStyled as styled,
    InputBase,
    inputBaseClasses,
} from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

const useStyles = makeStyles((theme) =>
    createStyles({
        container: {
            display: 'grid',
            borderRadius: Number(theme.shape.borderRadius) * 2,
            padding: theme.spacing(1.5),
            gridRowGap: theme.spacing(1.25),
            backgroundColor: MaskColorVar.primaryBackground,
        },
        buttons: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gridColumnGap: theme.spacing(3),
        },
    }),
)

const NameInput = styled(InputBase)(({ theme }) => ({
    'label + &': {
        marginTop: theme.spacing(3),
    },
    [`& .${inputBaseClasses.input}`]: {
        width: '100%',
        borderRadius: 4,
        position: 'relative',
        backgroundColor: MaskColorVar.normalBackground,
        border: `1px solid ${MaskColorVar.border}`,
        fontSize: theme.typography.subtitle1.fontSize,
        padding: theme.spacing(1.2, 1.5),
        transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        '&:focus': {
            boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
            borderColor: theme.palette.primary.main,
        },
    },
}))

export interface AddPersonaCardProps {
    onConfirm: (name?: string) => void
    onCancel: () => void
}

export const AddPersonaCard = memo(({ onConfirm, onCancel }: AddPersonaCardProps) => {
    const ref = useRef<HTMLInputElement>()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <NameInput inputRef={ref} />
            <div className={classes.buttons}>
                <Button onClick={() => onConfirm(ref.current?.value)}>Confirm</Button>
                <Button color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    )
})
