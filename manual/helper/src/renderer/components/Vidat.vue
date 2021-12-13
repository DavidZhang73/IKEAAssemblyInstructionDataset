<template>
  <div class="flex">
    <iframe
        class="w-1/2 h-[40vh]"
        width="1920"
        height="1080"
        src="https://www.youtube.com/embed/NGZXBsgYI6I"
    >
    </iframe>
    <iframe
        class="w-1/2 h-[40vh]"
        width="1920"
        height="1080"
        src="https://www.youtube.com/embed/NGZXBsgYI6I"
    >
    </iframe>
  </div>
  <table class="w-full">
    <thead>
    <tr>
      <th colspan="7">Annotation</th>
    </tr>
    <tr>
      <th>start</th>
      <th>end</th>
      <th>duration</th>
      <th>step</th>
      <th>operation</th>
    </tr>
    </thead>
    <tbody>
    <!--    <tr v-for="(annotation, index) in localAnnotationList">-->
    <!--      <td :style="{'background-color': annotation.color}">{{ annotation.step }}</td>-->
    <!--      <td>{{ annotation.page + 1 }}</td>-->
    <!--      <td>{{ utils.toFixed2(annotation.x) }}</td>-->
    <!--      <td>{{ utils.toFixed2(annotation.y) }}</td>-->
    <!--      <td>{{ utils.toFixed2(annotation.height) }}</td>-->
    <!--      <td>{{ utils.toFixed2(annotation.width) }}</td>-->
    <!--      <td>-->
    <!--        <button-->
    <!--            class="rounded-tr-none rounded-br-none"-->
    <!--            @click="currentPage = annotation.page"-->
    <!--        >-->
    <!--          <ZoomInIcon class="w-6"/>-->
    <!--        </button>-->
    <!--        <button-->
    <!--            class="rounded-none"-->
    <!--            @click="handleMoveUp(index)"-->
    <!--        >-->
    <!--          <ArrowUpIcon class="w-6"/>-->
    <!--        </button>-->
    <!--        <button-->
    <!--            class="rounded-none"-->
    <!--            @click="handleMoveDown(index)"-->
    <!--        >-->
    <!--          <ArrowDownIcon class="w-6"/>-->
    <!--        </button>-->
    <!--        <button-->
    <!--            class="rounded-tl-none rounded-bl-none text-red-600"-->
    <!--            @click="handleDelete(index)"-->
    <!--        >-->
    <!--          <TrashIcon class="w-6"/>-->
    <!--        </button>-->
    <!--      </td>-->
    <!--    </tr>-->
    </tbody>
  </table>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  item: Object
})
const { item } = toRefs(props)
</script>
