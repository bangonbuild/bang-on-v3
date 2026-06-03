export function getWelcomeLine(
  hour: number,
  weatherCode: number,
  windSpeed: number,
): string {
  const isMorning = hour >= 5 && hour < 10
  const isArvo = hour >= 15 && hour < 18
  const isKnockoff = hour >= 18

  const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)
  const isWindy = windSpeed > 40
  const isSunny = [0, 1].includes(weatherCode)

  if (isKnockoff) return 'Time to knock off. Good work today.'
  if (isRaining && isMorning) return "Wet one today — good morning for the paperwork."
  if (isRaining) return "Rain's on the way. Plan accordingly."
  if (isWindy) return 'Windy out there. Check your scaffold ties.'
  if (isSunny && isMorning) return 'Good morning for an early start.'
  if (isSunny && isArvo) return "Sunny arvo. Good day on the tools."
  if (isMorning) return "Early start. Let's get into it."
  if (isArvo) return "Arvo's flying. What's left on the list?"
  return "What's the job today?"
}

export function firstNameFromProfile(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0]
}
