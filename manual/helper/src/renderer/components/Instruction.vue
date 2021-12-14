<template>
  <div class="flex items-start">
    <img
        class="h-32 p-1 hover:bg-indigo-200 hover:cursor-pointer"
        :class="[{'bg-indigo-500': currentManual === index}]"
        :src="manual.pageList[0].localUrl"
        alt="manual first"
        @click="currentManual = index"
        v-for="(manual, index) in item.manualList"
    >
  </div>
  <div class="flex py-1">
    <div class="flex-1">
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
        <ImageCanvas
            v-if="item.manualList[currentManual].pageList[currentPage].localUrl"
            :currentPage="currentPage"
            :imgLocalUrl="item.manualList[currentManual].pageList[currentPage].localUrl"
            :annotationList="localAnnotationList"
            @localAnnotationListUpdate="handleAnnotationListUpdate"
        ></ImageCanvas>
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
      <div class="text-center">{{ currentPage + 1 }} / {{ item.manualList[currentManual].pageList.length }}</div>
    </div>
    <div class="flex-1 py-4">
      <table class="w-full">
        <thead>
        <tr>
          <th colspan="7">Annotation</th>
        </tr>
        <tr>
          <th>step</th>
          <th>page</th>
          <th>x</th>
          <th>y</th>
          <th>height</th>
          <th>width</th>
          <th>operation</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(annotation, index) in localAnnotationList">
          <td :style="{'background-color': annotation.color}">{{ annotation.step }}</td>
          <td>{{ annotation.page + 1 }}</td>
          <td>{{ utils.toFixed2(annotation.x) }}</td>
          <td>{{ utils.toFixed2(annotation.y) }}</td>
          <td>{{ utils.toFixed2(annotation.height) }}</td>
          <td>{{ utils.toFixed2(annotation.width) }}</td>
          <td>
            <button
                class="rounded-tr-none rounded-br-none"
                @click="currentPage = annotation.page"
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
  <div class="flex justify-center">
    <button @click="handleSave">save</button>
  </div>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue'
import { getFileURL } from '~/utils/index.js'
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
import ImageCanvas from '~/components/ImageCanvas.vue'
import utils from '~/libs/utils.js'
import { ObjectAnnotation } from '~/libs/annotationlib.js'

const props = defineProps({
  item: Object
})
const { item } = toRefs(props)

const currentManual = ref(0)
const currentPage = ref(0)

watch(() => currentManual.value, () => {
  currentPage.value = 0
})

const localAnnotationList = ref([])
const handleAnnotationListUpdate = annotationList => {
  localAnnotationList.value = annotationList
}

watch(() => item.value, (newItem) => {
  for (let i = 0; i < newItem.manualList.length; i++) {
    getFileURL(newItem.manualList[i].pathname).then(url => {
      newItem.manualList[i].localUrl = url
    })
    for (let j = 0; j < newItem.manualList[i].pageList.length; j++) {
      getFileURL(newItem.manualList[i].pageList[j].pathname).then(url => {
        newItem.manualList[i].pageList[j].localUrl = url
      })
    }
    currentManual.value = 0
    currentPage.value = 0
  }
}, { immediate: true })

watch(() => currentManual.value, (newCurrentManual) => {
  // TODO
  localAnnotationList.value = []
  for (let i in item.value.manualList[newCurrentManual].annotationList) {
    const annotation = item.value.manualList[newCurrentManual].annotationList[i]
    localAnnotationList.value.push(
        new ObjectAnnotation(annotation.x, annotation.y, annotation.width, annotation.height, annotation.page, j))
  }
}, { immediate: true })

const handlePrev = () => {
  if (currentPage.value !== 0) {
    currentPage.value -= 1
  }
}

const handleNext = () => {
  if (currentPage.value !== item.value.manualList[currentManual.value].pageList.length - 1) {
    currentPage.value += 1
  }
}

const handleFirst = () => {
  currentPage.value = 0
}

const handleLast = () => {
  currentPage.value = item.value.manualList[currentManual.value].pageList.length - 1
}

const handleMoveUp = (index) => {
  if (index - 1 >= 0) {
    [
      localAnnotationList.value[index - 1].step,
      localAnnotationList.value[index].step
    ] = [
      localAnnotationList.value[index].step,
      localAnnotationList.value[index - 1].step
    ];
    [
      localAnnotationList.value[index - 1], localAnnotationList.value[index]
    ] = [
      localAnnotationList.value[index],
      localAnnotationList.value[index - 1]
    ]
  }
}

const handleMoveDown = (index) => {
  if (index + 1 < localAnnotationList.value.length) {
    [
      localAnnotationList.value[index + 1].step,
      localAnnotationList.value[index].step
    ] = [
      localAnnotationList.value[index].step,
      localAnnotationList.value[index + 1].step
    ];
    [
      localAnnotationList.value[index + 1], localAnnotationList.value[index]
    ] = [
      localAnnotationList.value[index],
      localAnnotationList.value[index + 1]
    ]
  }
}

const handleDelete = (index) => {
  localAnnotationList.value.splice(index, 1)
  for (let i in localAnnotationList.value) {
    localAnnotationList.value[i].step = i
  }
}

const handleSave = () => {
// TODO
}
</script>
