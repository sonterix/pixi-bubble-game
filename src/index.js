import { WebfontLoaderPlugin } from 'pixi-webfont-loader'
import { Application, Container, Graphics, Loader, Text, TextStyle } from 'pixi.js'

import { getRandomNubmer } from './helpers'
import './styles/styles.css'

class Gameplay {
  app

  scene

  livesAmount

  score = 0

  pause = false

  items = []

  circleInterval

  constructor(scene, params) {
    this.app = new Application(params)
    this.scene = scene

    this.scene.appendChild(this.app.view)
  }

  start() {
    this.loadFonts(() => {
      // Create game parts
      this.createGameplay()
      this.createStatusbar()

      // Works like FPS
      this.app.ticker.add(delta => {
        // End game if no more lives
        if (Number(this.livesAmount?.text) <= 0) {
          this.end()
        }

        // Items work
        if (!this.pause) {
          this.items.forEach(({ id, active, graphics, weight }) => {
            if (active) {
              if (graphics.y > this.scene.clientHeight + graphics.height) {
                // Remove if the circle below the screen and remove one live
                this.disableCircle(id)
                this.livesAmount.text = Number(this.livesAmount.text) - 1
              } else {
                // Move the circle to the bottom
                graphics.y += weight + delta
              }
            } else {
              this.removeCircle(id)
            }
          })
        }
      })
    })

    // Pause the game if the browser tab is not active
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.app.ticker.stop()
      } else {
        this.app.ticker.start()
      }
    })
  }

  end() {
    // Stop rendering new circles
    clearInterval(this.circleInterval)

    // Remove all circles
    this.items.forEach(({ id }) => {
      this.removeCircle(id)
    })
  }

  loadFonts(callbak) {
    // Load fonts
    Loader.registerPlugin(WebfontLoaderPlugin)
    Loader.shared.add({
      name: 'Candal',
      url: 'https://fonts.googleapis.com/css2?family=Candal&display=swap'
    })
    Loader.shared.onComplete.once(callbak)
    Loader.shared.load()
  }

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

    // Create static text
    const livesText = this.createBrandText('Lives:')
    livesText.x = 25
    livesText.y = 25 - livesText.height / 2

    // Create interactive lives counter
    this.livesAmount = this.createBrandText('3')
    this.livesAmount.x = 35 + livesText.width
    this.livesAmount.y = 25 - this.livesAmount.height / 2

    // Create pause button
    const pauseBtn = this.createBrandBtn('Pause')
    pauseBtn.x = this.scene.clientWidth - pauseBtn.width - 25
    pauseBtn.y = 25 - pauseBtn.height / 2
    pauseBtn.on('pointerdown', () => {
      if (this.pause) {
        pauseBtn.text = 'Pause'
        pauseBtn.x = this.scene.clientWidth - pauseBtn.width - 25
        this.pause = false
      } else {
        pauseBtn.text = 'Resume'
        pauseBtn.x = this.scene.clientWidth - pauseBtn.width - 25
        this.pause = true
      }
    })

    // Add all to the container
    statusbarContainer.addChild(graphics)
    statusbarContainer.addChild(livesText)
    statusbarContainer.addChild(this.livesAmount)
    statusbarContainer.addChild(pauseBtn)
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

  createBrandText(text, styles = {}) {
    const baseTextStyles = new TextStyle({
      fontFamily: 'Candal',
      fontSize: 26,
      fontWeight: 'bold',
      fill: '#008e94',
      stroke: '#002526',
      strokeThickness: 1,
      lineJoin: 'round',
      ...styles
    })

    const baseText = new Text(text, baseTextStyles)

    return baseText
  }

  createBrandBtn(text, styles = {}) {
    const baseBtnStyles = new TextStyle({
      fontFamily: 'Candal',
      fontSize: 18,
      fontWeight: 'bold',
      fill: '#008e94',
      stroke: '#002526',
      strokeThickness: 1,
      lineJoin: 'round',
      ...styles
    })

    const baseBtn = new Text(text, baseBtnStyles)

    baseBtn.interactive = true
    baseBtn.buttonMode = true

    return baseBtn
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
    // Handle remove circle on touch
    const circleClick = () => {
      if (!this.pause) {
        this.score += 1
        this.disableCircle(id)
      }
    }
    graphics.on('mousedown', circleClick).on('touchstart', circleClick)

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
