<template>
  <div class="h-full flex justify-center">
    <div class="w-[70%] flex flex-col">
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
      ></webview>
    </div>
    <div
        class="w-[30%] flex-grow overflow-y-auto"
        style="height: calc(100vh - 132px - 3.5rem)"
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
import { ref, toRaw } from 'vue'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HomeIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
  ZoomInIcon
} from '@heroicons/vue/solid'
import { useStore } from 'vuex'

const store = useStore()
const webviewRef = ref()

const search = `https://www.youtube.com/results?search_query=IKEA ${store.getters.currentItem.name} ${store.getters.currentItem.subCategory} assembly ${store.getters.currentItem.typeName} ${store.getters.currentItem.id}`
const handleAdd = () => {
  const url = webviewRef.value.getURL()
  if (!store.getters.currentVideoList.find(item => item.url === url) && url.split('watch?v=')[1]) {
    store.dispatch('saveCurrentVideoList',
        [...toRaw(store.getters.currentVideoList), { 'url': url }])
  }
}

const handleDelete = (index) => {
  store.dispatch('saveCurrentVideoList', toRaw(store.getters.currentVideoList).filter((video, i) => i !== index))
}

const handleDeleteAll = () => {
  store.dispatch('saveCurrentVideoList', [])
}
</script>
