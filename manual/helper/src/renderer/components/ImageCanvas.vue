<template>
  <div class="flex items-center justify-evenly">
    <button
        class=""
        @click="handlePrev"
    >prev
    </button>
    <div class="">
      <img
          class="h-[55vh]"
          :src="manual.pageList[currentPage].localUrl"
          alt="page"
      >
    </div>
    <button
        class=""
        @click="handleNext"
    >next
    </button>
  </div>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue'

const props = defineProps({
  manual: Object
})
const { manual } = toRefs(props)

const currentPage = ref(0)

watch(() => manual.value, (newManual) => {
  currentPage.value = 0
})

const handlePrev = () => {
  if (currentPage.value !== 0) {
    currentPage.value -= 1
  }
}

const handleNext = () => {
  if (currentPage.value !== manual.value.pageList.length - 1) {
    currentPage.value += 1
  }
}
</script>
