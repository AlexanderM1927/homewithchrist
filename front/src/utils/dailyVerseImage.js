const DAILY_VERSE_IMAGES = [
  '/imgs/daily-verses/compressed_alicia-quan-kBybHJ3CEWI-unsplash.webp',
  '/imgs/daily-verses/compressed_bruno-van-der-kraan-v2HgNzRDfII-unsplash.webp',
  '/imgs/daily-verses/compressed_cristo.webp',
  '/imgs/daily-verses/compressed_day-verse.webp',
  '/imgs/daily-verses/compressed_pexels-abbas-zaidi-2161151287-38362773.webp',
  '/imgs/daily-verses/compressed_pexels-kelly-26586337.webp'
]

function getDayOfYear(date = new Date()) {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const diff = date - startOfYear
  const oneDayInMs = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDayInMs)
}

export function getDailyVerseImage(seed = new Date()) {
  if (!DAILY_VERSE_IMAGES.length) {
    return '/imgs/day-verse.avif'
  }

  const normalizedSeed = Number.isFinite(Number(seed))
    ? Math.abs(Number(seed))
    : getDayOfYear(seed instanceof Date ? seed : new Date())
  const imageIndex = normalizedSeed % DAILY_VERSE_IMAGES.length
  return DAILY_VERSE_IMAGES[imageIndex]
}

export { DAILY_VERSE_IMAGES }
