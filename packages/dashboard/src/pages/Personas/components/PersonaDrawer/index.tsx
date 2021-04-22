import { memo, PropsWithChildren } from 'react'
import { Drawer, makeStyles } from '@material-ui/core'
import { PersonaDrawerState } from '../../../../hooks/usePersonaDrawerState'
import { PersonaCard } from '../PersonaCard'

const useStyles = makeStyles((theme) => ({
    root: {
        top: `64px !important`,
    },
    paper: {
        top: `64px`,
        padding: theme.spacing(3.75, 3.75, 0, 3.75),
        '& > *': {
            marginTop: theme.spacing(1.5),
        },
    },
}))

export interface PersonaDrawer extends PropsWithChildren<{}> {}

export const PersonaDrawer = memo<PersonaDrawer>(({ children }) => {
    const classes = useStyles()
    const { open, toggleDrawer } = PersonaDrawerState.useContainer()
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={toggleDrawer}
            variant="temporary"
            hideBackdrop
            elevation={0}
            classes={classes}>
            <PersonaCard
                active={false}
                nickName="Yisiliu"
                providers={[
                    {
                        internalName: 'twitter.com',
                        connected: false,
                        network: 'twitter.com',
                    },
                ]}
            />
            <PersonaCard
                active={true}
                nickName="Yisiliu"
                providers={[
                    {
                        internalName: 'twitter.com',
                        connected: true,
                        network: 'twitter.com',
                    },
                ]}
            />
        </Drawer>
    )
})
