import type { ReactElement, ReactNode } from 'react'
import { Children, cloneElement, isValidElement, memo, useEffect, useState } from 'react'
import { useMap } from 'react-use'
import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()({
    hidden: {
        position: 'absolute',
        left: 10000,
    },
})

export interface StepCommonProps {
    toStep: (stepName: string, params?: any) => void
}

interface StepProps {
    name: string
    params?: any
    toStep?: (stepName: string, callbackParams?: any) => void
    children: (toNext: (stepName: string, callbackParams?: any) => void, params: any) => ReactNode
}

export const Step = memo(function Step({ children, toStep, params }: StepProps) {
    return <>{children(toStep!, params)}</>
})

export interface StepperProps {
    defaultStep: string
    step?: {
        name: string
        params?: any
    }
    transition?: {
        render: ReactNode
        trigger: boolean
    }
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement[]
    onChange?: (step: { name: string; params: any }) => void
}
export function Stepper(props: StepperProps) {
    const { defaultStep, transition, step, onChange } = props
    const { classes } = useStyles()
    const [currentStep, setCurrentStep] = useState(defaultStep)
    const [currentTransition, setCurrentTransition] = useState(transition?.render)

    // eslint-disable-next-line @typescript-eslint/ban-types
    const [steps, { set: setSteps }] = useMap<{ [key: string]: ReactElement }>()
    const [stepParams, { set: setParam }] = useMap<{ [key: string]: any }>()

    const toStep = (stepName: string, params: any) => {
        setCurrentStep(stepName)
        setParam(stepName, params)
        onChange?.({ name: stepName, params })
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        Children.forEach(props.children, (child: ReactElement<StepProps>) => {
            if (!isValidElement(child)) return
            const name = child.props.name
            setSteps(name, child)
        })
    }, [])

    useEffect(() => {
        if (!transition) {
            setCurrentTransition(null)
            return
        }
        if (transition.trigger) {
            setCurrentTransition(transition.render)
        } else {
            setCurrentTransition(null)
        }
    }, [transition?.render, transition?.trigger])

    useEffect(() => {
        if (!step) return
        toStep(step.name, step.params)
    }, [step?.name, step?.params])

    return (
        <>
            <>{currentTransition}</>
            <>
                {steps[currentStep] ? (
                    <Box className={currentTransition ? classes.hidden : ''} width="100%">
                        {cloneElement(steps[currentStep], { toStep, params: stepParams[currentStep] })}
                    </Box>
                ) : null}
            </>
        </>
    )
}
