const cachedProfile = {
  value: null
}

function safeMatchMedia(query) {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

export function getDevicePerformanceProfile() {
  if (cachedProfile.value) return cachedProfile.value

  const memory = typeof navigator !== 'undefined' ? navigator.deviceMemory || 0 : 0
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 0 : 0
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  const isTouchOnly = safeMatchMedia('(pointer: coarse)')
  const prefersReducedMotion = safeMatchMedia('(prefers-reduced-motion: reduce)')

  const lowMemory = memory > 0 && memory <= 4
  const lowCpu = cores > 0 && cores <= 4
  const highDpr = dpr >= 2.5

  // Treat coarse-pointer + weaker hardware as low tier.
  const isLowEnd = lowMemory || lowCpu || (isTouchOnly && (highDpr || lowCpu))
  const isMidTier = !isLowEnd && (memory > 0 && memory <= 8 || cores > 0 && cores <= 8)

  cachedProfile.value = {
    isLowEnd,
    isMidTier,
    isTouchOnly,
    prefersReducedMotion,
    memory,
    cores,
    dpr
  }

  return cachedProfile.value
}

export function getThreeQualitySettings() {
  const profile = getDevicePerformanceProfile()
  const maxDpr = profile.isLowEnd ? 1 : profile.isMidTier ? 1.5 : 2

  return {
    antialias: !profile.isLowEnd,
    enableShadows: !profile.isLowEnd,
    maxDpr,
    targetFps: profile.isLowEnd ? 30 : 60,
    particleCountScale: profile.isLowEnd ? 0.35 : profile.isMidTier ? 0.65 : 1
  }
}
