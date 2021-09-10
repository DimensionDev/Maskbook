import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { MasksIcon } from '@masknet/icons'
import { Typography } from '@material-ui/core'
import { ECKeyIdentifier, formatFingerprint, Identifier, useValueRef } from '@masknet/shared'
import { currentPersonaIdentifier } from '../../../../settings/settings'
import { head } from 'lodash-es'
import { useAsync } from 'react-use'
import Services from '../../../service'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'

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
    const { loading, value: personas } = useAsync(async () => Services.Identity.queryOwnedPersonaInformation())

    const currentPersona = personas?.find((x) =>
        x.identifier.equals(
            Identifier.fromString(currentIdentifier, ECKeyIdentifier).unwrapOr(head(personas)?.identifier),
        ),
    )
    if (!personas?.length || !currentPersona) return null
    return (
        <>
            {loading ? (
                <LoadingPlaceholder />
            ) : (
                <div className={classes.container}>
                    <div className={classes.left}>
                        <MasksIcon />
                    </div>
                    <div>
                        <Typography className={classes.name}>{currentPersona.nickname}</Typography>
                        <Typography className={classes.identifier}>
                            {formatFingerprint(currentPersona.identifier.compressedPoint, 4)}
                        </Typography>
                    </div>
                </div>
            )}
        </>
    )
})

export default Persona
