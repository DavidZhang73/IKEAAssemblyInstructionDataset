<template>
  <div class="h-screen w-screen flex flex-col">
    <div class="flex items-center h-14 p-2 gap-x-2">
      <div class="h-8 p-1">MongoDB Connection:</div>
      <input
          class="h-8 flex-grow"
          type="url"
          v-model="mongoURL"
          @keyup.enter="handleConnect"
      >
      <input
          class="h-8 flex-grow"
          type="text"
          v-model="mongoDatabaseName"
          @keyup.enter="handleConnect"
      >
      <button
          class="h-8"
          @click="handleConnect"
      >Connect
      </button>
    </div>
    <hr/>
    <div
        class="flex"
        style="height: calc(100vh - 3.5rem)"
    >
      <div
          class="flex transition-width"
          :class="[{'w-[30vw]': categoryExpand}, {'w-0': !categoryExpand}]"
      >
        <div class="w-[10vw] overflow-y-auto overflow-x-hidden">
          <div class="sticky top-0 bg-white p-1 text-center border-b-[1px] border-gray-200">Category ({{ categoryList.length }})</div>
          <div
              class="p-1 text-sm text-center cursor-pointer"
              :class="[
              {'bg-indigo-400 text-white': currentCategoryName === category.name},
              {'hover:bg-indigo-200': currentCategoryName !== category.name}
            ]"
              v-for="category in categoryList"
              :key="category.name"
              @click="handleCurrentCategoryChange(category.name)"
          >{{ category.name }}
          </div>
        </div>
        <div class="w-[10vw] border-r-[1px] border-gray-200 overflow-y-auto overflow-x-hidden">
          <div class="sticky top-0 bg-white p-1 text-center border-b-[1px] border-gray-200">Sub Category ({{ subCategoryList.length }})</div>
          <div
              class="p-1 text-sm text-center cursor-pointer"
              :class="[
              {'bg-indigo-400 text-white': currentSubCategoryName === subCategory},
              {'hover:bg-indigo-200': currentSubCategoryName !== subCategory}
            ]"
              v-for="subCategory in subCategoryList"
              :key="subCategory"
              @click="handleCurrentSubCategoryChange(subCategory)"
          >{{ subCategory }}
          </div>
        </div>
        <div class="w-[10vw] border-r-[1px] border-gray-200 overflow-y-auto overflow-x-hidden">
          <div class="sticky top-0 bg-white p-1 text-center border-b-[1px] border-gray-200">Item
            ({{ progress }}/{{ $store.getters.currentItemList.length }})
          </div>
          <div
              class="p-1 text-sm text-center cursor-pointer"
              :class="[
                {'bg-indigo-400 text-white': currentItemId === item.id},
                {'hover:bg-indigo-200': currentItemId !== item.id}
              ]"
              v-for="(item, index) in $store.getters.currentItemList"
              :key="item.id"
              @click="handleCurrentItemChange(item.id, index)"
          >{{ item.name }}-{{ item.id }}
            <span v-if="item.progressStatus && item.progressStatus.filter(item => item).length !== 0">| </span>
            <span
                class="font-bold"
                v-if="item.progressStatus && item.progressStatus[0]"
            >I</span>
            <span
                class="font-bold"
                v-if="item.progressStatus && item.progressStatus[1]"
            >V</span>
            <span
                class="font-bold"
                v-if="item.progressStatus && item.progressStatus[2]"
            >A</span>
          </div>
        </div>
      </div>
      <div
          class="w-[1vw] flex items-center justify-center border-gray-200 border-r-[1px] cursor-pointer hover:bg-gray-200"
          @click="categoryExpand = !categoryExpand"
      >
        <ChevronLeftIcon v-if="categoryExpand"/>
        <ChevronRightIcon v-else/>
      </div>
      <div class="flex-grow">
        <Item/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Item from './components/Item.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/solid'
import { useStore } from 'vuex'

const store = useStore()

const mongoURL = ref('mongodb://localhost:27017/')
const mongoDatabaseName = ref('IkeaAssemblyInstruction')

const categoryList = ref([])
const currentCategoryName = ref()
const subCategoryList = ref([])
const currentSubCategoryName = ref()
const currentItemId = ref()
const categoryExpand = ref(false)

const getSubCategoryList = () => {
  subCategoryList.value = categoryList.value.filter(
      item => item.name === currentCategoryName.value
  )[0].subCategoryList.filter(
      item => item.name !== 'Shop all'
  ).map(
      item => item.name
  )
  handleCurrentSubCategoryChange(subCategoryList.value[0])
}

const handleConnect = () => {
  window.api.invoke('connect-mongodb', {
    'mongoURL': mongoURL.value,
    'mongoDatabaseName': mongoDatabaseName.value
  }).then(res => {
    categoryList.value = res.result
    currentCategoryName.value = res.result[0].name
    getSubCategoryList()
  })
}

const handleCurrentCategoryChange = (name) => {
  currentCategoryName.value = name
  getSubCategoryList()
  currentItemId.value = null
}

const getItemList = async () => {
  await store.dispatch('getItemList', currentSubCategoryName.value)
  handleCurrentItemChange(store.getters.currentItemList[0].id, 0)
}

const handleCurrentSubCategoryChange = (name) => {
  currentSubCategoryName.value = name
  getItemList()
}

const handleCurrentItemChange = (id, index) => {
  currentItemId.value = id
  store.commit('setCurrentItemIndex', index)
  store.dispatch('getItem', id)
}

onMounted(() => {
  handleConnect()
})

const progress = computed(() => {
  if (store.getters.currentItemList && store.getters.currentItemList.length !== 0) {
    return store.getters.currentItemList.filter(item => {
      if (item.progressStatus && item.progressStatus.length !== 0) {
        return item.progressStatus[0] && item.progressStatus[1]
      } else {
        return false
      }
    }).length
  } else {
    return 0
  }
})

</script>
