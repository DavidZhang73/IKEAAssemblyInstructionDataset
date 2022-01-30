<template>
  <div class="h-full flex">
    <div class="flex-1 flex flex-col py-2">
      <div class="flex-grow flex items-center justify-center gap-x-4">
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
        <ImageCanvas v-if="$store.getters.currentPage.localUrl"/>
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
    <div
        class="flex-1 py-2 overflow-y-auto"
        style="height: calc(100vh - 152px - 3.5rem)"
    >
      <table class="w-full">
        <thead>
        <tr>
          <th colspan="8">
            <span class="px-4 align-middle">Annotation</span>
            <button
                class="align-middle rounded-tl-none rounded-bl-none"
                @click="handleDeleteAll"
            >
              <TrashIcon class="text-red-500 w-6"/>
            </button>
          </th>
        </tr>
        <tr>
          <th>step</th>
          <th>manual</th>
          <th>page</th>
          <th>x</th>
          <th>y</th>
          <th>height</th>
          <th>width</th>
          <th>operation</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(annotation, index) in $store.getters.currentAnnotationList">
          <td :style="{'background-color': annotation.color, 'color': utils.isDarkColor(annotation.color) ? '#ffffff' : '#000000'}">
            {{ annotation.step + 1 }}
          </td>
          <td>{{ annotation.manual + 1 }}</td>
          <td>{{ annotation.page + 1 }}</td>
          <td>{{ utils.toFixed2(annotation.x) }}</td>
          <td>{{ utils.toFixed2(annotation.y) }}</td>
          <td>{{ utils.toFixed2(annotation.height) }}</td>
          <td>{{ utils.toFixed2(annotation.width) }}</td>
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
  </div>
</template>

<script setup>
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
import utils from '~/libs/utils.js'
import { useStore } from 'vuex'

import ImageCanvas from '~/components/ImageCanvas.vue'
import { toRaw } from 'vue'

const store = useStore()

const handleLocate = (annotation) => {
  console.log(annotation)
  store.commit('setCurrentManualIndex', annotation.manual)
  store.commit('setCurrentPageIndex', annotation.page)
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

const handleDeleteAll = () => {
  store.dispatch('saveCurrentAnnotationList', [])
}

const handleMoveUp = (index) => {
  if (index - 1 >= 0) {
    const localAnnotationList = toRaw(store.getters.currentAnnotationList);
    [
      localAnnotationList[index - 1].step,
      localAnnotationList[index].step
    ] = [
      localAnnotationList[index].step,
      localAnnotationList[index - 1].step
    ];
    [
      localAnnotationList[index - 1], localAnnotationList[index]
    ] = [
      localAnnotationList[index],
      localAnnotationList[index - 1]
    ]
    store.dispatch('saveCurrentAnnotationList', [...localAnnotationList])
  }
}

const handleMoveDown = (index) => {
  const localAnnotationList = toRaw(store.getters.currentAnnotationList)
  if (index + 1 < localAnnotationList.length) {
    [
      localAnnotationList[index + 1].step,
      localAnnotationList[index].step
    ] = [
      localAnnotationList[index].step,
      localAnnotationList[index + 1].step
    ];
    [
      localAnnotationList[index + 1], localAnnotationList[index]
    ] = [
      localAnnotationList[index],
      localAnnotationList[index + 1]
    ]
    store.dispatch('saveCurrentAnnotationList', [...localAnnotationList])
  }
}

const handleDelete = (index) => {
  const localAnnotationList = toRaw(store.getters.currentAnnotationList)
  localAnnotationList.splice(index, 1)
  for (let i in localAnnotationList) {
    localAnnotationList[i].step = parseInt(i)
  }
  store.dispatch('saveCurrentAnnotationList', [...localAnnotationList])
}
</script>
