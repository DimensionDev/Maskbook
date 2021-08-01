import type { ReactElement, ReactNode } from 'react'
import React, { Children, cloneElement, isValidElement, useEffect, useState } from 'react'
import { Box } from '@material-ui/core'
import { useMap } from 'react-use'

export interface CommonProps {
    toStep: (stepName: string, params?: any) => void
}

interface StepProps {
    name: string
    params?: any
    toStep?: (stepName: string, callbackParams?: any) => void
    children: (toNext: (stepName: string, callbackParams?: any) => void, params: any) => ReactNode
}

export const Step = ({ children, toStep, params }: StepProps) => {
    return <>{children(toStep!, params)}</>
}

interface StepperProps {
    default: string
    stepContext?: {
        step: string
        params?: string
    }
    children: ReactElement[]
}
export const Stepper = (props: StepperProps) => {
    const [currentStep, setCurrentStep] = useState(props.default)
    const [steps, { set: setSteps }] = useMap<{ [key: string]: ReactElement }>()
    const [stepParams, { set: setParam }] = useMap<{ [key: string]: any }>()

    useEffect(() => {
        if (!props.stepContext) return

        const { step, params } = props.stepContext
        setCurrentStep(step)
        setParam(step, params)
    }, [props.stepContext])

    const toStep = (stepName: string, params: any) => {
        setCurrentStep(stepName)
        setParam(stepName, params)
    }

    useEffect(() => {
        Children.forEach(props.children, (child: ReactElement<StepProps>) => {
            if (isValidElement(child)) {
                const name = child.props.name
                setSteps(name, cloneElement(child, { toStep }))
            }
        })
    }, [])

    useEffect(() => {}, [currentStep])

    return (
        <Box>{steps[currentStep] ? cloneElement(steps[currentStep], { params: stepParams[currentStep] }) : null}</Box>
    )
}
