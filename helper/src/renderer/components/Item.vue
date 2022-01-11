<template>
  <TabGroup
      v-if="$store.getters.currentItemExist"
      class="p-1 h-full"
      as="div"
  >
    <TabList
        class="flex"
        as="div"
    >
      <img
          v-show="$store.getters.currentItem.mainImageLocalUrl"
          class="w-28"
          :src="$store.getters.currentItem.mainImageLocalUrl"
          alt="main image"
      >
      <div class="px-1 flex">
        <div>
          <div class="text-3xl font-extrabold">{{ $store.getters.currentItem.name }} - {{
              $store.getters.currentItem.id
            }}
          </div>
          <div class="text-sm">{{ $store.getters.currentItem.category }} - {{
              $store.getters.currentItem.subCategory
            }}
          </div>
          <div class="text-sm">{{ $store.getters.currentItem.typeName }}</div>
          <Tab
              v-slot="{ selected }"
              as="template"
          >
            <button
                class="rounded-tr-none rounded-br-none"
                :class="[selected ? 'bg-indigo-400 text-white' : 'bg-white text-black']"
            >
              Instruction
            </button>
          </Tab>
          <Tab
              v-slot="{ selected }"
              as="template"
          >
            <button
                class="rounded-none"
                :class="[selected ? 'bg-indigo-400 text-white' : 'bg-white text-black']"
            >
              Video
            </button>
          </Tab>
          <Tab
              v-slot="{ selected }"
              as="template"
          >
            <button
                class="rounded-tl-none rounded-bl-none"
                :class="[selected ? 'bg-indigo-400 text-white' : 'bg-white text-black']"
            >
              Vidat
            </button>
          </Tab>
        </div>
        <div class="px-1 flex items-start overflow-x-auto">
          <img
              v-for="(manual, index) in $store.getters.currentItem.manualList"
              class="h-32 p-1 hover:bg-indigo-200 hover:cursor-pointer"
              :class="[{'bg-indigo-500': $store.getters.currentManualIndex === index}]"
              :src="manual.pageList[0].localUrl"
              alt="manual first"
              @click="$store.commit('setCurrentManualIndex', index)"
          >
        </div>
      </div>
    </TabList>
    <TabPanels>
      <TabPanel>
        <Instruction/>
      </TabPanel>
      <TabPanel>
        <Video/>
      </TabPanel>
      <TabPanel>
        <Vidat/>
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<script setup>
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import Instruction from '~/components/Instruction.vue'
import Video from '~/components/Video.vue'
import Vidat from '~/components/Vidat.vue'</script>
