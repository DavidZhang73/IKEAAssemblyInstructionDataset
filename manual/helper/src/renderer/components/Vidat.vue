<template>
  <div>Vidat</div>
  <div>{{ item }}</div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  item: Object
})
const { item } = toRefs(props)
</script>
