<template>
  <div class="h-full flex justify-center">
    <div class="w-[70%] flex flex-col py-1 pr-1">
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
            class="rounded-none"
            @click="webviewRef.loadURL(search)"
        >
          <HomeIcon class="w-6"/>
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
          class="flex-grow"
          :src="search"
          plugins
      ></webview>
    </div>
    <div
        class="w-[30%] flex-grow py-1 overflow-y-auto"
        style="height: calc(100vh - 152px - 3.5rem)"
    >
      <div class="p-1 flex items-center justify-center">
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
      <div
          class="p-1 border-2 border-gray-400 hover:bg-indigo-200"
          v-for="(video, index) in $store.getters.currentVideoList"
      >
        <div class="p-1">
          ID: {{ video.url.split('watch?v=')[1] }}
        </div>
        <div class="text-right">
          <button
              class="rounded-tr-none rounded-br-none"
              @click="webviewRef.loadURL(video.url)"
          >
            <ZoomInIcon class="w-6"/>
          </button>
          <button
              class="rounded-tl-none rounded-bl-none"
              @click="handleDelete(index)"
          >
            <TrashIcon class="text-red-500 w-6"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
  ZoomInIcon
} from '@heroicons/vue/solid'
import { onMounted, ref, toRaw, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const webviewRef = ref()

const search = ref('')
const handleAdd = () => {
  const url = webviewRef.value.getURL()
  if (!store.getters.currentVideoList.find(item => item.url === url) && url.split('watch?v=')[1]) {
    store.dispatch('saveCurrentVideoList',
        [...toRaw(store.getters.currentVideoList), { 'url': url }])
    store.dispatch('saveCurrentItemProgressStatus', true)
  }
}

const handleDelete = (index) => {
  store.dispatch('saveCurrentVideoList', toRaw(store.getters.currentVideoList).filter((video, i) => i !== index))
  if (store.getters.currentVideoList.length === 0) {
    store.dispatch('saveCurrentItemProgressStatus', false)
  }
}

const handleDeleteAll = () => {
  store.dispatch('saveCurrentVideoList', [])
  store.dispatch('saveCurrentItemProgressStatus', false)
}

watch(() => store.getters.currentItem, () => {
  const searchQuery = `IKEA ${store.getters.currentItem.name} ${store.getters.currentItem.typeName} assembly ${store.getters.currentItem.id}`
  search.value = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
}, { immediate: true })

const getCss = (videoList) => {
  let selectorList = []
  for (let video of videoList) {
    selectorList.push(`a#video-title[href="/${video.url.split('/').at(-1)}"]`)
  }
  return `
    ${selectorList.join(',')} {
      background-color: #22c55d !important;
    }
  `
}

watch(() => store.getters.currentVideoList, (videoList) => {
  const webview = webviewRef.value
  webview.insertCSS(getCss(videoList))
})

onMounted(() => {
  const webview = webviewRef.value
  webview.addEventListener('dom-ready', function () {
    webview.insertCSS(getCss(store.getters.currentVideoList))
  })
})
</script>
