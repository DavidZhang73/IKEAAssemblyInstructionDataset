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
  <div class="flex justify-center">
    <div class="w-[70%]">
      <div class="p-1 flex items-center justify-center">
        <button
            class="rounded-tr-none rounded-br-none"
            @click="webviewRef.goBack()"
        >
          <ArrowLeftIcon class="w-6"/>
        </button>
        <button
            class="rounded-none"
            @click="webviewRef.goForward()"
        >
          <ArrowRightIcon class="w-6"/>
        </button>
        <button
            class="rounded-tl-none rounded-bl-none"
            @click="webviewRef.reload()"
        >
          <RefreshIcon class="w-6"/>
        </button>
      </div>
      <webview
          ref="webviewRef"
          class="h-[60vh]"
          :src="`https://www.youtube.com/results?search_query=${search}`"
      ></webview>
    </div>
    <div class="w-[30%] h-[75vh] overflow-y-auto">
      <div class="p-1 flex justify-center">
        <button
            class="rounded-tr-none rounded-br-none"
            @click="handleAdd"
        >add
        </button>
        <button
            class="rounded-tl-none rounded-bl-none"
            @click="handleSave"
        >save
        </button>
      </div>
      <div
          class="relative p-1 border-2 border-gray-400 hover:bg-indigo-200"
          v-for="(url, index) in urlList"
      >
        <span
            class="cursor-pointer"
            @click="webviewRef.loadURL(url)"
        >{{ url }}</span>
        <div
            class="w-10 absolute top-0 bottom-0 right-0 flex items-center justify-center cursor-pointer"
            @click="urlList.splice(index, 1)"
        >
          <TrashIcon class="text-red-400 w-6"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue'
import { ArrowLeftIcon, ArrowRightIcon, RefreshIcon, TrashIcon } from '@heroicons/vue/solid'

const props = defineProps({
  item: Object
})
const webviewRef = ref()
const { item } = toRefs(props)
const currentManual = ref(0)
const urlList = ref([])
const search = ref(`IKEA ${item.value.name} ${item.value.subCategory} assembly`)
watch(() => item.value, newItem => {
  search.value = `IKEA ${newItem.name} ${newItem.subCategory} assembly`
  urlList.value = []
  currentManual.value = 0
})
const handleAdd = () => {
  const webviewElement = webviewRef.value
  urlList.value.push(webviewElement.getURL())
}
const handleSave = () => {
  const webviewElement = webviewRef.value
  console.log('save')
}
</script>
