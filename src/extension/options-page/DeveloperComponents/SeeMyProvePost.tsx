import React, { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Services from '../../service'
import { useIsolatedChooseIdentity } from '../../../components/shared/ChooseIdentity'

const useStyles = makeStyles({
    prove: {
        wordBreak: 'break-all',
    },
})

export function SeeMyProvePost() {
    const classes = useStyles()
    const [whoAmI, chooseIdentity] = useIsolatedChooseIdentity()
    const [provePost, setProvePost] = useState<string | null>('')
    useMemo(() => {
        if (!whoAmI) return
        Services.Crypto.getMyProveBio(whoAmI.identifier).then(setProvePost)
    }, [whoAmI])
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary">See my prove post</Typography>
                {chooseIdentity}
                <Typography color="textSecondary">Your prove post is:</Typography>
                <Typography variant="body1" className={classes.prove}>
                    {provePost}
                </Typography>
            </CardContent>
        </Card>
    )
}
