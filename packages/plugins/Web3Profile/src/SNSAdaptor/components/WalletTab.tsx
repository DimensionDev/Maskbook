import type { WalletTypes } from '../types'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { TabPanel } from '@mui/lab'
import { WalletSwitch } from './WalletSwitch'
import { isSameAddress } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    walletSwitchBox: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
    },
    switchContainer: {
        width: 'calc(50% - 6px)',
        borderRadius: '8px',
    },
}))

interface WalletTabProps extends withClasses<never | 'root' | 'list' | 'collectionWrap'> {
    value: string
    wallets?: WalletTypes[]
    hiddenItems?: WalletTypes[]
    setHiddenItems: (items: WalletTypes[]) => void
}
export function WalletTab(props: WalletTabProps) {
    const { wallets = [], value, hiddenItems = [], setHiddenItems } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <TabPanel value={value} style={{ padding: 0 }}>
            <div className={classes.walletSwitchBox}>
                {wallets?.map((x) => {
                    return (
                        <div key={x.address} className={classes.switchContainer}>
                            <WalletSwitch
                                hiddenItems={hiddenItems}
                                type={0}
                                address={x}
                                isPublic={
                                    hiddenItems?.findIndex((account) => isSameAddress(account.address, x?.address)) ===
                                    -1
                                }
                                setHiddenItems={setHiddenItems}
                            />
                        </div>
                    )
                })}
            </div>
        </TabPanel>
    )
}
