import React, { useState } from 'react'
import { Button, Card, CardContent, CardActions, Typography } from '@material-ui/core'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import Services from '../../service'

export interface InfuraConnectionProps {}

export function InfuraConnection(props: InfuraConnectionProps) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')
    const testConnnection = async () => {
        if (loading) return
        try {
            setLoading(true)
            const balance = await Services.Plugin.invokePlugin(
                'maskbook.wallet',
                'queryBalance',
                '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
            )
            setStatus(`Your current balance is ${formatBalance(balance, 18)} (${Date.now()}).`)
        } catch (e) {
            console.log(e)
            setStatus(e.message)
        } finally {
            setLoading(false)
        }
    }
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary">Test Infura Connection</Typography>
            </CardContent>
            <CardActions>
                <Button variant="contained" size="small" onClick={testConnnection}>
                    Test Connection
                </Button>
                <Typography color="textSecondary" gutterBottom>
                    Result: {loading ? 'Fetching...' : status}
                </Typography>
            </CardActions>
        </Card>
    )
}
