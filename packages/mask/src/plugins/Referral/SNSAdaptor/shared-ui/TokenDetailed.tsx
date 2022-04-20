import { makeStyles } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { TokenIcon } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        alignItems: 'center',
    },
    logo: {
        display: 'flex',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        marginRight: '16px',
    },
    details: {
        marginLeft: '16px',
        fontWeight: 500,
    },
    name: {
        color: theme.palette.text.secondary,
        fontWeight: 400,
    },
}))

export interface TokenProps {
    address: string
    symbol?: string
    name?: string
    logoURI?: string | string[]
    chainId?: ChainId
}

export interface TokenDetailedProps extends React.PropsWithChildren<{}> {
    token?: TokenProps
}

export function TokenDetailed({ token }: TokenDetailedProps) {
    const { classes } = useStyles()

    return (
        <div className={classes.container}>
            {token && (
                <>
                    <TokenIcon {...token} />
                    <Typography className={classes.details} display="flex" flexDirection="column">
                        <div>{token.symbol}</div>
                        <span className={classes.name}>{token.name}</span>
                    </Typography>
                </>
            )}
        </div>
    )
}
