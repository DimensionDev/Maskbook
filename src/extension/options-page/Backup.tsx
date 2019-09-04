import React, { useState } from 'react'
import { TextField, Button } from '@material-ui/core'
import { useMyIdentities, useCurrentIdentity } from '../../components/DataSource/useActivatedUI'
import { useAsync } from '../../utils/components/AsyncComponent'
import Services from '../../extension/service'
import { NotSetupYetPrompt } from '../../components/shared/NotSetupYetPrompt'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'

const DevPage = () => {
    const id = useMyIdentities()
    console.log(useCurrentIdentity())
    const [current, setCurrent] = useState(useCurrentIdentity())

    console.log(id, current)
    const [file, setFile] = useState('')

    useAsync(async () => {
        if (!current) return ''
        return Services.Welcome.backupMyKeyPair(current.identifier, false)
    }, [current]).then(x => setFile(JSON.stringify(x)))
    if (id.length === 0) {
        return (
            <main className="container">
                <NotSetupYetPrompt />
            </main>
        )
    }

    return (
        <main className="container">
            {id.length > 1 && current ? <ChooseIdentity current={current!} onChangeIdentity={e => { console.log('change', e); setCurrent(e) } } /> : null}
            {file}
        </main>
    )
}

export default DevPage
