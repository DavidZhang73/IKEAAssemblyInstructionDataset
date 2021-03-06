<template>
  <div v-if="$store.getters.currentVideo">
    <div class="flex">
      <div class="w-1/2 py-2">
        <div class="flex flex-wrap">
          <button
              :class="[{'bg-indigo-400': $store.getters.currentManualIndex === annotation.manual && $store.getters.currentPageIndex === annotation.page && annotation.step === currentAnnotationStep }]"
              v-for="(annotation, index) in $store.getters.currentAnnotationList"
              @click="handleAnnotationClick(annotation)"
          >{{ index + 1 }}
          </button>
        </div>
        <div class="flex items-center justify-center gap-x-4">
          <div>
            <button
                class="rounded-tr-none rounded-br-none"
                @click="handleFirst"
            >
              <ChevronDoubleLeftIcon class="w-6"/>
            </button>
            <button
                class="rounded-tl-none rounded-bl-none"
                @click="handlePrev"
            >
              <ChevronLeftIcon class="w-6"/>
            </button>
          </div>
          <div class="relative">
            <img
                class="h-[40vh]"
                :src="$store.getters.currentPage.localUrl"
                alt="page"
                @load="handleImgLoad"
            >
            <canvas
                class="absolute top-0 h-[40vh]"
                ref="canvasRef"
            ></canvas>
          </div>
          <div>
            <button
                class="rounded-tr-none rounded-br-none"
                @click="handleNext"
            >
              <ChevronRightIcon class="w-6"/>
            </button>
            <button
                class="rounded-tl-none rounded-bl-none"
                @click="handleLast"
            >
              <ChevronDoubleRightIcon class="w-6"/>
            </button>
          </div>
        </div>
        <div class="text-center">{{ $store.getters.currentPageIndex + 1 }} /
          {{ $store.getters.currentManual.pageList.length }}
        </div>
      </div>
      <div class="w-1/2 py-2">
        <div class="flex flex-wrap">
          <button
              class="overflow-hidden overflow-ellipsis"
              :class="[{'bg-indigo-400': $store.getters.currentVideoIndex === index}]"
              v-for="(video, index) in $store.getters.currentVideoList"
              @click="handleVideoClick(index)"
          >{{ video.url.split('watch?v=')[1] }}
          </button>
        </div>
        <div
            id="videoPlayer"
            class="w-full"
            style="height: calc(40vh + 24px)"
            v-if="$store.getters.currentVideo"
        >
        </div>
      </div>
    </div>
    <table class="w-full">
      <thead>
      <tr>
        <th colspan="8">
          <div class="inline">
            <span class="px-4 align-middle">Annotation</span>
            <button
                class="align-middle rounded-tr-none rounded-br-none"
                @click="handleAdd"
            >
              <PlusIcon class="w-6"/>
            </button>
            <button
                class="align-middle rounded-tl-none rounded-bl-none"
                @click="handleDeleteAll"
            >
              <TrashIcon class="text-red-500 w-6"/>
            </button>
          </div>
        </th>
      </tr>
      <tr>
        <th>start</th>
        <th>end</th>
        <th>description</th>
        <th>manual</th>
        <th>page</th>
        <th>step</th>
        <th>duration</th>
        <th>operation</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(annotation, index) in $store.getters.currentVideoAnnotationList">
        <td>
          <span class="align-middle pr-2">{{ utils.formatDuration(annotation.start) }}</span>
          <button
              class="align-middle rounded-tr-none rounded-br-none"
              @click="handleLocateStart(index)"
          >
            <ZoomInIcon class="w-6"/>
          </button>
          <button
              class="align-middle rounded-tl-none rounded-bl-none"
              @click="handleSetStart(index)"
          >
            <LocationMarkerIcon class="w-6"/>
          </button>
        </td>
        <td>
          <span class="align-middle pr-2">{{ utils.formatDuration(annotation.end) }}</span>
          <button
              class="align-middle rounded-tr-none rounded-br-none"
              @click="handleLocateEnd(index)"
          >
            <ZoomInIcon class="w-6"/>
          </button>
          <button
              class="align-middle rounded-tl-none rounded-bl-none"
              @click="handleSetEnd(index)"
          >
            <LocationMarkerIcon class="w-6"/>
          </button>
        </td>
        <td>
          <input
              class="w-full"
              type="text"
              v-model="annotation.description"
              @input="handleAnnotationDescriptionInput"
          />
        </td>
        <td>{{ annotation.manual + 1 }}</td>
        <td>{{ annotation.page + 1 }}</td>
        <td>
          <span class="align-middle pr-2">{{ annotation.step + 1 }}</span>
          <button
              @click="handleLocateStep(index)"
              class="align-middle"
          >
            <LocationMarkerIcon class="w-6"/>
          </button>
        </td>
        <td>{{ (annotation.end - annotation.start).toFixed(2) }}s</td>
        <td>
          <button
              class="rounded-tr-none rounded-br-none"
              @click="handleLocate(annotation)"
          >
            <ZoomInIcon class="w-6"/>
          </button>
          <button
              class="rounded-none"
              @click="handleMoveUp(index)"
          >
            <ArrowUpIcon class="w-6"/>
          </button>
          <button
              class="rounded-none"
              @click="handleMoveDown(index)"
          >
            <ArrowDownIcon class="w-6"/>
          </button>
          <button
              class="rounded-tl-none rounded-bl-none text-red-600"
              @click="handleDelete(index)"
          >
            <TrashIcon class="w-6"/>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div
      v-else
      class="text-3xl h-full flex items-center justify-center"
  >
    Please add a video first!
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { onMounted, ref, toRaw, watch } from 'vue'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LocationMarkerIcon,
  PlusIcon,
  TrashIcon,
  ZoomInIcon
} from '@heroicons/vue/solid'
import { ActionAnnotation } from '~/libs/annotationlib.js'
import YTPlayer from 'youtube-player'
import utils from '~/libs/utils.js'

const store = useStore()
const canvasRef = ref()
let player

let imageHeight
let imageWidth

const currentAnnotationStep = ref(0)

const _locateByAnnotation = (annotation) => {
  store.commit('setCurrentManualIndex', annotation.manual)
  store.commit('setCurrentPageIndex', annotation.page)
  currentAnnotationStep.value = annotation.step
}

onMounted(() => {
  if (store.getters.currentVideo) {
    player = YTPlayer('videoPlayer')
    player.loadVideoById(store.getters.currentVideo.url.split('watch?v=')[1])
    if (store.getters.currentAnnotationList && store.getters.currentAnnotationList.length !== 0) {
      _locateByAnnotation(store.getters.currentAnnotationList[0])
    }
    watch(() => [store.getters.currentAnnotationList, currentAnnotationStep.value], () => {
      if (store.getters.currentVideo) {
        draw()
      }
    }, { deep: true })
  }
})

const draw = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, imageWidth, imageHeight)
  for (let annotation of store.getters.currentCanvasAnnotationList) {
    if (annotation.step === currentAnnotationStep.value) {
      annotation.highlight = true
    }
    annotation.draw(ctx)
    annotation.highlight = false
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

const handleAnnotationClick = (annotation) => {
  _locateByAnnotation(annotation)
}

const handleVideoClick = (index) => {
  store.commit('setCurrentVideoIndex', index)
  player.loadVideoById(store.getters.currentVideo.url.split('watch?v=')[1])
}

const getCurrentVideoTime = async () => {
  return await player.getCurrentTime()
}

const handleAdd = async () => {
  const start = await getCurrentVideoTime()
  const action = new ActionAnnotation(
      start,
      start,
      store.getters.currentManualIndex,
      store.getters.currentPageIndex,
      currentAnnotationStep.value
  )
  await store.dispatch('saveCurrentVideoAnnotationList', [...toRaw(store.getters.currentVideoAnnotationList), action])
}

const handleDeleteAll = async () => {
  await store.dispatch('saveCurrentVideoAnnotationList', [])
}

const handleLocateStart = async (index) => {
  const currentVideoAnnotation = toRaw(store.getters.currentVideoAnnotationList)[index]
  await player.seekTo(currentVideoAnnotation.start)
  await player.pauseVideo()
}

const handleLocateEnd = async (index) => {
  const currentVideoAnnotation = toRaw(store.getters.currentVideoAnnotationList)[index]
  await player.seekTo(currentVideoAnnotation.end)
  await player.pauseVideo()
}

const handleSetStart = async (index) => {
  const videoAnnotationList = toRaw(store.getters.currentVideoAnnotationList)
  const currentVideoTime = await getCurrentVideoTime()
  videoAnnotationList[index].start = currentVideoTime
  if (currentVideoTime > videoAnnotationList[index].end) {
    videoAnnotationList[index].end = currentVideoTime
  }
  await store.dispatch('saveCurrentVideoAnnotationList', videoAnnotationList)
}

const handleSetEnd = async (index) => {
  const videoAnnotationList = toRaw(store.getters.currentVideoAnnotationList)
  const currentVideoTime = await getCurrentVideoTime()
  videoAnnotationList[index].end = currentVideoTime
  if (currentVideoTime < videoAnnotationList[index].start) {
    videoAnnotationList[index].start = currentVideoTime
  }
  await store.dispatch('saveCurrentVideoAnnotationList', videoAnnotationList)
}

const handlePrev = () => {
  if (store.getters.currentAnnotationList
      && store.getters.currentAnnotationList.length !== 0
      && currentAnnotationStep.value !== 0) {
    _locateByAnnotation(store.getters.currentAnnotationList[currentAnnotationStep.value - 1])
  }
}

const handleNext = () => {
  if (store.getters.currentAnnotationList
      && store.getters.currentAnnotationList.length !== 0
      && currentAnnotationStep.value !== store.getters.currentAnnotationList.length - 1) {
    _locateByAnnotation(store.getters.currentAnnotationList[currentAnnotationStep.value + 1])
  }
}

const handleFirst = () => {
  if (store.getters.currentAnnotationList && store.getters.currentAnnotationList.length !== 0) {
    _locateByAnnotation(store.getters.currentAnnotationList[0])
  }
}

const handleLast = () => {
  if (store.getters.currentAnnotationList && store.getters.currentAnnotationList.length !== 0) {
    _locateByAnnotation(store.getters.currentAnnotationList[store.getters.currentAnnotationList.length - 1])
  }
}

const handleAnnotationDescriptionInput = () => {
  const localAnnotationList = toRaw(store.getters.currentVideoAnnotationList)
  store.dispatch('saveCurrentVideoAnnotationList', [...localAnnotationList])
}

const handleLocateStep = (index) => {
  const localAnnotationList = toRaw(store.getters.currentVideoAnnotationList)
  localAnnotationList[index].manual = store.getters.currentManualIndex
  localAnnotationList[index].page = store.getters.currentPageIndex
  localAnnotationList[index].step = currentAnnotationStep.value
  store.dispatch('saveCurrentVideoAnnotationList', [...localAnnotationList])
}

const handleLocate = async (annotation) => {
  store.commit('setCurrentManualIndex', annotation.manual)
  store.commit('setCurrentPageIndex', annotation.page)
  currentAnnotationStep.value = annotation.step
  await player.seekTo(annotation.start)
  await player.playVideo()
}

const handleMoveUp = (index) => {
  if (index - 1 >= 0) {
    const localAnnotationList = toRaw(store.getters.currentVideoAnnotationList);
    [
      localAnnotationList[index - 1], localAnnotationList[index]
    ] = [
      localAnnotationList[index],
      localAnnotationList[index - 1]
    ]
    store.dispatch('saveCurrentVideoAnnotationList', [...localAnnotationList])
  }
}

const handleMoveDown = (index) => {
  const localAnnotationList = toRaw(store.getters.currentVideoAnnotationList)
  if (index + 1 < localAnnotationList.length) {
    [
      localAnnotationList[index + 1], localAnnotationList[index]
    ] = [
      localAnnotationList[index],
      localAnnotationList[index + 1]
    ]
    store.dispatch('saveCurrentVideoAnnotationList', [...localAnnotationList])
  }
}

const handleDelete = (index) => {
  const localAnnotationList = toRaw(store.getters.currentVideoAnnotationList)
  localAnnotationList.splice(index, 1)
  store.dispatch('saveCurrentVideoAnnotationList', [...localAnnotationList])
}
</script>
