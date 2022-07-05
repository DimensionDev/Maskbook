import { makeStyles } from '@masknet/theme'
import { Button, Checkbox, CheckboxProps } from '@mui/material'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            flex: 1,
            backgroundImage: 'none',
            boxShadow: 'none',
            '&:hover': {
                backgroundColor: 'transparent !important',
            },
        },
        button: {
            flex: 1,
            '& span': {
                display: 'none',
            },
        },
    }
})

export interface RadioChipProps extends CheckboxProps {
    label: string
}

export function RadioChip(props: RadioChipProps) {
    const { classes } = useStyles()

    return (
        <Checkbox
            className={classes.root}
            {...props}
            disableRipple
            icon={
                <Button className={classes.button} disableRipple variant="text">
                    {props.label}
                </Button>
            }
            checkedIcon={
                <Button className={classes.button} disableRipple variant="contained" color="info">
                    {props.label}
                </Button>
            }
        />
    )
}
