/**
 * Library for annotations
 */

import utils from './utils.js'

const Proximity = 20

class ObjectAnnotation {

  constructor (x, y, width, height, manual, page = 0, step = 0, color = null) {
    this.highlight = false
    this.manual = manual
    this.page = page
    this.step = step
    if (!color) {
      this.color = utils.randomColor()
    } else {
      this.color = color
    }
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  /**
   * Draw on canvas
   * @param ctx: canvas context
   */
  draw (ctx) {
    const u = this.x
    const v = this.y
    const w = this.width
    const h = this.height
    // draw the boundaries
    const unitLineWidth = ctx.canvas.width / 500
    let lineWidth = this.highlight ? 4 * unitLineWidth : 2 * unitLineWidth
    ctx.lineWidth = lineWidth + 2 * unitLineWidth
    ctx.strokeStyle = '#000000'
    ctx.strokeRect(u, v, w, h)
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = this.color
    ctx.strokeRect(u, v, w, h)
    // draw the handles
    const pointList = [
      { // top left
        x: u,
        y: v
      },
      { // top
        x: u + w / 2,
        y: v
      },
      { // top right
        x: u + w,
        y: v
      },
      { // left
        x: u,
        y: v + h / 2
      },
      { // right
        x: u + w,
        y: v + h / 2
      },
      { // bottom left
        x: u,
        y: v + h
      },
      { // bottom
        x: u + w / 2,
        y: v + h
      },
      { // bottom right
        x: u + w,
        y: v + h
      }
    ]
    for (const point of pointList) {
      const x = point.x
      const y = point.y
      ctx.fillStyle = '#000000'
      const size = this.highlight ? 6 * unitLineWidth : 5 * unitLineWidth
      ctx.fillRect(x - size, y - size, size * 2, size * 2)
      ctx.fillStyle = this.color
      ctx.fillRect(x - size + unitLineWidth, y - size + unitLineWidth,
        size * 2 - 2 * unitLineWidth,
        size * 2 - 2 * unitLineWidth)
    }
  }

  /**
   * Self-clone
   * @returns {ObjectAnnotation}
   */
  clone () {
    return new ObjectAnnotation(
      this.x,
      this.y,
      this.width,
      this.height,
      this.manual,
      this.page,
      this.step,
      this.color
    )
  }

  /**
   * Resize object
   * @param x
   * @param y
   * @param width
   * @param height
   */
  resize (x = this.x, y = this.y, width = this.width, height = this.height) {
    if (width < 0) {
      this.x = x + width
      this.width = -width
    } else {
      this.x = x
      this.width = width
    }

    if (height < 0) {
      this.y = y + height
      this.height = -height
    } else {
      this.y = y
      this.height = height
    }
  }

  /**
   * Whether mouse is close to left boundary
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearLeftBoundary (mouseX, mouseY) {
    return Math.abs(mouseX - this.x) <= this.getProximity() &&
      mouseY < this.y + this.height - this.getProximity() &&
      mouseY > this.y + this.getProximity()
  }

  /**
   * Whether mouse is close to right boundary
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearRightBoundary (mouseX, mouseY) {
    return Math.abs(mouseX - this.x - this.width) <= this.getProximity() &&
      mouseY < this.y + this.height - this.getProximity() &&
      mouseY > this.y + this.getProximity()
  }

  /**
   * Whether mouse is close to top boundary
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearTopBoundary (mouseX, mouseY) {
    return Math.abs(mouseY - this.y) <= this.getProximity() &&
      mouseX > this.x + this.getProximity() &&
      mouseX < this.x + this.width - this.getProximity()
  }

  /**
   * Whether mouse is close to bottom boundary
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearBottomBoundary (mouseX, mouseY) {
    return Math.abs(mouseY - this.y - this.height) <= this.getProximity() &&
      mouseX > this.x + this.getProximity() &&
      mouseX < this.x + this.width - this.getProximity()
  }

  /**
   * Whether mouse is close to any boundary out of four
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearBoundary (mouseX, mouseY) {
    return this.nearLeftBoundary(mouseX, mouseY) ||
      this.nearRightBoundary(mouseX, mouseY) ||
      this.nearTopBoundary(mouseX, mouseY) ||
      this.nearBottomBoundary(mouseX, mouseY)
  }

  /**
   * Whether mouse is close to top left anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearTopLeftAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x) <= this.getProximity() &&
      Math.abs(mouseY - this.y) <= this.getProximity()
  }

  /**
   * Whether mouse is close to top anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearTopAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x - this.width / 2) <= this.getProximity() &&
      Math.abs(mouseY - this.y) <=
      this.getProximity()
  }

  /**
   * Whether mouse is close to top right anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearTopRightAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x - this.width) <= this.getProximity() &&
      Math.abs(mouseY - this.y) <=
      this.getProximity()
  }

  /**
   * Whether mouse is close to left anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearLeftAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x) <= this.getProximity() &&
      Math.abs(mouseY - this.y - this.height / 2) <=
      this.getProximity()
  }

  /**
   * Whether mouse is close to right anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearRightAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x - this.width) <= this.getProximity() &&
      Math.abs(mouseY - this.y - this.height / 2) <=
      this.getProximity()
  }

  /**
   * Whether mouse is close to bottom left anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearBottomLeftAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x) <= this.getProximity() &&
      Math.abs(mouseY - this.y - this.height) <=
      this.getProximity()
  }

  /**
   * Whether mouse is close to bottom anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearBottomAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x - this.width / 2) <= this.getProximity() &&
      Math.abs(mouseY - this.y - this.height) <=
      this.getProximity()
  }

  /**
   * Whether mouse is close to bottom right anchor
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearBottomRightAnchor (mouseX, mouseY) {
    return Math.abs(mouseX - this.x - this.width) <= this.getProximity() &&
      Math.abs(mouseY - this.y - this.height) <=
      this.getProximity()
  }

  /**
   * Whether mouse is close to any anchor out of eight
   * @param mouseX
   * @param mouseY
   * @returns {boolean}
   */
  nearAnchor (mouseX, mouseY) {
    return this.nearTopLeftAnchor(mouseX, mouseY) ||
      this.nearTopAnchor(mouseX, mouseY) ||
      this.nearTopRightAnchor(mouseX, mouseY) ||
      this.nearLeftAnchor(mouseX, mouseY) ||
      this.nearRightAnchor(mouseX, mouseY) ||
      this.nearBottomLeftAnchor(mouseX, mouseY) ||
      this.nearBottomAnchor(mouseX, mouseY) ||
      this.nearBottomRightAnchor(mouseX, mouseY)
  }

  /**
   * Get the anchor in the opposite position
   * @param mouseX
   * @param mouseY
   * @returns {null|{x: *, y: *}}
   */
  oppositeAnchor (mouseX, mouseY) {
    // top left anchor => bottom right anchor
    if (this.nearTopLeftAnchor(mouseX, mouseY)) {
      return {
        x: this.x + this.width,
        y: this.y + this.height
      }
    }
    // top right anchor => bottom left anchor
    if (this.nearTopRightAnchor(mouseX, mouseY)) {
      return {
        x: this.x,
        y: this.y + this.height
      }
    }
    // bottom left anchor => top right anchor
    if (this.nearBottomLeftAnchor(mouseX, mouseY)) {
      return {
        x: this.x + this.width,
        y: this.y
      }
    }
    // bottom right anchor => top left anchor
    if (this.nearBottomRightAnchor(mouseX, mouseY)) {
      return {
        x: this.x,
        y: this.y
      }
    }
    return null
  }

  getProximity () {
    return Proximity
  }
}

class ActionAnnotation {
  /**
   * Constructor
   * @param start
   * @param end
   * @param manual
   * @param page
   * @param step
   * @param description
   */
  constructor (
    start,
    end = null,
    manual = null,
    page = page,
    step = null,
    description = null
  ) {
    this.start = start
    this.end = end
    this.manual = manual
    this.page = page
    this.step = step
    this.description = description
  }
}

export {
  ObjectAnnotation,
  ActionAnnotation
}
