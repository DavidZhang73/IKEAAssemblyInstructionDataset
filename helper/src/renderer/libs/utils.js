/**
 * Utils
 */

export default {
  /**
   * DeepClone
   * @param object
   * @returns {Object}
   */
  deepClone (object) {
    let newObject = new object.constructor
    if (object === null) return object
    if (typeof object == 'function') return new Function(
      'return ' + object.toString())()
    if (typeof object != 'object') return object
    if (object instanceof RegExp) return new RegExp(object)
    if (object instanceof Date) return new Date(object)
    for (let i in object) {
      newObject[i] = this.deepClone(object[i])
    }
    return newObject
  },
  /**
   * Generate a random color
   * @returns {string}
   */
  randomColor () {
    return `#${('000000' + (Math.random() * 16777216 | 0).toString(16)).slice(
      -6)}`
  },
  /**
   * Whether a hex color is dark or not
   * @param hex
   * @returns {boolean}
   */
  isDarkColor (hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    // hsl
    const l = (Math.min(r, g, b) + Math.max(r, g, b)) / 2
    return l < 0.5
  },
  /**
   * Convert a number to fixed 2 format
   * @param value
   * @returns {string}
   */
  toFixed2 (value) {
    if (value) {
      return value.toFixed(2)
    } else {
      return '0.00'
    }
  },
  /**
   * Get the ObjectURL of a file
   * @param pathname
   * @returns {Promise<string>}
   */
  async getFileURL (pathname) {
    const { result } = await window.api.invoke('get-binary-file', { pathname })
    return URL.createObjectURL(new Blob([result]))
  },
  /**
   * format duration in to [hh:]mm:ss
   * @param seconds
   * @returns {string}
   */
  formatDuration (seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.round(seconds % 60)
    return [
      h,
      m > 9 ? m : (h ? '0' + m : m || '0'),
      s > 9 ? s : '0' + s
    ].filter(Boolean).join(':')
  }
}
