import { useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { GuideStep } from '@masknet/injected-ui/GuideStep'

export const meta = {
    title: 'GuideStep',
    description:
        'Onboarding tooltip overlay injected next to a highlighted element on every site adaptor (packages/injected-ui/src/GuideStep.tsx). Used cross-platform: the wallet/app toolbox hints, PostDialogHint, and the setup wizard all wrap their target in this.',
}

const TIPS = [
    'Explore multi-chain dApps.',
    'Connect and switch between your wallets.',
    'Click here to have a quick start.',
]
const TOTAL = TIPS.length

export default function GuideStepDemo() {
    const [step, setStep] = useState(1)
    const [finished, setFinished] = useState(false)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', paddingTop: '48px', paddingLeft: '48px' }}>
            <Typography variant="body2" color="text.secondary">
                {finished ? 'Tour dismissed.' : `Step ${step} of ${TOTAL}`}
            </Typography>
            <Button
                variant="outlined"
                onClick={() => {
                    setStep(1)
                    setFinished(false)
                }}>
                Restart tour
            </Button>
            <GuideStep
                total={TOTAL}
                step={step}
                tip={TIPS[step - 1]}
                visible={!finished}
                onSkip={() => setFinished(true)}
                onNext={() => setStep((s) => Math.min(s + 1, TOTAL))}
                onTry={() => setFinished(true)}>
                <Button variant="contained" sx={{ pointerEvents: 'none' }}>
                    Highlighted element
                </Button>
            </GuideStep>
        </Stack>
    )
}
