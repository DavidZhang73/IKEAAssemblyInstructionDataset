<template>
  <div
      class="p-1 h-full flex flex-col"
      v-if="item"
  >
    <div class="flex">
      <img
          v-show="item.mainImageLocalUrl"
          class="w-28"
          :src="item.mainImageLocalUrl"
          alt="main image"
      >
      <div class="flex flex-col justify-center">
        <div class="text-3xl font-extrabold">{{ item.name }} - {{ item.id }}</div>
        <div class="text-sm">{{ item.category }} - {{ item.subCategory }}</div>
        <div class="text-sm">{{ item.typeName }}</div>
      </div>
    </div>
    <TabGroup>
      <TabList class="py-1">
        <Tab v-slot="{ selected }" as="template">
          <button
              class="rounded-tr-none rounded-br-none"
              :class="[selected ? 'bg-indigo-400 text-white' : 'bg-white text-black']"
          >
            Instruction
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button
              class="rounded-none"
              :class="[selected ? 'bg-indigo-400 text-white' : 'bg-white text-black']"
          >
            Video
          </button>
        </Tab>
        <Tab v-slot="{ selected }" as="template">
          <button
              class="rounded-tl-none rounded-bl-none"
              :class="[selected ? 'bg-indigo-400 text-white' : 'bg-white text-black']"
          >
            Vidat
          </button>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Instruction :item="item"/>
        </TabPanel>
        <TabPanel>
          <Video :item="item"/>
        </TabPanel>
        <TabPanel>
          <Vidat :item="item"/></TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup>
import { toRefs, watch } from 'vue'
import { getFileURL } from '~/utils/index.js'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import Instruction from '~/components/Instruction.vue'
import Video from '~/components/Video.vue'
import Vidat from '~/components/Vidat.vue'

const props = defineProps({
  item: Object
})
const { item } = toRefs(props)

watch(() => item.value, (newItem) => {
  getFileURL(newItem.mainImagePathname).then(url => {
    item.value.mainImageLocalUrl = url
  })
})
</script>
