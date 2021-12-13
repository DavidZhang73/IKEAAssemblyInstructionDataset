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
    <div class="flex">
      <div
          class="overflow-y-scroll overflow-x-hidden transition-width"
          :class="[{'w-[10vw] ': categoryExpand}, {'w-0': !categoryExpand}]"
          style="height: calc(100vh - 5.5rem)"
      >
        <div class="p-1 text-center border-b-[1px] border-gray-200">Category</div>
        <div
            class="p-1 text-sm text-center cursor-pointer"
            :class="[
              {'bg-indigo-400': currentCategoryName === category.name},
              {'hover:bg-indigo-200': currentCategoryName !== category.name}
            ]"
            v-for="category in categoryList"
            :key="category.name"
            @click="handleCurrentCategoryChange(category.name)"
        >{{ category.name }}
        </div>
      </div>
      <div
          class="w-[1vw] flex items-center justify-center border-gray-200 border-r-[1px] cursor-pointer hover:bg-gray-200"
          @click="categoryExpand = !categoryExpand"
      >
        <ChevronLeftIcon v-if="categoryExpand"/>
        <ChevronRightIcon v-else/>
      </div>
      <div
          class="w-[10vw] border-r-[1px] border-gray-200 overflow-y-scroll overflow-x-hidden"
          style="height: calc(100vh - 5.5rem)"
      >
        <div class="p-1 text-center border-b-[1px] border-gray-200">Sub Category</div>
        <div
            class="p-1 text-sm text-center cursor-pointer"
            :class="[
              {'bg-indigo-400': currentSubCategoryName === subCategory},
              {'hover:bg-indigo-200': currentSubCategoryName !== subCategory}
            ]"
            v-for="subCategory in subCategoryList"
            :key="subCategory"
            @click="handleCurrentSubCategoryChange(subCategory)"
        >{{ subCategory }}
        </div>
      </div>
      <div
          class="w-[10vw] border-r-[1px] border-gray-200 overflow-y-scroll overflow-x-hidden"
          style="height: calc(100vh - 5.5rem)"
      >
        <div class="p-1 text-center">
          <div class="p-1 text-center border-b-[1px] border-gray-200">Item</div>
          <div
              class="p-1 text-sm text-center cursor-pointer"
              :class="[
              {'bg-indigo-400': currentItemId === item.id},
              {'hover:bg-indigo-200': currentItemId !== item.id}
            ]"
              v-for="item in itemList"
              :key="item.id"
              @click="handleCurrentItemChange(item.id)"
          >{{ item.name }}-{{ item.id }}
          </div>
        </div>
      </div>
      <div
          class="w-[70vw]"
          style="height: calc(100vh - 5.5rem)"
      >
        <Item :item="currentItem"></Item>
      </div>
    </div>
    <hr/>
    <div class="h-8">Footer</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
// noinspection ES6UnusedImports
import Item from './components/Item.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/solid'

const mongoURL = ref('mongodb://localhost:27017/')
const mongoDatabaseName = ref('IkeaAssemblyInstruction')

const categoryList = ref([])
const currentCategoryName = ref()
const subCategoryList = ref([])
const currentSubCategoryName = ref()
const itemList = ref([])
const currentItemId = ref()
const currentItem = ref()
const categoryExpand = ref(true)

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
  itemList.value = []
  currentItemId.value = null
}

const getItemList = () => {
  window.api.invoke('get-item-list', {
    'subCategoryName': currentSubCategoryName.value
  }).then(res => {
    itemList.value = res.result
    handleCurrentItemChange(itemList.value[0].id)
  })
}

const handleCurrentSubCategoryChange = (name) => {
  currentSubCategoryName.value = name
  getItemList()
}

const handleCurrentItemChange = (id) => {
  currentItemId.value = id
  window.api.invoke('get-item', {
    itemId: currentItemId.value
  }).then(res => {
    currentItem.value = res.result[0]
  })
}

onMounted(() => {
  handleConnect()
})
</script>
