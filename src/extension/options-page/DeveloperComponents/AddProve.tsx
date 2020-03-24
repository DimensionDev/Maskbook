import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Services from '../../service'
import { ProfileIdentifier } from '../../../database/type'
import { useTextField } from '../../../utils/hooks/useForms'

const useStyles = makeStyles(theme => ({
    success: {
        color: 'green',
    },
    error: {
        color: theme.palette.error.main,
    },
}))

export function AddProve() {
    const classes = useStyles()
    const [network, networkInput] = useTextField('Network', { defaultValue: 'facebook.com', required: true })
    const [userID, userIDInput] = useTextField('User ID (not nickname)', { required: true })
    const [provePost, provePostInput] = useTextField('Prove Post', {
        placeholder: '🔒A+7HqsU+9p3fFIQvLSFiqrsdC1k/nXu7A1UmKjuLyyZy🔒',
        required: true,
    })
    // Error: Error
    // false: Verify failed
    // true: Success
    const [lastVerifyResult, setResult] = useState<Error | boolean | React.ReactNode>()
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    Add your friend manually
                </Typography>
                {networkInput}
                {userIDInput}
                {provePostInput}
            </CardContent>
            <CardActions>
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                        setResult('Verifying...')
                        Services.Crypto.verifyOthersProve(provePost, new ProfileIdentifier(network, userID)).then(
                            setResult,
                            setResult,
                        )
                    }}>
                    Add person
                </Button>
                <Typography color="textSecondary" gutterBottom>
                    Result:{' '}
                    {(r => {
                        if (r === undefined) return ''
                        if (r === false) return <span className={classes.error}>❌ Failed</span>
                        if (r === true) return <span className={classes.success}>✔ Added</span>
                        if (r instanceof Error)
                            return (
                                <span className={classes.error}>
                                    Exception: {r.message}
                                    {console.error(r)}
                                </span>
                            )
                        return r
                    })(lastVerifyResult)}
                </Typography>
            </CardActions>
        </Card>
    )
}
