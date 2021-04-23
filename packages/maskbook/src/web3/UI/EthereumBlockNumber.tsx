import { makeStyles, Typography, TypographyProps } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'
import { useChainId } from '../hooks/useChainId'
import { useBlockNumber } from '../hooks/useBlockNumber'

const useStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.text.secondary,
        textAlign: 'center',
        fontSize: 11,
        margin: theme.spacing(0, 0, 2),
    },
}))

export interface EthereumBlockNumberProps {
    TypographyProps?: Partial<TypographyProps>
}

export function EthereumBlockNumber(props: EthereumBlockNumberProps) {
    const classes = useStyles()
    const { t } = useI18N()

    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)

    return (
        <Typography className={classes.root} title={t('block_number')} variant="body2" {...props.TypographyProps}>
            {blockNumber}
        </Typography>
    )
}
