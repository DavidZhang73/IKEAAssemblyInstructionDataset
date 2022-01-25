<template>
  <TabGroup
      v-if="$store.getters.currentItemExist"
      class="p-1 h-full flex flex-col"
      as="div"
      v-slot="props"
      @change="handleTabChange"
  >
    <TabList
        class="flex px-1 gap-x-1 items-center"
        as="div"
    >
      <img
          v-show="$store.getters.currentItem.mainImageLocalUrl"
          class="w-28"
          :src="$store.getters.currentItem.mainImageLocalUrl"
          alt="main image"
      >
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
        <SwitchGroup class="py-1">
          <div class="flex items-center">
            <SwitchLabel class="mr-4">Done</SwitchLabel>
            <Switch
                v-model="status"
                :class='status ? "bg-green-500" : "bg-gray-200"'
                class="relative inline-flex items-center h-6 transition-colors rounded-full w-11 focus:outline-none"
            >
        <span
            :class='status ? "translate-x-4" : "translate-x-0"'
            class="inline-block w-4 h-4 transition-transform transform bg-white rounded-full"
        />
            </Switch>
          </div>
        </SwitchGroup>
      </div>
      <div class="flex items-start overflow-x-auto">
        <img
            v-for="(manual, index) in $store.getters.currentItem.manualList"
            class="h-32 p-1 hover:bg-indigo-200 hover:cursor-pointer"
            :class="[{'bg-indigo-500': $store.getters.currentManualIndex === index}]"
            :src="manual.pageList[0].localUrl"
            alt="manual first"
            @click="$store.commit('setCurrentManualIndex', index)"
        >
      </div>
    </TabList>
    <TabPanels class="flex-grow">
      <TabPanel class="h-full">
        <Instruction/>
      </TabPanel>
      <TabPanel class="h-full">
        <Video/>
      </TabPanel>
      <TabPanel class="h-full">
        <Vidat/>
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<script setup>
import { Switch, SwitchGroup, SwitchLabel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import Instruction from '~/components/Instruction.vue'
import Video from '~/components/Video.vue'
import Vidat from '~/components/Vidat.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const status = computed({
  get: () => {
    return store.getters.currentItemProgressStatus
  },
  set: (status) => {
    store.dispatch('saveCurrentItemProgressStatus', status)
  }
})

const handleTabChange = (index) => {
  store.commit('setCurrentTabIndex', index)
}
</script>
