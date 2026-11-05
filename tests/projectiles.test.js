import { describe, it, expect, vi, afterEach } from 'vitest'

// projectiles.js does `import { c } from "./app.js"`, and app.js reads
// `document` / the <canvas> element at module-load time. Mock ./app.js so that
// importing the class under test needs no real DOM or 2D canvas context.
vi.mock('../app.js', () => ({
  c: {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    globalAlpha: 1,
    fillStyle: '',
  },
}))

import { Particle } from '../projectiles.js'

const makeParticle = (overrides = {}) =>
  new Particle({
    position: { x: 10, y: 20 },
    velocity: { x: 2, y: -3 },
    radius: 3,
    color: 'white',
    fades: false,
    ...overrides,
  })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Particle.update() [@TC-010]', () => {
  it('increments position.x and position.y by the velocity components [@TC-010]', () => {
    const particle = makeParticle({
      position: { x: 10, y: 20 },
      velocity: { x: 2, y: -3 },
    })
    const drawSpy = vi.spyOn(particle, 'draw').mockImplementation(() => {})

    particle.update()

    expect(particle.position.x).toBe(12)
    expect(particle.position.y).toBe(17)
    expect(drawSpy).toHaveBeenCalledTimes(1)
  })

  it('decrements opacity by 0.01 on each update() call when fades is true [@TC-010]', () => {
    const particle = makeParticle({ fades: true })
    vi.spyOn(particle, 'draw').mockImplementation(() => {})

    expect(particle.opacity).toBe(1)

    particle.update()
    expect(particle.opacity).toBeCloseTo(0.99, 5)

    particle.update()
    expect(particle.opacity).toBeCloseTo(0.98, 5)
  })

  it('leaves opacity unchanged when fades is false [@TC-010]', () => {
    const particle = makeParticle({ fades: false })
    vi.spyOn(particle, 'draw').mockImplementation(() => {})

    particle.update()

    expect(particle.opacity).toBe(1)
  })
})
