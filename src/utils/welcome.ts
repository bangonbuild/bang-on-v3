export function getWelcomeLine(weatherCode: number, windSpeed: number): string {
  const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)
  const isStormy = [95, 96, 99].includes(weatherCode)
  const isWindy = windSpeed > 40
  const isSunny = [0, 1].includes(weatherCode)
  const isCloudy = [2, 3, 45, 48].includes(weatherCode)

  if (isStormy) return 'Storm on the way. Stay safe out there.'
  if (isRaining && isWindy) return 'Wet and windy. Tie everything down.'
  if (isRaining) return 'Wet one today. Good day for the paperwork.'
  if (isWindy) return 'Windy out there. Check your scaffold ties.'
  if (isSunny) return 'Good day on the tools.'
  if (isCloudy) return 'Overcast today. Good conditions on site.'
  return "What's the job today?"
}

export function firstNameFromProfile(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0]
}
