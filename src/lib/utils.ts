import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function getWeekDates(date: Date): Date[] {
  const week: Date[] = []
  const current = new Date(date)
  current.setDate(current.getDate() - current.getDay() + 1) // Start from Monday

  for (let i = 0; i < 7; i++) {
    week.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return week
}

export function generateTimeSlots(startHour: number = 7, endHour: number = 21): string[] {
  const slots: string[] = []
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < endHour) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

// Coach color mapping
export const coachColors: Record<string, string> = {
  'Tom P': 'bg-blue-500',
  'Andris': 'bg-green-500',
  'Tomy': 'bg-purple-500',
  'Sergio': 'bg-red-500',
  'DK': 'bg-orange-500',
  'Joe D': 'bg-teal-500',
  'Mike D': 'bg-indigo-500',
  'Reece': 'bg-pink-500',
  'Billy': 'bg-yellow-500',
  'Kate': 'bg-cyan-500',
  'Sophie': 'bg-rose-500',
  'default': 'bg-gray-500',
}

export function getCoachColor(coachName: string): string {
  return coachColors[coachName] || coachColors['default']
}
