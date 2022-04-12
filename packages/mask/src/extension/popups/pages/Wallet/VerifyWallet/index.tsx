import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { Steps } from '../../../../../components/shared/VerifyWallet/Steps'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: 'rgba(247, 249, 250, 1)',
        padding: '8px 16px 16px 16px',
    },
}))
const VerifyWallet = memo(() => {
    const { classes } = useStyles()
    const { currentPersona } = PersonaContext.useContainer()
    console.log(currentPersona, 'ggg')

    return (
        <div className={classes.container}>
            <Steps />
        </div>
    )
})

export default VerifyWallet
