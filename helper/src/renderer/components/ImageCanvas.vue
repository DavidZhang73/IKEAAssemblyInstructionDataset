<template>
  <div class="relative border-2 border-gray-400">
    <img
        style="height: calc(100vh - 212px - 3.5rem)"
        :src="$store.getters.currentPage.localUrl"
        alt="page"
        @load="handleImgLoad"
    >
    <canvas
        class="absolute top-0"
        style="height: calc(100vh - 212px - 3.5rem)"
        :style="{cursor: cursor}"
        ref="canvasRef"
        @mousemove="handleMousemove"
        @mouseout="handleMouseupAndMouseout"
        @mousedown="handleMousedown"
        @mouseup="handleMouseupAndMouseout"
        @mouseenter="handleMouseenter"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, toRaw, watch } from 'vue'
import { ObjectAnnotation } from '~/libs/annotationlib.js'
import { useStore } from 'vuex'

const store = useStore()

const canvasRef = ref()

let imageHeight
let imageWidth

const draw = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, imageWidth, imageHeight)
  for (let annotation of store.getters.currentCanvasAnnotationList) {
    annotation.draw(ctx)
  }
}

const handleImgLoad = (e) => {
  const { naturalHeight: height, naturalWidth: width } = e.target
  imageHeight = height
  imageWidth = width
  const canvasElement = canvasRef.value
  canvasElement.height = height
  canvasElement.width = width
  draw()
}

watch(() => store.getters.currentCanvasAnnotationList, () => {
  draw()
}, { deep: true })

let createContext
let activeContext
let dragContext
const cursor = ref('auto')
const getMouseLocation = (event) => {
  const canvasElement = canvasRef.value
  const mouseX = event.offsetX / canvasElement.clientWidth * imageWidth
  const mouseY = event.offsetY / canvasElement.clientHeight * imageHeight
  return [mouseX, mouseY]
}
const handleMousemove = (event) => {
  event.preventDefault()
  const [mouseX, mouseY] = getMouseLocation(event)
  // creating an object
  if (createContext) {
    const activeAnnotation = store.getters.currentAnnotationList[createContext.index]
    const deltaX = mouseX - createContext.mousedownX
    const deltaY = mouseY - createContext.mousedownY
    activeAnnotation.resize(
        createContext.x,
        createContext.y,
        deltaX,
        deltaY
    )
  }
  // drag the object
  if (dragContext) {
    const activeAnnotation = store.getters.currentAnnotationList[dragContext.index]
    const deltaX = mouseX - dragContext.mousedownX
    const deltaY = mouseY - dragContext.mousedownY
    if (dragContext.type === 'moving') {
      activeAnnotation.resize(
          dragContext.x + deltaX,
          dragContext.y + deltaY
      )
    } else if (dragContext.type === 'cornerSizing') {
      const oppositeAnchor = dragContext.oppositeAnchor
      activeAnnotation.resize(
          oppositeAnchor.x,
          oppositeAnchor.y,
          (oppositeAnchor.x > dragContext.x ? -dragContext.width : dragContext.width) + deltaX,
          (oppositeAnchor.y > dragContext.y ? -dragContext.height : dragContext.height) + deltaY
      )
    } else if (dragContext.type === 'topSizing') {
      activeAnnotation.resize(
          undefined,
          mouseY,
          undefined,
          dragContext.height - deltaY
      )
    } else if (dragContext.type === 'bottomSizing') {
      activeAnnotation.resize(
          undefined,
          mouseY > dragContext.y ? dragContext.y : mouseY,
          undefined,
          mouseY > dragContext.y ? dragContext.height + deltaY : dragContext.y - mouseY
      )
    } else if (dragContext.type === 'leftSizing') {
      activeAnnotation.resize(
          mouseX,
          undefined,
          dragContext.width - deltaX
      )
    } else if (dragContext.type === 'rightSizing') {
      activeAnnotation.resize(
          mouseX > dragContext.x ? dragContext.x : mouseX,
          undefined,
          mouseX > dragContext.x ? dragContext.width + deltaX : dragContext.x - mouseX
      )
    }
  }
  // highlight the object
  let found = null
  for (let i = 0; i < store.getters.currentAnnotationList.length; i++) {
    const objectAnnotation = store.getters.currentAnnotationList[i]
    if (objectAnnotation.page === store.getters.currentPageIndex) {
      if (!found && objectAnnotation.nearTopLeftAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'nw-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearTopAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'n-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearTopRightAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'ne-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearLeftAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'w-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearRightAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'e-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearBottomLeftAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'sw-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearBottomAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 's-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearBottomRightAnchor(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'se-resize'
        objectAnnotation.highlight = true
        found = i
      } else if (!found && objectAnnotation.nearBoundary(mouseX, mouseY)) {
        if (!dragContext) cursor.value = 'grab'
        objectAnnotation.highlight = true
        found = i
      } else {
        objectAnnotation.highlight = false
      }
    }
  }
  if (typeof (found) === 'number') {
    activeContext = {
      index: found
    }
    store.dispatch('saveCurrentAnnotationList', toRaw(store.getters.currentAnnotationList))
  } else {
    activeContext = null
    cursor.value = 'crosshair'
  }
}
const handleMousedown = (event) => {
  const [mouseX, mouseY] = getMouseLocation(event)
  // drag
  let found = false
  for (let i = 0; i < store.getters.currentAnnotationList.length; i++) {
    let objectAnnotation = store.getters.currentAnnotationList[i]
    if (objectAnnotation.page === store.getters.currentPageIndex) {
      if (objectAnnotation.highlight) {
        found = true
        let type = 'moving'
        if (objectAnnotation.nearTopLeftAnchor(mouseX, mouseY) ||
            objectAnnotation.nearTopRightAnchor(mouseX, mouseY) ||
            objectAnnotation.nearBottomLeftAnchor(mouseX, mouseY) ||
            objectAnnotation.nearBottomRightAnchor(mouseX, mouseY)) {
          type = 'cornerSizing'
        } else if (objectAnnotation.nearTopAnchor(mouseX, mouseY)) {
          type = 'topSizing'
        } else if (objectAnnotation.nearBottomAnchor(mouseX, mouseY)) {
          type = 'bottomSizing'
        } else if (objectAnnotation.nearLeftAnchor(mouseX, mouseY)) {
          type = 'leftSizing'
        } else if (objectAnnotation.nearRightAnchor(mouseX, mouseY)) {
          type = 'rightSizing'
        }
        dragContext = {
          index: i,
          type: type,
          x: objectAnnotation.x,
          y: objectAnnotation.y,
          width: objectAnnotation.width,
          height: objectAnnotation.height,
          mousedownX: mouseX,
          mousedownY: mouseY,
          oppositeAnchor: type === 'cornerSizing' ? objectAnnotation.oppositeAnchor(mouseX, mouseY) : null
        }
        break
      }
    }
  }
  // creating an object
  if (!found && !createContext) {
    const objectAnnotation = new ObjectAnnotation(
        mouseX, mouseY, 0, 0,
        store.getters.currentManualIndex,
        store.getters.currentPageIndex,
        store.getters.currentAnnotationList.length
    )
    createContext = {
      index: store.getters.currentAnnotationList.length,
      x: objectAnnotation.x,
      y: objectAnnotation.y,
      mousedownX: mouseX,
      mousedownY: mouseY
    }
    store.dispatch('saveCurrentAnnotationList', [...toRaw(store.getters.currentAnnotationList), objectAnnotation])
  }
}
const handleMouseupAndMouseout = (event) => {
  event.preventDefault()
  if (createContext) {
    const activeAnnotation = store.getters.currentAnnotationList[createContext.index]
    if (activeAnnotation.width < 8 || activeAnnotation.height < 8) {
      store.dispatch('saveCurrentAnnotationList',
          toRaw(store.getters.currentAnnotationList).filter((annotation, index) => index !== createContext.index)
      )
    } else {
      createContext = null
    }
    createContext = null
  }
  if (dragContext && event.type === 'mouseup') {
    dragContext = null
  }
}
const handleMouseenter = (event) => {
  event.preventDefault()
  // if left button of mouse is not pressed when entering the canvas, drag stops
  if (event.buttons !== 1 && dragContext) {
    dragContext = null
  }
}
</script>
