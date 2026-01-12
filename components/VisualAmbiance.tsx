'use client'

import { useEffect, useRef } from 'react'

export type AmbianceStyle = 'none' | 'geometric' | 'fireflies' | 'nebula'

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
