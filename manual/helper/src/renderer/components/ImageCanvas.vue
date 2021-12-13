<template>
  <div class="relative border-2 border-gray-400">
    <img
        class="h-[55vh]"
        :src="imgLocalUrl"
        alt="page"
    >
    <canvas ref="canvas" class="absolute inset-0"></canvas>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  imgLocalUrl: String
})
const { imgLocalUrl } = toRefs(props)

</script>
