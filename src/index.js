import { WebfontLoaderPlugin } from 'pixi-webfont-loader'
import { Application, Container, Graphics, Loader, Sprite, Text, TextStyle, Texture } from 'pixi.js'

import { getRandomNubmer } from './helpers'
import './styles/styles.css'

class Gameplay {
  app

  scene

  circleInterval

  lives = 3

  score = 0

  items = []

  constructor(scene, params) {
    this.app = new Application(params)
    this.scene = scene

    this.scene.appendChild(this.app.view)
  }

  start() {
    // Load fonts
    Loader.registerPlugin(WebfontLoaderPlugin)
    Loader.shared.add({
      name: 'Candal',
      url: 'https://fonts.googleapis.com/css2?family=Candal&display=swap'
    })

    Loader.shared.onComplete.once(() => {
      // Create game parts
      this.createGameplay()
      this.createStatusbar()
    })

    Loader.shared.load()

    this.app.ticker.add(delta => {
      this.items.forEach(({ id, active, graphics, weight }) => {
        if (active) {
          graphics.y += weight + delta
        } else {
          this.removeCircle(id)
        }
      })
    })
  }

  end() {}

  createContainer() {
    const container = new Container()
    this.app.stage.addChild(container)

    return container
  }

  createStatusbar() {
    // Create container for status bar
    const statusbarContainer = this.createContainer()
    this.app.stage.addChild(statusbarContainer)

    // Create bg
    const graphics = new Graphics()
    graphics.beginFill(0x002a2c)
    graphics.drawRect(0, 0, this.scene.clientWidth, 50)
    graphics.endFill()

    // Create lives text
    const text = new Text(
      `Lives: ${this.lives}`,
      new TextStyle({
        fontFamily: 'Candal',
        fontSize: 26,
        fontWeight: 'bold',
        fill: '#008e94',
        stroke: '#002526',
        strokeThickness: 1,
        lineJoin: 'round'
      })
    )
    text.x = 25
    text.y = 25 - text.height / 2

    // Add all to the container
    statusbarContainer.addChild(graphics)
    statusbarContainer.addChild(text)
  }

  createGameplay() {
    // Creating container for the circles
    const circlesContainer = this.createContainer()
    this.app.stage.addChild(circlesContainer)

    // Creating circles each 500ms
    this.circleInterval = setInterval(() => {
      const circle = this.createCircle()
      // Push each new circle to the state
      this.items.push(circle)
      // Append circle item itself
      circlesContainer.addChild(circle.graphics)
    }, 1000)
  }

  createCircle() {
    const id = getRandomNubmer(0, 9999999)
    const active = true
    // Set fall speed
    const weight = getRandomNubmer(0, 5)
    // Get random circle radius
    const radius = getRandomNubmer(20, 70)
    // Get random horizontal position
    const xPos = getRandomNubmer(radius / 2, this.scene.clientWidth - radius / 2)
    // Get vertical position above viewport
    const yPos = -radius
    // Create cricle element
    const graphics = new Graphics()
    graphics.beginFill(0xffffff)
    graphics.drawCircle(0, 0, radius)
    graphics.position.set(xPos, yPos)
    graphics.interactive = true
    graphics.buttonMode = true
    graphics.endFill()
    // Create circle item
    const circle = { id, active, weight, graphics }
    // Handle remove event on touch
    graphics.on('mousedown', () => this.disableCircle(id)).on('touchstart', () => this.disableCircle(id))

    return circle
  }

  disableCircle(id) {
    // Search for item by id
    const { graphics } = this.items.find(({ id: itemId }) => itemId === id) || {}

    if (graphics) {
      // Change graphics status
      this.items = this.items.map(item => (item.id === id ? { ...item, active: false } : item))
      graphics.interactive = false
    }
  }

  removeCircle(id) {
    const { graphics } = this.items.find(({ id: itemId }) => itemId === id) || {}

    if (graphics && (graphics.scale.x < 0 || graphics.scale.y < 0)) {
      // Remove graphics
      this.items = this.items.filter(item => item.id !== id)
      graphics.destroy()
    } else {
      // Scale down the graphics
      graphics.scale.set(graphics.scale.x - 0.1, graphics.scale.y - 0.1)
    }
  }
}

// Get scene and params
const scene = document.querySelector('#scene')
const params = {
  width: scene?.clientWidth,
  height: scene?.clientHeight,
  backgroundColor: 0x008e94
}
// Create the app instance
const app = new Gameplay(scene, params)
app.start()
