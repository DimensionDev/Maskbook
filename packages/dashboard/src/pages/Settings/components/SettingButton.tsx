import { Button, styled, buttonClasses } from '@mui/material'

export default styled<typeof Button>(Button)(({ theme }) => ({
    [`&.${buttonClasses.root}`]: {
        padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
        borderRadius: 24,
        minWidth: 140,
    },
})) as any as typeof Button
