import { describe, it, expect, vi } from 'vitest'
import { Particle } from '../projectiles.js'

// projectiles.js imports the shared 2D context `c` from app.js, and app.js
// reads `document`/`canvas` at module load. Mock app.js so the unit test runs
// headless with no real DOM or canvas. draw() is additionally spied per
// instance below, so the stubbed `c` is never dereferenced.
vi.mock('../app.js', () => ({ c: {} }))

describe('Particle.update() [@TC-011]', () => {
  const makeParticle = (overrides = {}) =>
    new Particle({
      position: { x: 10, y: 20 },
      velocity: { x: 2, y: -3 },
      radius: 3,
      color: 'white',
      fades: false,
      ...overrides,
    })

  it('increments position by the velocity components @TC-011', () => {
    const particle = makeParticle()
    const drawSpy = vi.spyOn(particle, 'draw').mockImplementation(() => {})

    particle.update()

    expect(particle.position).toEqual({ x: 12, y: 17 })
    expect(drawSpy).toHaveBeenCalledOnce()
  })

  it('decrements opacity by 0.01 on update when fades is true @TC-011', () => {
    const particle = makeParticle({ fades: true })
    vi.spyOn(particle, 'draw').mockImplementation(() => {})

    expect(particle.opacity).toBe(1)
    particle.update()

    expect(particle.opacity).toBeCloseTo(0.99, 5)
  })

  it('leaves opacity unchanged when fades is false @TC-011', () => {
    const particle = makeParticle({ fades: false })
    vi.spyOn(particle, 'draw').mockImplementation(() => {})

    particle.update()

    expect(particle.opacity).toBe(1)
  })
})
