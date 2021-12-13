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
  <ImageCanvas
      class="flex-grow"
      v-if="item.manualList[currentManual]"
      :manual="item.manualList[currentManual]"
  ></ImageCanvas>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue'
import { getFileURL } from '~/utils/index.js'
import ImageCanvas from '~/components/ImageCanvas.vue'

const props = defineProps({
  item: Object
})
const { item } = toRefs(props)

const currentManual = ref()

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
  }
}, { immediate: true })
</script>
