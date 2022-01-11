<template>
  <div class="flex">
    <div class="w-1/2">
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
            @click="$store.commit('setCurrentVideoIndex',index)"
        >{{ index }}
        </button>
      </div>
      <iframe
          v-if="$store.getters.currentVideo"
          class="w-full h-[40vh]"
          width="1920"
          height="1080"
          :src="$store.getters.currentVideo.url.replace('watch?v=', 'embed/')"
      >
      </iframe>
    </div>
  </div>
  <table class="w-full">
    <thead>
    <tr>
      <th colspan="7">Annotation</th>
    </tr>
    <tr>
      <th>step</th>
      <th>start</th>
      <th>end</th>
      <th>duration</th>
      <th>operation</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(annotation, index) in $store.currentVideoAnnotationList">
      <td>{{ annotation.step }}</td>
      <td>{{ annotation.start }}</td>
      <td>{{ annotation.end }}</td>
      <td>{{ annotation.end - annotation.start }}</td>
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
import { ref, watch } from 'vue'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  ZoomInIcon
} from '@heroicons/vue/solid'

const store = useStore()
const canvasRef = ref()

let imageHeight
let imageWidth

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

watch(() => store.getters.currentAnnotationList, () => {
  draw()
}, { deep: true })

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
