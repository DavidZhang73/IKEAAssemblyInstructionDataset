<template>
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
          :src="`https://www.youtube.com/results?search_query=IKEA ${$store.getters.currentItem.name} ${$store.getters.currentItem.subCategory} assembly ${$store.getters.currentItem.typeName} ${$store.getters.currentItem.id}`"
      ></webview>
    </div>
    <div class="w-[30%] h-[75vh] overflow-y-auto">
      <div class="p-1 flex justify-center">
        <button
            @click="handleAdd"
        >add
        </button>
      </div>
      <div
          class="relative p-1 border-2 border-gray-400 hover:bg-indigo-200"
          v-for="(video, index) in $store.getters.currentVideoList"
      >
        <span
            class="cursor-pointer"
            @click="webviewRef.loadURL(video.url)"
        >{{ video.url }}</span>
        <div
            class="w-10 absolute top-0 bottom-0 right-0 flex items-center justify-center cursor-pointer"
            @click="handleDelete(index)"
        >
          <TrashIcon class="text-red-400 w-6"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRaw } from 'vue'
import { ArrowLeftIcon, ArrowRightIcon, RefreshIcon, TrashIcon } from '@heroicons/vue/solid'
import { useStore } from 'vuex'

const store = useStore()
const webviewRef = ref()
const handleAdd = () => {
  store.dispatch('saveCurrentVideoList', [...toRaw(store.getters.currentVideoList), { url: webviewRef.value.getURL() }])
}

const handleDelete = (index) => {
  store.dispatch('saveCurrentVideoList', toRaw(store.getters.currentVideoList).filter((video, i) => i !== index))
}
</script>
