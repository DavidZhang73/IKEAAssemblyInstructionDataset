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
  <div class="flex items-center justify-center gap-x-4 pt-6">
    <button
        @click="handlePrev"
    ><ChevronLeftIcon class="w-6"/>
    </button>
    <ImageCanvas
        v-if="item.manualList[currentManual].pageList[currentPage].localUrl"
        :imgLocalUrl="item.manualList[currentManual].pageList[currentPage].localUrl"
    ></ImageCanvas>
    <button
        @click="handleNext"
    ><ChevronRightIcon class="w-6"/>
    </button>
  </div>
  <div class="text-center">{{ currentPage + 1 }} / {{ item.manualList[currentManual].pageList.length }}</div>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue'
import { getFileURL } from '~/utils/index.js'
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/vue/solid'
import ImageCanvas from '~/components/ImageCanvas.vue'

const props = defineProps({
  item: Object
})
const { item } = toRefs(props)

const currentManual = ref(0)
const currentPage = ref(0)

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
</script>
