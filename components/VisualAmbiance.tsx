'use client'

import { useEffect, useRef } from 'react'

export type AmbianceStyle = 'none' | 'geometric' | 'fireflies' | 'nebula' | 'eyes' | 'shadowcat' | 'watcher' | 'shadows'

interface VisualAmbianceProps {
  style: AmbianceStyle
  intensity?: number // 0-1, affects opacity/speed
}

export default function VisualAmbiance({ style, intensity = 0.5 }: VisualAmbianceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const stateRef = useRef<any>({})
  const timeRef = useRef(0)
  
  useEffect(() => {
    if (style === 'none') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      initializeState(style, window.innerWidth, window.innerHeight, stateRef, intensity)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    initializeState(style, window.innerWidth, window.innerHeight, stateRef, intensity)
    
    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      ctx.clearRect(0, 0, width, height)
      timeRef.current += 0.016
      
      switch (style) {
        case 'geometric':
          drawGeometric(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'fireflies':
          drawFireflies(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'nebula':
          drawNebula(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'eyes':
          drawEyes(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'shadowcat':
          drawShadowCat(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'watcher':
          drawWatcher(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'shadows':
          drawShadows(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [style, intensity])
  
  if (style === 'none') return null
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}

// ============ State Initialization ============

function initializeState(
  style: AmbianceStyle,
  width: number,
  height: number,
  stateRef: React.MutableRefObject<any>,
  intensity: number
) {
  switch (style) {
    case 'geometric':
      stateRef.current = {
        nodes: createHexGrid(width, height),
        phase: 0
      }
      break
      
    case 'fireflies':
      const fireflyCount = Math.floor(25 * intensity) + 12
      stateRef.current = {
        fireflies: Array.from({ length: fireflyCount }, () => createFirefly(width, height)),
      }
      break
      
    case 'nebula':
      stateRef.current = {
        clouds: Array.from({ length: 6 }, (_, i) => createCloud(width, height, i)),
        stars: Array.from({ length: Math.floor(100 * intensity) + 50 }, () => createStar(width, height)),
      }
      break
      
    case 'eyes':
      stateRef.current = {
        eyePairs: Array.from({ length: Math.floor(3 + intensity * 4) }, () => createEyePair(width, height)),
      }
      break
      
    case 'shadowcat':
      // Create 4 cats at different positions around the screen
      stateRef.current = {
        cats: [
          createShadowCatState(width, height, 0), // top-left
          createShadowCatState(width, height, 2), // top-right
          createShadowCatState(width, height, 4), // bottom-right
          createShadowCatState(width, height, 6), // bottom-left
        ],
      }
      break
      
    case 'watcher':
      stateRef.current = {
        watcher: createWatcherState(width, height),
        glimpses: [],
      }
      break
      
    case 'shadows':
      stateRef.current = {
        shadowTendrils: Array.from({ length: 6 }, () => createShadowTendril(width, height)),
        shadowPools: Array.from({ length: 4 }, () => createShadowPool(width, height)),
      }
      break
  }
}

// ============ Geometric Effect ============

interface HexNode {
  x: number
  y: number
  baseX: number
  baseY: number
  connections: number[]
  phase: number
  pulseSpeed: number
}

function createHexGrid(width: number, height: number): HexNode[] {
  const nodes: HexNode[] = []
  // TUNED: Much larger spacing = fewer nodes = less visual clutter
  const spacing = 140
  const rowHeight = spacing * Math.sin(Math.PI / 3)
  
  for (let row = -1; row <= height / rowHeight + 1; row++) {
    const offset = row % 2 === 0 ? 0 : spacing / 2
    for (let col = -1; col <= width / spacing + 1; col++) {
      nodes.push({
        x: col * spacing + offset,
        y: row * rowHeight,
        baseX: col * spacing + offset,
        baseY: row * rowHeight,
        connections: [],
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.2 + Math.random() * 0.3,
      })
    }
  }
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].baseX - nodes[j].baseX
      const dy = nodes[i].baseY - nodes[j].baseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < spacing * 1.2) {
        nodes[i].connections.push(j)
        nodes[j].connections.push(i)
      }
    }
  }
  
  return nodes
}

function drawGeometric(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { nodes } = state
  const waveSpeed = 0.25
  const waveAmplitude = 8 * intensity
  
  nodes.forEach((node: HexNode) => {
    node.phase += node.pulseSpeed * 0.008
    
    const waveX = Math.sin(time * waveSpeed + node.baseY * 0.008 + node.baseX * 0.003) * waveAmplitude
    const waveY = Math.cos(time * waveSpeed * 0.5 + node.baseX * 0.008) * waveAmplitude * 0.5
    
    node.x = node.baseX + waveX
    node.y = node.baseY + waveY
  })
  
  const drawnConnections = new Set<string>()
  
  nodes.forEach((node: HexNode, i: number) => {
    node.connections.forEach((j: number) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (drawnConnections.has(key)) return
      drawnConnections.add(key)
      
      const other = nodes[j]
      const midX = (node.x + other.x) / 2
      const midY = (node.y + other.y) / 2
      
      const hue = 220 + Math.sin(time * 0.15 + midX * 0.002 + midY * 0.002) * 30
      const brightness = 0.1 + Math.sin(time * 0.3 + node.phase) * 0.05
      
      ctx.strokeStyle = `hsla(${hue}, 40%, 50%, ${brightness * intensity})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(node.x, node.y)
      ctx.lineTo(other.x, other.y)
      ctx.stroke()
    })
  })
  
  nodes.forEach((node: HexNode) => {
    const hue = 220 + Math.sin(time * 0.2 + node.phase) * 20
    const pulse = Math.sin(node.phase) * 0.2 + 0.5
    const size = 1.5 + pulse * 0.8
    
    const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 4)
    glowGradient.addColorStop(0, `hsla(${hue}, 50%, 60%, ${pulse * intensity * 0.3})`)
    glowGradient.addColorStop(0.5, `hsla(${hue}, 40%, 50%, ${pulse * intensity * 0.1})`)
    glowGradient.addColorStop(1, `hsla(${hue}, 30%, 40%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(node.x, node.y, size * 4, 0, Math.PI * 2)
    ctx.fill()
    
    // Tiny core
    ctx.fillStyle = `hsla(${hue}, 60%, 70%, ${pulse * intensity * 0.6})`
    ctx.beginPath()
    ctx.arc(node.x, node.y, size * 0.6, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ============ Fireflies Effect ============

interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  phase: number
  pulseSpeed: number
  glowIntensity: number
  trail: { x: number; y: number; opacity: number }[]
  targetX: number
  targetY: number
  wanderAngle: number
}

function createFirefly(width: number, height: number): Firefly {
  const x = Math.random() * width
  const y = Math.random() * height
  
  const colorChoice = Math.random()
  let hue
  if (colorChoice < 0.5) {
    hue = 45 + Math.random() * 20 // Golden yellow
  } else if (colorChoice < 0.8) {
    hue = 65 + Math.random() * 25 // Yellow-green
  } else {
    hue = 30 + Math.random() * 15 // Warm orange
  }
  
  return {
    x, y,
    vx: 0,
    vy: 0,
    size: 2 + Math.random() * 1.5,
    hue,
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.15 + Math.random() * 0.2,
    glowIntensity: 0.4 + Math.random() * 0.4,
    trail: [],
    targetX: x,
    targetY: y,
    wanderAngle: Math.random() * Math.PI * 2,
  }
}

function drawFireflies(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { fireflies } = state
  
  fireflies.forEach((fly: Firefly) => {
    fly.wanderAngle += (Math.random() - 0.5) * 0.2
    
    if (Math.random() < 0.008) {
      fly.targetX = Math.random() * width
      fly.targetY = Math.random() * height
    }
    
    const dx = fly.targetX - fly.x
    const dy = fly.targetY - fly.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist > 10) {
      fly.vx += (dx / dist) * 0.03 + Math.cos(fly.wanderAngle) * 0.08
      fly.vy += (dy / dist) * 0.03 + Math.sin(fly.wanderAngle) * 0.08
    } else {
      fly.vx += Math.cos(fly.wanderAngle) * 0.1
      fly.vy += Math.sin(fly.wanderAngle) * 0.1
    }
    
    fly.vx *= 0.96
    fly.vy *= 0.96
    
    const speed = Math.sqrt(fly.vx * fly.vx + fly.vy * fly.vy)
    if (speed > 1.5) {
      fly.vx = (fly.vx / speed) * 1.5
      fly.vy = (fly.vy / speed) * 1.5
    }
    
    fly.x += fly.vx
    fly.y += fly.vy
    
    if (fly.x < -50) fly.x = width + 50
    if (fly.x > width + 50) fly.x = -50
    if (fly.y < -50) fly.y = height + 50
    if (fly.y > height + 50) fly.y = -50
    
    fly.trail.unshift({ x: fly.x, y: fly.y, opacity: 1 })
    if (fly.trail.length > 15) fly.trail.pop()
    
    fly.trail.forEach((point, i) => {
      point.opacity = 1 - (i / fly.trail.length)
    })
    
    fly.phase += fly.pulseSpeed * 0.02
    
    // Gentle pulse curve
    const pulseRaw = Math.sin(fly.phase)
    const pulseValue = pulseRaw > 0 ? Math.pow(pulseRaw, 2) : 0
    const brightness = 0.25 + pulseValue * 0.75
    
    // Draw trail
    if (fly.trail.length > 1) {
      ctx.beginPath()
      ctx.moveTo(fly.trail[0].x, fly.trail[0].y)
      
      for (let i = 1; i < fly.trail.length; i++) {
        const point = fly.trail[i]
        ctx.lineTo(point.x, point.y)
      }
      
      ctx.strokeStyle = `hsla(${fly.hue}, 70%, 55%, ${brightness * intensity * 0.2})`
      ctx.lineWidth = fly.size * 0.4
      ctx.lineCap = 'round'
      ctx.stroke()
    }
    
    // Draw glow
    const glowSize = fly.size * (6 + pulseValue * 8)
    const glowGradient = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, glowSize)
    glowGradient.addColorStop(0, `hsla(${fly.hue}, 85%, 70%, ${brightness * intensity * fly.glowIntensity})`)
    glowGradient.addColorStop(0.2, `hsla(${fly.hue}, 80%, 60%, ${brightness * intensity * fly.glowIntensity * 0.5})`)
    glowGradient.addColorStop(0.5, `hsla(${fly.hue}, 75%, 50%, ${brightness * intensity * fly.glowIntensity * 0.15})`)
    glowGradient.addColorStop(1, `hsla(${fly.hue}, 70%, 45%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(fly.x, fly.y, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw core
    const coreSize = fly.size * (0.7 + pulseValue * 0.4)
    ctx.fillStyle = `hsla(${fly.hue - 10}, 95%, 80%, ${brightness * intensity})`
    ctx.beginPath()
    ctx.arc(fly.x, fly.y, coreSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Bright center
    ctx.fillStyle = `hsla(${fly.hue - 20}, 100%, 92%, ${brightness * intensity * 0.7})`
    ctx.beginPath()
    ctx.arc(fly.x, fly.y, coreSize * 0.35, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ============ Nebula Effect ============

interface Cloud {
  x: number
  y: number
  radius: number
  hue: number
  saturation: number
  speedX: number
  speedY: number
  noiseOffsetX: number
  noiseOffsetY: number
  opacity: number
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

function createCloud(width: number, height: number, index: number): Cloud {
  const palettes = [
    { hue: 280, saturation: 60 },
    { hue: 320, saturation: 50 },
    { hue: 220, saturation: 70 },
    { hue: 200, saturation: 60 },
    { hue: 260, saturation: 55 },
    { hue: 340, saturation: 45 },
  ]
  
  const palette = palettes[index % palettes.length]
  
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 200 + Math.random() * 300,
    hue: palette.hue + (Math.random() - 0.5) * 30,
    saturation: palette.saturation + (Math.random() - 0.5) * 20,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2,
    noiseOffsetX: Math.random() * 1000,
    noiseOffsetY: Math.random() * 1000,
    opacity: 0.15 + Math.random() * 0.15,
  }
}

function createStar(width: number, height: number): Star {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.2,
    twinkleSpeed: 0.5 + Math.random() * 2,
    twinklePhase: Math.random() * Math.PI * 2,
  }
}

function noise(x: number, y: number, time: number): number {
  const sin1 = Math.sin(x * 0.01 + time * 0.2)
  const sin2 = Math.sin(y * 0.01 + time * 0.15)
  const sin3 = Math.sin((x + y) * 0.007 + time * 0.1)
  const sin4 = Math.sin(x * 0.02 - y * 0.015 + time * 0.25)
  return (sin1 + sin2 + sin3 + sin4) / 4
}

function drawNebula(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { clouds, stars } = state
  
  clouds.forEach((cloud: Cloud) => {
    cloud.x += cloud.speedX
    cloud.y += cloud.speedY
    
    if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius
    if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius
    if (cloud.y < -cloud.radius) cloud.y = height + cloud.radius
    if (cloud.y > height + cloud.radius) cloud.y = -cloud.radius
    
    const noiseVal = noise(cloud.x + cloud.noiseOffsetX, cloud.y + cloud.noiseOffsetY, time)
    const distortedRadius = cloud.radius * (1 + noiseVal * 0.3)
    
    cloud.hue += 0.01
    
    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = layer * 20
      const layerRadius = distortedRadius * (1 - layer * 0.15)
      const layerOpacity = cloud.opacity * (1 - layer * 0.25) * intensity
      
      const gradient = ctx.createRadialGradient(
        cloud.x + Math.sin(time * 0.3 + layer) * layerOffset,
        cloud.y + Math.cos(time * 0.25 + layer) * layerOffset,
        0,
        cloud.x,
        cloud.y,
        layerRadius
      )
      
      const hueShift = layer * 15
      gradient.addColorStop(0, `hsla(${cloud.hue + hueShift}, ${cloud.saturation}%, 40%, ${layerOpacity})`)
      gradient.addColorStop(0.3, `hsla(${cloud.hue + hueShift + 10}, ${cloud.saturation - 10}%, 30%, ${layerOpacity * 0.7})`)
      gradient.addColorStop(0.6, `hsla(${cloud.hue + hueShift + 20}, ${cloud.saturation - 20}%, 20%, ${layerOpacity * 0.4})`)
      gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
  })
  
  stars.forEach((star: Star) => {
    star.twinklePhase += star.twinkleSpeed * 0.02
    const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6
    const currentOpacity = star.opacity * twinkle * intensity
    
    const glowSize = star.size * 4
    const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize)
    glowGradient.addColorStop(0, `hsla(220, 30%, 95%, ${currentOpacity * 0.6})`)
    glowGradient.addColorStop(0.5, `hsla(230, 40%, 85%, ${currentOpacity * 0.2})`)
    glowGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = `hsla(210, 20%, 98%, ${currentOpacity})`
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.fill()
  })
  
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.2,
    width / 2, height / 2, Math.max(width, height) * 0.8
  )
  vignette.addColorStop(0, 'hsla(0, 0%, 0%, 0)')
  vignette.addColorStop(0.7, `hsla(260, 50%, 5%, ${intensity * 0.15})`)
  vignette.addColorStop(1, `hsla(260, 60%, 3%, ${intensity * 0.3})`)
  
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
}

// ============ Spooky: Eyes Effect (Unsettling, organic) ============

interface EyePair {
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  spacing: number
  asymmetry: number // Eyes aren't perfectly aligned
  nextBlink: number
  isBlinking: boolean
  blinkProgress: number
  blinkSpeed: number
  lookAngle: number
  lookTargetAngle: number
  opacity: number
  fadeDirection: number
  driftPhase: number
  driftSpeed: number
  twitchX: number
  twitchY: number
  dilationPhase: number
  leftEyeOffset: { x: number; y: number; size: number }
  rightEyeOffset: { x: number; y: number; size: number }
}

function createEyePair(width: number, height: number): EyePair {
  const edge = Math.floor(Math.random() * 4)
  let x, y
  const margin = 80
  
  switch (edge) {
    case 0: x = margin + Math.random() * (width - margin * 2); y = margin + Math.random() * 60; break
    case 1: x = margin + Math.random() * (width - margin * 2); y = height - margin - Math.random() * 60; break
    case 2: x = margin + Math.random() * 60; y = margin + Math.random() * (height - margin * 2); break
    default: x = width - margin - Math.random() * 60; y = margin + Math.random() * (height - margin * 2); break
  }
  
  return {
    x, y, targetX: x, targetY: y,
    size: 4 + Math.random() * 3, // Smaller, less cartoon
    spacing: 12 + Math.random() * 8,
    asymmetry: (Math.random() - 0.5) * 4, // One eye slightly higher
    nextBlink: Math.random() * 400 + 200,
    isBlinking: false,
    blinkProgress: 0,
    blinkSpeed: 0.06 + Math.random() * 0.04, // Slower, creepier blink
    lookAngle: Math.random() * Math.PI * 2,
    lookTargetAngle: Math.random() * Math.PI * 2,
    opacity: 0,
    fadeDirection: 1,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: 0.05 + Math.random() * 0.08,
    twitchX: 0,
    twitchY: 0,
    dilationPhase: Math.random() * Math.PI * 2,
    // Asymmetric eyes - one slightly different
    leftEyeOffset: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, size: 0.9 + Math.random() * 0.2 },
    rightEyeOffset: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, size: 0.9 + Math.random() * 0.2 },
  }
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { eyePairs } = state
  
  eyePairs.forEach((pair: EyePair) => {
    // Fade in/out
    if (pair.fadeDirection > 0) {
      pair.opacity = Math.min(1, pair.opacity + 0.002)
      if (pair.opacity >= 1 && Math.random() < 0.0008) pair.fadeDirection = -1
    } else {
      pair.opacity = Math.max(0, pair.opacity - 0.003)
      if (pair.opacity <= 0) {
        Object.assign(pair, createEyePair(width, height))
        pair.opacity = 0
        pair.fadeDirection = 1
      }
    }
    
    // Slow drift with occasional twitch
    pair.driftPhase += pair.driftSpeed * 0.01
    if (Math.random() < 0.003) {
      pair.twitchX = (Math.random() - 0.5) * 3
      pair.twitchY = (Math.random() - 0.5) * 2
    }
    pair.twitchX *= 0.95
    pair.twitchY *= 0.95
    
    pair.x = pair.targetX + Math.sin(pair.driftPhase) * 8 + pair.twitchX
    pair.y = pair.targetY + Math.cos(pair.driftPhase * 0.7) * 5 + pair.twitchY
    
    // Blink - slower, more unsettling
    pair.nextBlink--
    if (pair.nextBlink <= 0 && !pair.isBlinking) {
      pair.isBlinking = true
      pair.blinkProgress = 0
    }
    if (pair.isBlinking) {
      pair.blinkProgress += pair.blinkSpeed
      if (pair.blinkProgress >= 1) {
        pair.isBlinking = false
        pair.nextBlink = Math.random() * 500 + 300
      }
    }
    
    // Pupil dilation
    pair.dilationPhase += 0.008
    const dilation = 0.4 + Math.sin(pair.dilationPhase) * 0.15
    
    // Look direction - slow, deliberate
    if (Math.random() < 0.003) pair.lookTargetAngle = Math.random() * Math.PI * 2
    pair.lookAngle += (pair.lookTargetAngle - pair.lookAngle) * 0.008
    
    const blinkAmount = pair.isBlinking ? Math.sin(pair.blinkProgress * Math.PI) : 0
    const eyeOpenness = 1 - blinkAmount * 0.95
    const currentOpacity = pair.opacity * intensity * 0.5
    
    if (currentOpacity < 0.01) return
    
    // Draw each eye with asymmetry
    const eyes = [
      { side: -1, offset: pair.leftEyeOffset },
      { side: 1, offset: pair.rightEyeOffset }
    ]
    
    eyes.forEach(({ side, offset }) => {
      const eyeX = pair.x + side * pair.spacing / 2 + offset.x
      const eyeY = pair.y + (side === -1 ? pair.asymmetry : 0) + offset.y
      const eyeSize = pair.size * offset.size
      
      // Dim, sickly glow - barely visible
      const glowSize = eyeSize * 4
      const glowGradient = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, glowSize)
      glowGradient.addColorStop(0, `hsla(40, 15%, 25%, ${currentOpacity * 0.15})`)
      glowGradient.addColorStop(1, `hsla(40, 10%, 15%, 0)`)
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(eyeX, eyeY, glowSize, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.save()
      ctx.translate(eyeX, eyeY)
      ctx.scale(1, eyeOpenness)
      
      // Dark socket/void around eye
      ctx.fillStyle = `hsla(0, 0%, 2%, ${currentOpacity * 0.6})`
      ctx.beginPath()
      ctx.ellipse(0, 0, eyeSize * 1.3, eyeSize * 0.9, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // The eye itself - pale, unsettling
      ctx.fillStyle = `hsla(45, 5%, 20%, ${currentOpacity * 0.8})`
      ctx.beginPath()
      ctx.ellipse(0, 0, eyeSize, eyeSize * 0.55, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Iris - murky, unnatural
      const irisSize = eyeSize * 0.6
      const pupilOffset = eyeSize * 0.12
      const irisX = Math.cos(pair.lookAngle) * pupilOffset
      const irisY = Math.sin(pair.lookAngle) * pupilOffset * 0.5
      
      ctx.fillStyle = `hsla(35, 20%, 18%, ${currentOpacity})`
      ctx.beginPath()
      ctx.arc(irisX, irisY, irisSize, 0, Math.PI * 2)
      ctx.fill()
      
      // Pupil - dilating
      const pupilSize = irisSize * dilation
      ctx.fillStyle = `hsla(0, 0%, 0%, ${currentOpacity})`
      ctx.beginPath()
      ctx.arc(irisX, irisY, pupilSize, 0, Math.PI * 2)
      ctx.fill()
      
      // Tiny, dim reflection - barely there
      ctx.fillStyle = `hsla(0, 0%, 60%, ${currentOpacity * 0.2})`
      ctx.beginPath()
      ctx.arc(irisX - pupilSize * 0.3, irisY - pupilSize * 0.3, pupilSize * 0.15, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })
  })
}

// ============ Spooky: Shadow Cat Effect (Multiple cats) ============

interface ShadowCatState {
  x: number
  y: number
  scale: number
  opacity: number
  eyeGlow: number
  eyePhase: number
  tailPhase: number
  earTwitch: number
  lookAngle: number
  position: number // 0-7 for 8 positions around screen
  breathPhase: number
}

function createShadowCatState(width: number, height: number, positionIndex?: number): ShadowCatState {
  const position = positionIndex !== undefined ? positionIndex : Math.floor(Math.random() * 8)
  const margin = 100
  let x, y
  
  // 8 positions: 4 corners + 4 edge midpoints
  switch (position) {
    case 0: x = margin; y = margin; break // top-left
    case 1: x = width / 2; y = margin * 0.7; break // top-center
    case 2: x = width - margin; y = margin; break // top-right
    case 3: x = width - margin * 0.7; y = height / 2; break // right-center
    case 4: x = width - margin; y = height - margin; break // bottom-right
    case 5: x = width / 2; y = height - margin * 0.7; break // bottom-center
    case 6: x = margin; y = height - margin; break // bottom-left
    default: x = margin * 0.7; y = height / 2; break // left-center
  }
  
  return {
    x, y,
    scale: 0.6 + Math.random() * 0.3,
    opacity: 0.3 + Math.random() * 0.4, // Start partially visible
    eyeGlow: 0.5,
    eyePhase: Math.random() * Math.PI * 2,
    tailPhase: Math.random() * Math.PI * 2,
    earTwitch: 0,
    lookAngle: Math.PI / 2,
    position,
    breathPhase: Math.random() * Math.PI * 2,
  }
}

function drawSingleCat(
  ctx: CanvasRenderingContext2D,
  cat: ShadowCatState,
  width: number,
  height: number,
  intensity: number
): void {
  // Animate
  cat.eyePhase += 0.02
  cat.tailPhase += 0.015
  cat.breathPhase += 0.01
  cat.eyeGlow = 0.6 + Math.sin(cat.eyePhase * 0.5) * 0.25
  
  // Subtle opacity pulse
  const breathEffect = Math.sin(cat.breathPhase) * 0.1
  
  // Occasional ear twitch
  if (Math.random() < 0.003) cat.earTwitch = 1
  cat.earTwitch *= 0.92
  
  // Look toward center of screen
  const centerX = width / 2
  const centerY = height / 2
  const targetLookAngle = Math.atan2(centerY - cat.y, centerX - cat.x)
  cat.lookAngle += (targetLookAngle - cat.lookAngle) * 0.008
  
  const opacity = (cat.opacity + breathEffect) * intensity * 0.5
  if (opacity < 0.01) return
  
  const s = cat.scale * 55
  
  ctx.save()
  ctx.translate(cat.x, cat.y)
  
  // Body silhouette
  ctx.fillStyle = `hsla(260, 20%, 4%, ${opacity})`
  
  // Body
  ctx.beginPath()
  ctx.ellipse(0, s * 0.2, s * 0.45, s * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.beginPath()
  ctx.arc(0, -s * 0.25, s * 0.32, 0, Math.PI * 2)
  ctx.fill()
  
  // Ears
  const earTwitch = cat.earTwitch * 0.1
  ctx.beginPath()
  ctx.moveTo(-s * 0.22, -s * 0.45)
  ctx.lineTo(-s * 0.32 - earTwitch * s, -s * 0.78)
  ctx.lineTo(-s * 0.08, -s * 0.5)
  ctx.fill()
  
  ctx.beginPath()
  ctx.moveTo(s * 0.22, -s * 0.45)
  ctx.lineTo(s * 0.32 + earTwitch * s, -s * 0.78)
  ctx.lineTo(s * 0.08, -s * 0.5)
  ctx.fill()
  
  // Tail
  const tailWave = Math.sin(cat.tailPhase) * 0.2
  ctx.beginPath()
  ctx.moveTo(s * 0.35, s * 0.25)
  ctx.quadraticCurveTo(s * 0.75 + tailWave * s, s * 0.1, s * 0.85, -s * 0.15 + tailWave * s * 0.5)
  ctx.lineWidth = s * 0.1
  ctx.strokeStyle = `hsla(260, 20%, 4%, ${opacity})`
  ctx.lineCap = 'round'
  ctx.stroke()
  
  // Eyes
  const eyeSpacing = s * 0.16
  const eyeY = -s * 0.28
  const pupilOffset = s * 0.025
  const lookX = Math.cos(cat.lookAngle) * pupilOffset
  const lookY = Math.sin(cat.lookAngle) * pupilOffset
  
  for (let i = -1; i <= 1; i += 2) {
    const eyeX = i * eyeSpacing
    
    // Eye glow
    const glowSize = s * 0.18
    const glowGradient = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, glowSize)
    glowGradient.addColorStop(0, `hsla(50, 100%, 55%, ${opacity * cat.eyeGlow * 0.9})`)
    glowGradient.addColorStop(0.4, `hsla(45, 90%, 45%, ${opacity * cat.eyeGlow * 0.4})`)
    glowGradient.addColorStop(1, `hsla(40, 80%, 35%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(eyeX, eyeY, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Eye
    ctx.fillStyle = `hsla(50, 95%, 50%, ${opacity * cat.eyeGlow})`
    ctx.beginPath()
    ctx.ellipse(eyeX, eyeY, s * 0.07, s * 0.09, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Slit pupil
    ctx.fillStyle = `hsla(0, 0%, 0%, ${opacity})`
    ctx.beginPath()
    ctx.ellipse(eyeX + lookX, eyeY + lookY, s * 0.018, s * 0.07, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  
  ctx.restore()
}

function drawShadowCat(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  // Draw all cats
  state.cats.forEach((cat: ShadowCatState) => {
    drawSingleCat(ctx, cat, width, height, intensity)
  })
}

// ============ Spooky: Watcher Effect (Full creepy figure) ============

interface WatcherState {
  x: number
  y: number
  opacity: number
  targetOpacity: number
  figureHeight: number
  sway: number
  swaySpeed: number
  breathPhase: number
  fadeTimer: number
  visible: boolean
  headTilt: number
  armPhase: number
  hairWave: number
  side: number // 0 = left, 1 = right
}

function createWatcherState(width: number, height: number): WatcherState {
  const side = Math.random() < 0.5 ? 0 : 1
  return {
    x: side === 0 ? width * 0.06 : width * 0.94,
    y: height,
    opacity: 0,
    targetOpacity: 0,
    figureHeight: height * 0.55 + Math.random() * height * 0.1,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.15 + Math.random() * 0.1,
    breathPhase: Math.random() * Math.PI * 2,
    fadeTimer: 80 + Math.random() * 150,
    visible: false,
    headTilt: 0,
    armPhase: Math.random() * Math.PI * 2,
    hairWave: Math.random() * Math.PI * 2,
    side,
  }
}

function drawWatcher(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const watcher = state.watcher as WatcherState
  
  // Appear/disappear logic
  watcher.fadeTimer--
  if (watcher.fadeTimer <= 0) {
    if (watcher.visible) {
      watcher.targetOpacity = 0
      if (watcher.opacity < 0.01) {
        watcher.visible = false
        watcher.fadeTimer = 150 + Math.random() * 300
        watcher.side = watcher.side === 0 ? 1 : 0
        watcher.x = watcher.side === 0 ? width * 0.06 : width * 0.94
      }
    } else {
      watcher.visible = true
      watcher.targetOpacity = 1
      watcher.fadeTimer = 400 + Math.random() * 600
    }
  }
  
  watcher.opacity += (watcher.targetOpacity - watcher.opacity) * 0.008
  
  // Animation
  watcher.sway += watcher.swaySpeed * 0.01
  watcher.breathPhase += 0.012
  watcher.armPhase += 0.008
  watcher.hairWave += 0.015
  
  // Slow head tilt toward center
  const targetTilt = watcher.side === 0 ? 0.1 : -0.1
  watcher.headTilt += (targetTilt - watcher.headTilt) * 0.005
  
  const swayAmount = Math.sin(watcher.sway) * 5
  const breathScale = 1 + Math.sin(watcher.breathPhase) * 0.015
  
  const opacity = watcher.opacity * intensity * 0.35
  if (opacity < 0.01) return
  
  const h = watcher.figureHeight
  const bodyWidth = h * 0.18
  const headSize = h * 0.12
  const flip = watcher.side === 0 ? 1 : -1
  
  ctx.save()
  ctx.translate(watcher.x + swayAmount, watcher.y)
  ctx.scale(flip * breathScale, 1)
  
  // === BODY (tattered dress/robe shape) ===
  ctx.fillStyle = `hsla(260, 25%, 3%, ${opacity})`
  ctx.beginPath()
  ctx.moveTo(-bodyWidth * 0.8, 0) // Bottom left
  ctx.lineTo(-bodyWidth * 1.2, 0) // Spread at bottom
  ctx.quadraticCurveTo(-bodyWidth * 0.9, -h * 0.3, -bodyWidth * 0.5, -h * 0.5) // Left side curves in
  ctx.lineTo(-bodyWidth * 0.35, -h * 0.7) // Shoulder area
  ctx.quadraticCurveTo(0, -h * 0.72, bodyWidth * 0.35, -h * 0.7) // Across shoulders
  ctx.lineTo(bodyWidth * 0.5, -h * 0.5) // Right shoulder down
  ctx.quadraticCurveTo(bodyWidth * 0.9, -h * 0.3, bodyWidth * 1.2, 0) // Right side
  ctx.lineTo(bodyWidth * 0.8, 0) // Bottom right
  ctx.closePath()
  ctx.fill()
  
  // Tattered bottom edges
  for (let i = 0; i < 5; i++) {
    const tearX = -bodyWidth + (i * bodyWidth * 0.5)
    const tearLen = 15 + Math.sin(watcher.hairWave + i) * 8
    ctx.beginPath()
    ctx.moveTo(tearX, 0)
    ctx.lineTo(tearX + 5, tearLen)
    ctx.lineTo(tearX + 10, 0)
    ctx.fill()
  }
  
  // === ARM (reaching/hanging) ===
  const armSway = Math.sin(watcher.armPhase) * 0.05
  ctx.save()
  ctx.translate(-bodyWidth * 0.5, -h * 0.55)
  ctx.rotate(-0.3 + armSway)
  
  // Upper arm
  ctx.fillStyle = `hsla(260, 25%, 3%, ${opacity})`
  ctx.beginPath()
  ctx.ellipse(0, h * 0.1, bodyWidth * 0.15, h * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Forearm
  ctx.beginPath()
  ctx.ellipse(-bodyWidth * 0.1, h * 0.22, bodyWidth * 0.12, h * 0.1, -0.2, 0, Math.PI * 2)
  ctx.fill()
  
  // Hand (claw-like)
  const handX = -bodyWidth * 0.15
  const handY = h * 0.32
  ctx.beginPath()
  ctx.arc(handX, handY, bodyWidth * 0.1, 0, Math.PI * 2)
  ctx.fill()
  
  // Fingers
  for (let f = 0; f < 4; f++) {
    const fingerAngle = -0.4 + f * 0.25
    ctx.beginPath()
    ctx.moveTo(handX, handY)
    ctx.lineTo(
      handX + Math.cos(fingerAngle) * bodyWidth * 0.2,
      handY + Math.sin(fingerAngle) * bodyWidth * 0.25 + h * 0.05
    )
    ctx.lineWidth = 2
    ctx.strokeStyle = `hsla(260, 25%, 3%, ${opacity})`
    ctx.stroke()
  }
  ctx.restore()
  
  // === HEAD ===
  ctx.save()
  ctx.translate(0, -h * 0.78)
  ctx.rotate(watcher.headTilt)
  
  // Head shape
  ctx.fillStyle = `hsla(260, 25%, 3%, ${opacity})`
  ctx.beginPath()
  ctx.ellipse(0, 0, headSize * 0.8, headSize, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // === HAIR (long, stringy) ===
  ctx.fillStyle = `hsla(260, 30%, 2%, ${opacity})`
  for (let strand = 0; strand < 8; strand++) {
    const strandX = -headSize * 0.7 + strand * headSize * 0.2
    const strandWave = Math.sin(watcher.hairWave + strand * 0.5) * 5
    const strandLen = headSize * (1.5 + Math.random() * 0.5)
    
    ctx.beginPath()
    ctx.moveTo(strandX, -headSize * 0.3)
    ctx.quadraticCurveTo(
      strandX + strandWave,
      strandLen * 0.5,
      strandX + strandWave * 1.5,
      strandLen
    )
    ctx.lineWidth = 3 + Math.random() * 2
    ctx.strokeStyle = `hsla(260, 30%, 2%, ${opacity * 0.8})`
    ctx.stroke()
  }
  
  // === FACE (hollow, disturbing) ===
  // Eye sockets (dark voids)
  const eyeY = -headSize * 0.1
  const eyeSpacing = headSize * 0.3
  
  for (let i = -1; i <= 1; i += 2) {
    const eyeX = i * eyeSpacing
    
    // Deep socket
    ctx.fillStyle = `hsla(0, 0%, 0%, ${opacity})`
    ctx.beginPath()
    ctx.ellipse(eyeX, eyeY, headSize * 0.18, headSize * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Tiny pinprick of light deep in socket
    if (watcher.opacity > 0.3) {
      const glowOpacity = (watcher.opacity - 0.3) * opacity * 1.5
      ctx.fillStyle = `hsla(200, 10%, 40%, ${glowOpacity})`
      ctx.beginPath()
      ctx.arc(eyeX, eyeY + headSize * 0.02, headSize * 0.04, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  // Mouth (slightly open, dark)
  ctx.fillStyle = `hsla(0, 0%, 0%, ${opacity * 0.8})`
  ctx.beginPath()
  ctx.ellipse(0, headSize * 0.4, headSize * 0.2, headSize * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.restore() // head
  ctx.restore() // main
}

// ============ Spooky: Creeping Shadows Effect (More visible) ============

interface ShadowTendril {
  startX: number
  startY: number
  angle: number
  length: number
  maxLength: number
  speed: number
  width: number
  segments: number
  phase: number
  growing: boolean
  opacity: number
}

interface ShadowPool {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  growing: boolean
  pulsePhase: number
  reachPhase: number
}

function createShadowTendril(width: number, height: number): ShadowTendril {
  const edge = Math.floor(Math.random() * 4)
  let startX, startY, angle
  
  switch (edge) {
    case 0:
      startX = Math.random() * width
      startY = -20
      angle = Math.PI / 2 + (Math.random() - 0.5) * 0.6
      break
    case 1:
      startX = Math.random() * width
      startY = height + 20
      angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6
      break
    case 2:
      startX = -20
      startY = Math.random() * height
      angle = (Math.random() - 0.5) * 0.6
      break
    default:
      startX = width + 20
      startY = Math.random() * height
      angle = Math.PI + (Math.random() - 0.5) * 0.6
      break
  }
  
  return {
    startX, startY, angle,
    length: 0,
    maxLength: 200 + Math.random() * 300, // Longer
    speed: 0.8 + Math.random() * 0.6, // Faster
    width: 60 + Math.random() * 80, // Wider
    segments: 12 + Math.floor(Math.random() * 8),
    phase: Math.random() * Math.PI * 2,
    growing: true,
    opacity: 0,
  }
}

function createShadowPool(width: number, height: number): ShadowPool {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0,
    maxRadius: 150 + Math.random() * 200, // Much larger
    opacity: 0,
    growing: true,
    pulsePhase: Math.random() * Math.PI * 2,
    reachPhase: Math.random() * Math.PI * 2,
  }
}

function drawShadows(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { shadowTendrils, shadowPools } = state
  
  // Draw corner darkness first
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height },
  ]
  
  corners.forEach((corner, i) => {
    const cornerGrad = ctx.createRadialGradient(corner.x, corner.y, 0, corner.x, corner.y, 300)
    const pulse = Math.sin(time * 0.3 + i) * 0.1
    cornerGrad.addColorStop(0, `hsla(260, 30%, 2%, ${(0.4 + pulse) * intensity})`)
    cornerGrad.addColorStop(0.5, `hsla(260, 25%, 3%, ${(0.2 + pulse * 0.5) * intensity})`)
    cornerGrad.addColorStop(1, `hsla(260, 20%, 5%, 0)`)
    
    ctx.fillStyle = cornerGrad
    ctx.fillRect(0, 0, width, height)
  })
  
  // Draw pools
  shadowPools.forEach((pool: ShadowPool) => {
    pool.pulsePhase += 0.015
    pool.reachPhase += 0.008
    
    if (pool.growing) {
      pool.radius += 0.5
      pool.opacity = Math.min(1, pool.opacity + 0.008)
      if (pool.radius >= pool.maxRadius) {
        pool.growing = false
      }
    } else {
      pool.opacity -= 0.005
      if (pool.opacity <= 0) {
        pool.x = Math.random() * width
        pool.y = Math.random() * height
        pool.radius = 0
        pool.maxRadius = 150 + Math.random() * 200
        pool.opacity = 0
        pool.growing = true
      }
    }
    
    const pulseScale = 1 + Math.sin(pool.pulsePhase) * 0.08
    const currentRadius = pool.radius * pulseScale
    const currentOpacity = pool.opacity * intensity * 0.5 // Much more visible
    
    if (currentOpacity < 0.01) return
    
    // Main pool
    const gradient = ctx.createRadialGradient(pool.x, pool.y, 0, pool.x, pool.y, currentRadius)
    gradient.addColorStop(0, `hsla(260, 35%, 2%, ${currentOpacity})`)
    gradient.addColorStop(0.3, `hsla(260, 30%, 3%, ${currentOpacity * 0.8})`)
    gradient.addColorStop(0.6, `hsla(260, 25%, 4%, ${currentOpacity * 0.4})`)
    gradient.addColorStop(1, `hsla(260, 20%, 5%, 0)`)
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(pool.x, pool.y, currentRadius, 0, Math.PI * 2)
    ctx.fill()
    
    // Reaching tendrils from pool
    for (let t = 0; t < 5; t++) {
      const tendrilAngle = (t / 5) * Math.PI * 2 + pool.reachPhase
      const tendrilLen = currentRadius * (0.3 + Math.sin(pool.reachPhase * 2 + t) * 0.2)
      const tendrilX = pool.x + Math.cos(tendrilAngle) * (currentRadius * 0.8 + tendrilLen)
      const tendrilY = pool.y + Math.sin(tendrilAngle) * (currentRadius * 0.8 + tendrilLen)
      
      const tendrilGrad = ctx.createRadialGradient(tendrilX, tendrilY, 0, tendrilX, tendrilY, 40)
      tendrilGrad.addColorStop(0, `hsla(260, 30%, 3%, ${currentOpacity * 0.6})`)
      tendrilGrad.addColorStop(1, `hsla(260, 25%, 5%, 0)`)
      
      ctx.fillStyle = tendrilGrad
      ctx.beginPath()
      ctx.arc(tendrilX, tendrilY, 40, 0, Math.PI * 2)
      ctx.fill()
    }
  })
  
  // Draw edge tendrils
  shadowTendrils.forEach((tendril: ShadowTendril) => {
    tendril.phase += 0.025
    
    if (tendril.growing) {
      tendril.length += tendril.speed
      tendril.opacity = Math.min(1, tendril.opacity + 0.012)
      if (tendril.length >= tendril.maxLength) {
        tendril.growing = false
      }
    } else {
      tendril.opacity -= 0.006
      if (tendril.opacity <= 0) {
        Object.assign(tendril, createShadowTendril(width, height))
      }
    }
    
    const currentOpacity = tendril.opacity * intensity * 0.6 // More visible
    if (currentOpacity < 0.01) return
    
    let x = tendril.startX
    let y = tendril.startY
    let angle = tendril.angle
    
    // Draw as connected blobs
    for (let i = 0; i < tendril.segments; i++) {
      const segmentLength = tendril.length / tendril.segments
      const progress = i / tendril.segments
      const waveOffset = Math.sin(tendril.phase + i * 0.4) * 25 * progress
      
      const nextX = x + Math.cos(angle) * segmentLength + Math.cos(angle + Math.PI / 2) * waveOffset
      const nextY = y + Math.sin(angle) * segmentLength + Math.sin(angle + Math.PI / 2) * waveOffset
      
      const segmentWidth = tendril.width * (1 - progress * 0.6)
      const segmentOpacity = currentOpacity * (1 - progress * 0.4)
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, segmentWidth)
      gradient.addColorStop(0, `hsla(260, 30%, 2%, ${segmentOpacity})`)
      gradient.addColorStop(0.4, `hsla(260, 25%, 3%, ${segmentOpacity * 0.6})`)
      gradient.addColorStop(1, `hsla(260, 20%, 5%, 0)`)
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, segmentWidth, 0, Math.PI * 2)
      ctx.fill()
      
      x = nextX
      y = nextY
      angle += (Math.random() - 0.5) * 0.15
    }
  })
}
