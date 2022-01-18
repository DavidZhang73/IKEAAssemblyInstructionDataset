<template>
  <div class="flex">
    <div class="w-1/2">
      <div class="flex">
        <button
            class="flex-grow"
            :class="[{'bg-indigo-400': $store.getters.currentManualIndex === annotation.manual && $store.getters.currentPageIndex === annotation.page && annotation.step === currentAnnotationIndex }]"
            v-for="(annotation, index) in $store.getters.currentAnnotationList"
            @click="handleAnnotationClick(annotation)"
        >{{ index + 1 }}
        </button>
      </div>
      <div class="flex items-center justify-center gap-x-4 py-4">
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
    <div class="w-1/2">
      <div class="flex">
        <button
            class="flex-grow"
            :class="[{'bg-indigo-400': $store.getters.currentVideoIndex === index}]"
            v-for="(video, index) in $store.getters.currentVideoList"
            @click="handleVideoClick(index)"
        >{{ video.url.split('watch?v=')[1] }}
        </button>
      </div>
      <div
          id="videoPlayer"
          class="w-full h-[40vh]"
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
          Annotation
          <button
              class="rounded-tr-none rounded-br-none"
              @click="handleAdd"
          >
            <PlusIcon class="w-6"/>
          </button>
          <button
              class="rounded-tl-none rounded-bl-none"
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
      <td>{{ annotation.start }}
        <button @click="handleLocateStart(index)">
          <LocationMarkerIcon class="w-6"/>
        </button>
      </td>
      <td>{{ annotation.end }}
        <button @click="handleLocateEnd(index)">
          <LocationMarkerIcon class="w-6"/>
        </button>
      </td>
      <td>
        <input
            class="w-full"
            type="text"
            v-model="annotation.description"
        />
      </td>
      <td>{{ annotation.manual + 1 }}</td>
      <td>{{ annotation.page + 1 }}</td>
      <td>{{ annotation.step + 1 }}</td>
      <td>{{ (annotation.end - annotation.start).toFixed(2) }}</td>
      <td>
        <button
            class="rounded-tr-none rounded-br-none"
            @click="handleLocate"
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

const store = useStore()
const canvasRef = ref()
let player

let imageHeight
let imageWidth

onMounted(() => {
  player = YTPlayer('videoPlayer')
  player.loadVideoById(store.getters.currentVideo.url.split('watch?v=')[1])
})

const draw = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, imageWidth, imageHeight)
  for (let annotation of store.getters.currentAnnotationList) {
    if (annotation.page === store.getters.currentPageIndex) {
      annotation.draw(ctx)
    }
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

const currentAnnotationIndex = ref(0)

const handleAnnotationClick = (annotation) => {
  store.commit('setCurrentManualIndex', annotation.manual)
  store.commit('setCurrentPageIndex', annotation.page)
  currentAnnotationIndex.value = annotation.step
}

const handleVideoClick = (index) => {
  store.commit('setCurrentVideoIndex', index)
  player.loadVideoById(store.getters.currentVideo.url.split('watch?v=')[1])
}

watch(() => store.getters.currentAnnotationList, () => {
  draw()
}, { deep: true })

const getCurrentVideoTime = async () => {
  return (await player.getCurrentTime()).toFixed(2)
}

const handleAdd = async () => {
  const start = await getCurrentVideoTime()
  const action = new ActionAnnotation(
      start,
      start,
      store.getters.currentManualIndex,
      store.getters.currentPageIndex,
      currentAnnotationIndex)
  store.commit('setCurrentVideoAnnotationList', [...toRaw(store.getters.currentVideoAnnotationList), action])
}

const handleDeleteAll = () => {
  store.commit('setCurrentVideoAnnotationList', [])
}

const handleLocateStart = async (index) => {
  store.getters.currentVideoAnnotationList[index].start = await getCurrentVideoTime()
}

const handleLocateEnd = async (index) => {
  store.getters.currentVideoAnnotationList[index].end = await getCurrentVideoTime()
}

const handlePrev = () => {
  if (store.getters.currentPageIndex !== 0) {
    store.commit('setCurrentPageIndex', store.getters.currentPageIndex - 1)
  }
}

const handleNext = () => {
  if (store.getters.currentPageIndex !== store.getters.currentManual.pageList.length - 1) {
    store.commit('setCurrentPageIndex', store.getters.currentPageIndex + 1)
  }
}

const handleFirst = () => {
  store.commit('setCurrentPageIndex', 0)
}

const handleLast = () => {
  store.commit('setCurrentPageIndex', store.getters.currentManual.pageList.length - 1)
}

const handleLocate = () => {

}

const handleMoveUp = (index) => {
  // if (index - 1 >= 0) {
  //   const localAnnotationList = toRaw(store.getters.currentAnnotationList);
  //   [
  //     localAnnotationList[index - 1].step,
  //     localAnnotationList[index].step
  //   ] = [
  //     localAnnotationList[index].step,
  //     localAnnotationList[index - 1].step
  //   ];
  //   [
  //     localAnnotationList[index - 1], localAnnotationList[index]
  //   ] = [
  //     localAnnotationList[index],
  //     localAnnotationList[index - 1]
  //   ]
  //   store.dispatch('saveCurrentAnnotationList', [...localAnnotationList])
  // }
}

const handleMoveDown = (index) => {
  // const localAnnotationList = toRaw(store.getters.currentAnnotationList)
  // if (index + 1 < localAnnotationList.length) {
  //   [
  //     localAnnotationList[index + 1].step,
  //     localAnnotationList[index].step
  //   ] = [
  //     localAnnotationList[index].step,
  //     localAnnotationList[index + 1].step
  //   ];
  //   [
  //     localAnnotationList[index + 1], localAnnotationList[index]
  //   ] = [
  //     localAnnotationList[index],
  //     localAnnotationList[index + 1]
  //   ]
  //   store.dispatch('saveCurrentAnnotationList', [...localAnnotationList])
  // }
}

const handleDelete = (index) => {
  // const localAnnotationList = toRaw(store.getters.currentAnnotationList)
  // localAnnotationList.splice(index, 1)
  // for (let i in localAnnotationList) {
  //   localAnnotationList[i].step = parseInt(i)
  // }
  // store.dispatch('saveCurrentAnnotationList', [...localAnnotationList])
}
</script>
