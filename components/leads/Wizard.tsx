'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type WizardStep<T = Record<string, unknown>> = {
  id: string
  title: string
  description?: string
  validate?: (data: T) => boolean | string
  render: (props: {
    data: T
    onUpdate: (updates: Partial<T>) => void
    onNext: () => void
    onBack: () => void
  }) => React.ReactNode
}

type WizardProps<T extends Record<string, unknown>> = {
  steps: WizardStep<T>[]
  initialData: T
  onComplete?: (data: T) => void
  showProgress?: boolean
}

export function Wizard<T extends Record<string, unknown>>({
  steps,
  initialData,
  onComplete,
  showProgress = true,
}: WizardProps<T>) {
  const [state, setState] = useState(0)
  const [data, setData] = useState<T>(initialData)

  const currentStep = steps[state]
  const isFirst = state === 0
  const isLast = state === steps.length - 1

  const onUpdate = (updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const onNext = () => {
    if (currentStep?.validate) {
      const result = currentStep.validate(data)
      if (result === false) return
      if (typeof result === 'string') return
    }
    if (isLast) {
      onComplete?.(data)
    } else {
      setState((s) => s + 1)
    }
  }

  const onBack = () => {
    if (isFirst) return
    setState((s) => s - 1)
  }

  if (!currentStep) return null

  const progress = ((state + 1) / steps.length) * 100

  return (
    <div className="space-y-8">
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {state + 1} of {steps.length}</span>
            <span>{currentStep.title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="min-h-[280px]">
        {currentStep.title && (
          <h3 className="text-lg font-semibold text-foreground mb-2">{currentStep.title}</h3>
        )}
        {currentStep.description && (
          <p className="text-muted-foreground mb-6">{currentStep.description}</p>
        )}
        {currentStep.render({
          data,
          onUpdate,
          onNext,
          onBack,
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirst}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          {isLast ? 'Complete' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
