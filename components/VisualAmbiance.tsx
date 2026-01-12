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
      stateRef.current = {
        cat: createShadowCatState(width, height),
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

// ============ Spooky: Eyes Effect ============

interface EyePair {
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  spacing: number
  blinkPhase: number
  blinkSpeed: number
  nextBlink: number
  isBlinking: boolean
  blinkProgress: number
  lookAngle: number
  lookTargetAngle: number
  opacity: number
  fadeDirection: number
  hue: number // For slight color variation
  driftPhase: number
  driftSpeed: number
}

function createEyePair(width: number, height: number): EyePair {
  // Position eyes in peripheral areas (edges of screen)
  const edge = Math.floor(Math.random() * 4)
  let x, y
  const margin = 100
  
  switch (edge) {
    case 0: // Top
      x = margin + Math.random() * (width - margin * 2)
      y = margin + Math.random() * 80
      break
    case 1: // Bottom
      x = margin + Math.random() * (width - margin * 2)
      y = height - margin - Math.random() * 80
      break
    case 2: // Left
      x = margin + Math.random() * 80
      y = margin + Math.random() * (height - margin * 2)
      break
    default: // Right
      x = width - margin - Math.random() * 80
      y = margin + Math.random() * (height - margin * 2)
      break
  }
  
  return {
    x, y,
    targetX: x,
    targetY: y,
    size: 8 + Math.random() * 6,
    spacing: 20 + Math.random() * 15,
    blinkPhase: Math.random() * Math.PI * 2,
    blinkSpeed: 0.3 + Math.random() * 0.3,
    nextBlink: Math.random() * 200 + 100,
    isBlinking: false,
    blinkProgress: 0,
    lookAngle: Math.random() * Math.PI * 2,
    lookTargetAngle: Math.random() * Math.PI * 2,
    opacity: 0,
    fadeDirection: 1,
    hue: Math.random() < 0.7 ? 45 : (Math.random() < 0.5 ? 0 : 120), // Yellow, red, or green
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: 0.1 + Math.random() * 0.15,
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
    // Fade in/out logic
    if (pair.fadeDirection > 0) {
      pair.opacity = Math.min(1, pair.opacity + 0.003)
      if (pair.opacity >= 1 && Math.random() < 0.001) {
        pair.fadeDirection = -1
      }
    } else {
      pair.opacity = Math.max(0, pair.opacity - 0.005)
      if (pair.opacity <= 0) {
        // Reposition when fully faded
        Object.assign(pair, createEyePair(width, height))
        pair.opacity = 0
        pair.fadeDirection = 1
      }
    }
    
    // Slow drift
    pair.driftPhase += pair.driftSpeed * 0.01
    const driftX = Math.sin(pair.driftPhase) * 15
    const driftY = Math.cos(pair.driftPhase * 0.7) * 10
    pair.x = pair.targetX + driftX
    pair.y = pair.targetY + driftY
    
    // Blink logic
    pair.nextBlink--
    if (pair.nextBlink <= 0 && !pair.isBlinking) {
      pair.isBlinking = true
      pair.blinkProgress = 0
    }
    
    if (pair.isBlinking) {
      pair.blinkProgress += 0.08
      if (pair.blinkProgress >= 1) {
        pair.isBlinking = false
        pair.nextBlink = Math.random() * 300 + 150
      }
    }
    
    // Slowly change look direction
    if (Math.random() < 0.005) {
      pair.lookTargetAngle = Math.random() * Math.PI * 2
    }
    pair.lookAngle += (pair.lookTargetAngle - pair.lookAngle) * 0.02
    
    const blinkAmount = pair.isBlinking 
      ? Math.sin(pair.blinkProgress * Math.PI) 
      : 0
    
    const eyeOpenness = 1 - blinkAmount * 0.9
    const currentOpacity = pair.opacity * intensity * 0.6
    
    if (currentOpacity < 0.01) return
    
    // Draw each eye
    for (let i = -1; i <= 1; i += 2) {
      const eyeX = pair.x + i * pair.spacing / 2
      const eyeY = pair.y
      
      // Outer glow
      const glowSize = pair.size * 3
      const glowGradient = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, glowSize)
      glowGradient.addColorStop(0, `hsla(${pair.hue}, 80%, 50%, ${currentOpacity * 0.3})`)
      glowGradient.addColorStop(0.5, `hsla(${pair.hue}, 70%, 40%, ${currentOpacity * 0.1})`)
      glowGradient.addColorStop(1, `hsla(${pair.hue}, 60%, 30%, 0)`)
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(eyeX, eyeY, glowSize, 0, Math.PI * 2)
      ctx.fill()
      
      // Eye shape (ellipse that closes when blinking)
      ctx.save()
      ctx.translate(eyeX, eyeY)
      ctx.scale(1, eyeOpenness)
      
      // Eye white/sclera (dark, barely visible)
      ctx.fillStyle = `hsla(${pair.hue}, 20%, 15%, ${currentOpacity * 0.5})`
      ctx.beginPath()
      ctx.ellipse(0, 0, pair.size, pair.size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Iris
      const irisSize = pair.size * 0.7
      const pupilOffset = pair.size * 0.15
      const irisX = Math.cos(pair.lookAngle) * pupilOffset
      const irisY = Math.sin(pair.lookAngle) * pupilOffset
      
      ctx.fillStyle = `hsla(${pair.hue}, 70%, 45%, ${currentOpacity})`
      ctx.beginPath()
      ctx.arc(irisX, irisY, irisSize, 0, Math.PI * 2)
      ctx.fill()
      
      // Pupil
      ctx.fillStyle = `hsla(0, 0%, 0%, ${currentOpacity})`
      ctx.beginPath()
      ctx.arc(irisX, irisY, irisSize * 0.5, 0, Math.PI * 2)
      ctx.fill()
      
      // Glint
      ctx.fillStyle = `hsla(0, 0%, 100%, ${currentOpacity * 0.7})`
      ctx.beginPath()
      ctx.arc(irisX - irisSize * 0.2, irisY - irisSize * 0.2, irisSize * 0.15, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    }
  })
}

// ============ Spooky: Shadow Cat Effect ============

interface ShadowCatState {
  x: number
  y: number
  targetX: number
  targetY: number
  scale: number
  opacity: number
  eyeGlow: number
  eyePhase: number
  tailPhase: number
  earTwitch: number
  lookAngle: number
  state: 'sitting' | 'moving' | 'fading'
  stateTimer: number
  corner: number
}

function createShadowCatState(width: number, height: number): ShadowCatState {
  const corner = Math.floor(Math.random() * 4)
  const margin = 120
  let x, y
  
  switch (corner) {
    case 0: x = margin; y = margin; break
    case 1: x = width - margin; y = margin; break
    case 2: x = margin; y = height - margin; break
    default: x = width - margin; y = height - margin; break
  }
  
  return {
    x, y,
    targetX: x,
    targetY: y,
    scale: 0.8 + Math.random() * 0.4,
    opacity: 0,
    eyeGlow: 0.5,
    eyePhase: 0,
    tailPhase: 0,
    earTwitch: 0,
    lookAngle: Math.PI / 2,
    state: 'fading',
    stateTimer: 50,
    corner,
  }
}

function drawShadowCat(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const cat = state.cat as ShadowCatState
  
  // State machine
  cat.stateTimer--
  
  if (cat.state === 'fading' && cat.stateTimer <= 0) {
    cat.state = 'sitting'
    cat.stateTimer = 500 + Math.random() * 500
  } else if (cat.state === 'sitting' && cat.stateTimer <= 0) {
    if (Math.random() < 0.3) {
      cat.state = 'moving'
      cat.corner = (cat.corner + 1 + Math.floor(Math.random() * 3)) % 4
      const margin = 120
      switch (cat.corner) {
        case 0: cat.targetX = margin; cat.targetY = margin; break
        case 1: cat.targetX = width - margin; cat.targetY = margin; break
        case 2: cat.targetX = margin; cat.targetY = height - margin; break
        default: cat.targetX = width - margin; cat.targetY = height - margin; break
      }
      cat.stateTimer = 200
    } else {
      cat.stateTimer = 300 + Math.random() * 400
    }
  } else if (cat.state === 'moving') {
    cat.x += (cat.targetX - cat.x) * 0.02
    cat.y += (cat.targetY - cat.y) * 0.02
    
    if (Math.abs(cat.x - cat.targetX) < 5 && Math.abs(cat.y - cat.targetY) < 5) {
      cat.state = 'sitting'
      cat.stateTimer = 400 + Math.random() * 400
    }
  }
  
  // Fade in/out
  const targetOpacity = cat.state === 'fading' ? 0 : 1
  cat.opacity += (targetOpacity - cat.opacity) * 0.02
  
  // Animate
  cat.eyePhase += 0.03
  cat.tailPhase += 0.02
  cat.eyeGlow = 0.5 + Math.sin(cat.eyePhase) * 0.3
  
  // Occasional ear twitch
  if (Math.random() < 0.005) cat.earTwitch = 1
  cat.earTwitch *= 0.9
  
  // Look toward center of screen
  const centerX = width / 2
  const centerY = height / 2
  const targetLookAngle = Math.atan2(centerY - cat.y, centerX - cat.x)
  cat.lookAngle += (targetLookAngle - cat.lookAngle) * 0.01
  
  const opacity = cat.opacity * intensity * 0.4
  if (opacity < 0.01) return
  
  const s = cat.scale * 60
  
  ctx.save()
  ctx.translate(cat.x, cat.y)
  
  // Body silhouette (sitting cat shape)
  ctx.fillStyle = `hsla(260, 20%, 5%, ${opacity})`
  
  // Body
  ctx.beginPath()
  ctx.ellipse(0, s * 0.2, s * 0.5, s * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head
  ctx.beginPath()
  ctx.arc(0, -s * 0.3, s * 0.35, 0, Math.PI * 2)
  ctx.fill()
  
  // Ears
  const earTwitch = cat.earTwitch * 0.1
  ctx.beginPath()
  ctx.moveTo(-s * 0.25, -s * 0.5)
  ctx.lineTo(-s * 0.35 - earTwitch * s, -s * 0.85)
  ctx.lineTo(-s * 0.1, -s * 0.55)
  ctx.fill()
  
  ctx.beginPath()
  ctx.moveTo(s * 0.25, -s * 0.5)
  ctx.lineTo(s * 0.35 + earTwitch * s, -s * 0.85)
  ctx.lineTo(s * 0.1, -s * 0.55)
  ctx.fill()
  
  // Tail
  const tailWave = Math.sin(cat.tailPhase) * 0.2
  ctx.beginPath()
  ctx.moveTo(s * 0.4, s * 0.3)
  ctx.quadraticCurveTo(
    s * 0.8 + tailWave * s, s * 0.1,
    s * 0.9, -s * 0.2 + tailWave * s * 0.5
  )
  ctx.lineWidth = s * 0.12
  ctx.strokeStyle = `hsla(260, 20%, 5%, ${opacity})`
  ctx.lineCap = 'round'
  ctx.stroke()
  
  // Eyes
  const eyeSpacing = s * 0.18
  const eyeY = -s * 0.32
  const pupilOffset = s * 0.03
  const lookX = Math.cos(cat.lookAngle) * pupilOffset
  const lookY = Math.sin(cat.lookAngle) * pupilOffset
  
  for (let i = -1; i <= 1; i += 2) {
    const eyeX = i * eyeSpacing
    
    // Eye glow
    const glowSize = s * 0.2
    const glowGradient = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, glowSize)
    glowGradient.addColorStop(0, `hsla(50, 100%, 60%, ${opacity * cat.eyeGlow * 0.8})`)
    glowGradient.addColorStop(0.3, `hsla(45, 90%, 50%, ${opacity * cat.eyeGlow * 0.4})`)
    glowGradient.addColorStop(1, `hsla(40, 80%, 40%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(eyeX, eyeY, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Eye
    ctx.fillStyle = `hsla(50, 90%, 55%, ${opacity * cat.eyeGlow})`
    ctx.beginPath()
    ctx.ellipse(eyeX, eyeY, s * 0.08, s * 0.1, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Slit pupil
    ctx.fillStyle = `hsla(0, 0%, 0%, ${opacity})`
    ctx.beginPath()
    ctx.ellipse(eyeX + lookX, eyeY + lookY, s * 0.02, s * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  
  ctx.restore()
}

// ============ Spooky: Watcher Effect ============

interface WatcherState {
  x: number
  y: number
  opacity: number
  targetOpacity: number
  height: number
  sway: number
  swaySpeed: number
  breathPhase: number
  fadeTimer: number
  visible: boolean
}

function createWatcherState(width: number, height: number): WatcherState {
  const side = Math.random() < 0.5 ? 0 : 1
  return {
    x: side === 0 ? width * 0.08 : width * 0.92,
    y: height * 0.85,
    opacity: 0,
    targetOpacity: 0,
    height: height * 0.4 + Math.random() * height * 0.15,
    sway: 0,
    swaySpeed: 0.3 + Math.random() * 0.2,
    breathPhase: 0,
    fadeTimer: 100 + Math.random() * 200,
    visible: false,
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
        watcher.fadeTimer = 200 + Math.random() * 400
        // Reposition
        const side = Math.random() < 0.5 ? 0 : 1
        watcher.x = side === 0 ? width * 0.08 : width * 0.92
      }
    } else {
      watcher.visible = true
      watcher.targetOpacity = 1
      watcher.fadeTimer = 300 + Math.random() * 500
    }
  }
  
  // Smooth fade
  watcher.opacity += (watcher.targetOpacity - watcher.opacity) * 0.01
  
  // Animation
  watcher.sway += watcher.swaySpeed * 0.01
  watcher.breathPhase += 0.015
  
  const swayAmount = Math.sin(watcher.sway) * 8
  const breathScale = 1 + Math.sin(watcher.breathPhase) * 0.02
  
  const opacity = watcher.opacity * intensity * 0.15 // Very subtle!
  if (opacity < 0.005) return
  
  ctx.save()
  ctx.translate(watcher.x + swayAmount, watcher.y)
  ctx.scale(breathScale, 1)
  
  const h = watcher.height
  const w = h * 0.25
  
  // Vague humanoid silhouette - very blurry and indistinct
  const gradient = ctx.createRadialGradient(0, -h * 0.5, 0, 0, -h * 0.5, w * 2)
  gradient.addColorStop(0, `hsla(260, 30%, 5%, ${opacity})`)
  gradient.addColorStop(0.5, `hsla(260, 25%, 8%, ${opacity * 0.5})`)
  gradient.addColorStop(1, `hsla(260, 20%, 10%, 0)`)
  
  // Body shape (very rough, shadowy)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.ellipse(0, -h * 0.5, w, h * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // Head area (slightly darker concentration)
  const headGradient = ctx.createRadialGradient(0, -h * 0.85, 0, 0, -h * 0.85, w * 0.8)
  headGradient.addColorStop(0, `hsla(260, 30%, 3%, ${opacity * 1.2})`)
  headGradient.addColorStop(0.6, `hsla(260, 25%, 5%, ${opacity * 0.6})`)
  headGradient.addColorStop(1, `hsla(260, 20%, 8%, 0)`)
  
  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.arc(0, -h * 0.85, w * 0.6, 0, Math.PI * 2)
  ctx.fill()
  
  // Hint of eyes - barely perceptible
  if (watcher.opacity > 0.5) {
    const eyeOpacity = (watcher.opacity - 0.5) * 2 * opacity * 3
    const eyeY = -h * 0.87
    const eyeSpacing = w * 0.25
    
    for (let i = -1; i <= 1; i += 2) {
      const eyeGlow = ctx.createRadialGradient(i * eyeSpacing, eyeY, 0, i * eyeSpacing, eyeY, w * 0.15)
      eyeGlow.addColorStop(0, `hsla(0, 0%, 20%, ${eyeOpacity})`)
      eyeGlow.addColorStop(1, `hsla(0, 0%, 10%, 0)`)
      
      ctx.fillStyle = eyeGlow
      ctx.beginPath()
      ctx.arc(i * eyeSpacing, eyeY, w * 0.15, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  ctx.restore()
}

// ============ Spooky: Creeping Shadows Effect ============

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
}

function createShadowTendril(width: number, height: number): ShadowTendril {
  const edge = Math.floor(Math.random() * 4)
  let startX, startY, angle
  
  switch (edge) {
    case 0: // Top
      startX = Math.random() * width
      startY = 0
      angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5
      break
    case 1: // Bottom
      startX = Math.random() * width
      startY = height
      angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5
      break
    case 2: // Left
      startX = 0
      startY = Math.random() * height
      angle = (Math.random() - 0.5) * 0.5
      break
    default: // Right
      startX = width
      startY = Math.random() * height
      angle = Math.PI + (Math.random() - 0.5) * 0.5
      break
  }
  
  return {
    startX, startY, angle,
    length: 0,
    maxLength: 100 + Math.random() * 200,
    speed: 0.3 + Math.random() * 0.4,
    width: 30 + Math.random() * 50,
    segments: 8 + Math.floor(Math.random() * 6),
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
    maxRadius: 80 + Math.random() * 120,
    opacity: 0,
    growing: Math.random() < 0.5,
    pulsePhase: Math.random() * Math.PI * 2,
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
  
  // Draw pools first (underneath)
  shadowPools.forEach((pool: ShadowPool) => {
    pool.pulsePhase += 0.01
    
    if (pool.growing) {
      pool.radius += 0.2
      pool.opacity = Math.min(1, pool.opacity + 0.005)
      if (pool.radius >= pool.maxRadius) {
        pool.growing = false
      }
    } else {
      pool.opacity -= 0.003
      if (pool.opacity <= 0) {
        // Reset
        pool.x = Math.random() * width
        pool.y = Math.random() * height
        pool.radius = 0
        pool.maxRadius = 80 + Math.random() * 120
        pool.opacity = 0
        pool.growing = true
      }
    }
    
    const pulseScale = 1 + Math.sin(pool.pulsePhase) * 0.05
    const currentRadius = pool.radius * pulseScale
    const currentOpacity = pool.opacity * intensity * 0.2
    
    if (currentOpacity < 0.01) return
    
    const gradient = ctx.createRadialGradient(pool.x, pool.y, 0, pool.x, pool.y, currentRadius)
    gradient.addColorStop(0, `hsla(260, 30%, 3%, ${currentOpacity})`)
    gradient.addColorStop(0.4, `hsla(260, 25%, 5%, ${currentOpacity * 0.7})`)
    gradient.addColorStop(0.7, `hsla(260, 20%, 7%, ${currentOpacity * 0.3})`)
    gradient.addColorStop(1, `hsla(260, 15%, 10%, 0)`)
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(pool.x, pool.y, currentRadius, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // Draw tendrils
  shadowTendrils.forEach((tendril: ShadowTendril) => {
    tendril.phase += 0.02
    
    if (tendril.growing) {
      tendril.length += tendril.speed
      tendril.opacity = Math.min(1, tendril.opacity + 0.008)
      if (tendril.length >= tendril.maxLength) {
        tendril.growing = false
      }
    } else {
      tendril.opacity -= 0.004
      if (tendril.opacity <= 0) {
        // Reset
        Object.assign(tendril, createShadowTendril(width, height))
      }
    }
    
    const currentOpacity = tendril.opacity * intensity * 0.25
    if (currentOpacity < 0.01) return
    
    // Draw tendril as series of connected circles
    ctx.beginPath()
    
    let x = tendril.startX
    let y = tendril.startY
    let angle = tendril.angle
    
    for (let i = 0; i < tendril.segments; i++) {
      const segmentLength = tendril.length / tendril.segments
      const progress = i / tendril.segments
      const waveOffset = Math.sin(tendril.phase + i * 0.5) * 15 * progress
      
      const nextX = x + Math.cos(angle) * segmentLength + Math.cos(angle + Math.PI / 2) * waveOffset
      const nextY = y + Math.sin(angle) * segmentLength + Math.sin(angle + Math.PI / 2) * waveOffset
      
      const segmentWidth = tendril.width * (1 - progress * 0.7)
      const segmentOpacity = currentOpacity * (1 - progress * 0.5)
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, segmentWidth)
      gradient.addColorStop(0, `hsla(260, 25%, 5%, ${segmentOpacity})`)
      gradient.addColorStop(0.5, `hsla(260, 20%, 7%, ${segmentOpacity * 0.5})`)
      gradient.addColorStop(1, `hsla(260, 15%, 10%, 0)`)
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, segmentWidth, 0, Math.PI * 2)
      ctx.fill()
      
      x = nextX
      y = nextY
      angle += (Math.random() - 0.5) * 0.1
    }
  })
}
