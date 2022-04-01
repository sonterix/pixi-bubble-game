import { WebfontLoaderPlugin } from 'pixi-webfont-loader'
import { Application, Container, Graphics, Loader, Text, TextStyle } from 'pixi.js'

import { getRandomNubmer } from './helpers'
import './styles/styles.css'

class Gameplay {
  app // PIXI app

  scene // Scene where the game is

  livesAmount // PIXI text object with lives count. By default 3 lives

  score = 0 // User score during the game

  pause = false // Is app paused or not

  items = [] // All active elements

  circleInterval // Interval that creates circles

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
                this.livesAmount.text = Number(this.livesAmount.text) <= 0 ? 0 : Number(this.livesAmount.text) - 1
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

    this.createEndMenu()
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
    const { btn: pauseBtn, changeText } = this.createBrandBtn('Pause')
    pauseBtn.x = this.scene.clientWidth - pauseBtn.width - 25
    pauseBtn.y = 25 - pauseBtn.height / 2
    const pauseClick = () => {
      if (this.pause) {
        changeText('Pause')
        pauseBtn.x = this.scene.clientWidth - pauseBtn.width - 25
        this.pause = false
      } else {
        changeText('Resume')
        pauseBtn.x = this.scene.clientWidth - pauseBtn.width - 25
        this.pause = true
      }
    }
    pauseBtn.on('mousedown', pauseClick).on('touchstart', pauseClick)

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

  createEndMenu() {
    // Create container for status bar
    const menuContainer = this.createContainer()
    this.app.stage.addChild(menuContainer)

    // Create bg
    const graphicsBg = new Graphics()
    graphicsBg.beginFill(0x000000, 0.01)
    graphicsBg.drawRect(0, 0, this.scene.clientWidth, this.scene.clientHeight)
    graphicsBg.endFill()
    graphicsBg.interactive = true
    menuContainer.addChild(graphicsBg)

    // Create menu
    const graphicsMenu = new Graphics()
    graphicsBg.beginFill(0x001011, 1)
    graphicsBg.drawRoundedRect(graphicsBg.width / 2 - 150, graphicsBg.height / 2 - 125, 300, 250, 20)
    graphicsBg.endFill()
    menuContainer.addChild(graphicsMenu)

    const overText = this.createBrandText('Game Over', { fill: '#ffffff', fontSize: 42 })
    overText.x = menuContainer.width / 2 - overText.width / 2
    overText.y = graphicsBg.height / 2 - 100
    menuContainer.addChild(overText)

    const scoreText = this.createBrandText(`Your Score: ${this.score}`, { fill: '#008E94', strokeThickness: 0 })
    scoreText.x = menuContainer.width / 2 - scoreText.width / 2
    scoreText.y = graphicsBg.height / 2 - 25
    menuContainer.addChild(scoreText)

    const { btn: againBtn } = this.createBrandBtn(
      'Try Again',
      { color: '#001011', fontSize: 26 },
      { width: 180, color: 0xffffff, radius: 10 }
    )
    againBtn.x = menuContainer.width / 2 - againBtn.width / 2
    againBtn.y = graphicsBg.height / 2 + 40
    const againClick = () => {
      window.location.reload()
    }
    againBtn.on('mousedown', againClick).on('touchstart', againClick)
    menuContainer.addChild(againBtn)
  }

  createBrandText(text, styles = {}) {
    const baseTextStyles = new TextStyle({
      fontFamily: 'Candal',
      fontSize: 26,
      fontWeight: 'bold',
      fill: '#008e94',
      stroke: '#002526',
      strokeThickness: 1,
      ...styles
    })

    const baseText = new Text(text, baseTextStyles)

    return baseText
  }

  createBrandBtn(text, textStyles = {}, btnStyles = {}) {
    const baseBtnStyles = new TextStyle({
      fontFamily: 'Candal',
      fontSize: 16,
      fontWeight: 'normal',
      fill: '#008E94',
      ...textStyles
    })

    // Create text for button
    const textBtn = new Text(text, baseBtnStyles)
    textBtn.anchor.set(0.5)
    textBtn.x = btnStyles?.width ? btnStyles.width / 2 : 50
    textBtn.y = (textBtn.height + 10) / 2

    // Create button
    const graphicsBtn = new Graphics()
    graphicsBtn.beginFill(btnStyles?.color || 0x001011)
    graphicsBtn.drawRoundedRect(0, 0, btnStyles?.width || 100, textBtn.height + 10, btnStyles?.radius || 6)
    graphicsBtn.endFill()
    graphicsBtn.height = textBtn.height + 10
    graphicsBtn.interactive = true
    graphicsBtn.buttonMode = true

    // Add text to graphics
    graphicsBtn.addChild(textBtn)

    // Function to change the button text
    const changeText = newText => {
      textBtn.text = newText
    }

    return { btn: graphicsBtn, changeText }
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
