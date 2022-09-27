import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, BoxProps, Button, FormControl } from '@mui/material'
import classnames from 'classnames'
import { FC, memo, useState } from 'react'
import { useTip } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { TipsType } from '../types/index.js'
import { NFTSection } from './NFTSection/index.js'
import { TokenSection } from './TokenSection/index.js'

const useStyles = makeStyles<{}, 'icon'>()((theme, _, refs) => {
    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
        },
        main: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            padding: theme.spacing(2),
        },
        receiverRow: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        to: {
            fontSize: 19,
            fontWeight: 500,
        },
        address: {
            height: 48,
            flexGrow: 1,
            marginLeft: theme.spacing(1),
        },
        select: {
            display: 'flex',
            alignItems: 'center',
            [`& .${refs.icon}`]: {
                display: 'none',
            },
        },
        menuItem: {
            height: 40,
        },
        icon: {},
        link: {
            display: 'inline-flex',
            alignItems: 'center',
        },
        actionIcon: {
            marginRight: theme.spacing(1),
            color: theme.palette.text.secondary,
        },
        checkIcon: {
            marginLeft: 'auto',
        },
        controls: {
            marginTop: theme.spacing(1),
            display: 'flex',
            flexDirection: 'row',
        },
        addButton: {
            marginLeft: 'auto',
        },
        tokenField: {
            marginTop: theme.spacing(2),
        },
    }
})

interface Props extends BoxProps {
    onSent?(): void
}

export const TipForm: FC<Props> = memo(({ className, onSent, ...rest }) => {
    const t = useI18N()
    const pluginId = useCurrentWeb3NetworkPluginID()
    const { classes } = useStyles({})
    const { tipType } = useTip()
    const [empty, setEmpty] = useState(false)

    const isEvm = pluginId === NetworkPluginID.PLUGIN_EVM

    return (
        <Box className={classnames(classes.root, className)} {...rest}>
            <div className={classes.main}>
                <FormControl className={classes.controls}>
                    {tipType === TipsType.Collectibles && !empty && isEvm ? (
                        <Button variant="text" className={classes.addButton}>
                            {t.tip_add_collectibles()}
                        </Button>
                    ) : null}
                </FormControl>
                {tipType === TipsType.Tokens ? (
                    <FormControl className={classes.tokenField}>
                        <TokenSection />
                    </FormControl>
                ) : (
                    <NFTSection onEmpty={setEmpty} />
                )}
            </div>
        </Box>
    )
})
