// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    container: {
        background: theme.palette.maskColor.modalTitleBg,
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: 100,
        height: 28,
    },
    menu: {
        color: theme.palette.maskColor.main,
    },
}))

interface PersonaHeaderUIProps {}

export const PersonaHeaderUI = memo<PersonaHeaderUIProps>(() => {
    const { classes } = useStyles()
    return (
        <Box className={classes.container}>
            <Icons.MaskSquare className={classes.logo} />
            <Icons.HamburgeMenu className={classes.menu} />
        </Box>
    )
})
