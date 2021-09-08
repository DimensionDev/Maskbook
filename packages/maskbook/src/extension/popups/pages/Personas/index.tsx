import { memo } from 'react'
import { useMyPersonas } from '../../../../components/DataSource/useMyPersonas'
import { makeStyles } from '@masknet/theme'
import { MasksIcon } from '../../../../../../icons/general'
import { Typography } from '@material-ui/core'
import { ECKeyIdentifier, Identifier, useValueRef } from '@masknet/shared'
import { currentPersonaIdentifier } from '../../../../settings/settings'
import { head } from 'lodash-es'

const useStyles = makeStyles()({
    container: {
        padding: '12px 10px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#EFF5FF',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '4px',
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    identifier: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
})

const Persona = memo(() => {
    const { classes } = useStyles()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const personas = useMyPersonas()

    const currentPersona = personas.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )
    if (!personas.length || !currentPersona) return null
    return (
        <>
            <div className={classes.container}>
                <div className={classes.left}>
                    <MasksIcon />
                </div>
                <div>
                    <Typography className={classes.name}>{currentPersona.nickname}</Typography>
                    <Typography className={classes.identifier}>
                        {`${currentPersona.fingerprint.substr(0, 12)}...${currentPersona.fingerprint.substr(-12)}`}
                    </Typography>
                </div>
            </div>
        </>
    )
})

export default Persona
