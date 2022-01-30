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
  async getFileURL (pathname) {
    const { result } = await window.api.invoke('get-binary-file', { pathname })
    return URL.createObjectURL(new Blob([result]))
  }
}
