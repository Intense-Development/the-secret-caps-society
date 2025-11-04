import { calculatePasswordStrength } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export default function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const { strength, score, feedback } = calculatePasswordStrength(password)

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-blue-500',
    'very-strong': 'bg-green-500',
  }

  const strengthText = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    'very-strong': 'Very Strong',
  }

  const strengthTextColors = {
    weak: 'text-red-600',
    medium: 'text-yellow-600',
    strong: 'text-blue-600',
    'very-strong': 'text-green-600',
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              level <= score ? strengthColors[strength] : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-medium', strengthTextColors[strength])}>
          {strengthText[strength]}
        </span>
        {feedback.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {feedback.length} improvement{feedback.length > 1 ? 's' : ''} available
          </span>
        )}
      </div>
      {feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="text-red-500">•</span> {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

