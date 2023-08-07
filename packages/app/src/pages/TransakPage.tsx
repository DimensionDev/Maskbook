import { DisableShadowRootContext, LoadingBase, ShadowRootIsolation, makeStyles } from '@masknet/theme'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'
import { useTransakURL } from '@masknet/plugin-transak'
import { memo } from 'react'

export interface TransakPageProps {}

export default function TransakPage(props: TransakPageProps) {
    const transakURL = useTransakURL()

    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Transak" />

                <div className="bg-white p-5">
                    <div className="border rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <Transak />
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}

const useStyles = makeStyles()((theme) => ({
    frame: { display: 'block', width: '100%', height: 700, border: 0, borderRadius: 12 },
}))

const Transak = memo(() => {
    const transakURL = useTransakURL()
    const { classes } = useStyles()

    return <> {transakURL ? <iframe src={transakURL} className={classes.frame} /> : <LoadingBase />}</>
})
