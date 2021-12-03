<template>
  <div
      v-if="item"
  >
    <div class="p-1 flex">
      <div class="flex flex-col justify-center ">
        <a
            :href="item.pipUrl"
            class="text-3xl font-extrabold"
        >
          {{ item.name }} - {{ item.id }}
        </a>
        <div class="text-sm">{{ item.category }} - {{ item.subCategory }}</div>
        <div class="text-sm">{{ item.typeName }}</div>
      </div>
      <div class="flex-grow"></div>
      <img
          class="w-32"
          :src="item.mainImageUrl"
          alt="main image"
      >
    </div>
    <div class="flex items-center">
      <div
          class="flex-grow text-center"
          v-for="manual in item.manualList"
      >
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'

const props = defineProps({
  item: Object
})
const item = toRef(props, 'item')
</script>
