import { createStore } from 'vuex'
import { getFileURL } from '~/utils/index.js'
import { ObjectAnnotation } from '~/libs/annotationlib.js'
import { debounce } from 'lodash-es'

const saveCurrentAnnotationListDebounce = debounce
(
  (context, annotationList) => window.api.invoke('save-manual-annotation-list',
    {
      itemId: context.state.currentItem.id,
      manualIndex: context.state.currentManualIndex,
      annotationList: annotationList
    }).then(res => {
    console.log(res)
  }),
  1000
)

const saveCurrentVideoListDebounce = debounce
(
  (context, videoList) => window.api.invoke('save-video-list', {
    itemId: context.state.currentItem.id,
    manualIndex: context.state.currentManualIndex,
    videoList: videoList
  }).then(res => {
    console.log(res)
  }),
  1000
)

const store = createStore({
  state () {
    return {
      currentItem: {},
      currentManualIndex: 0,
      currentPageIndex: 0
    }
  },
  getters: {
    currentItemExist (state) {
      return !!state.currentItem.id
    },
    currentItem (state) {
      return state.currentItem
    },
    currentManualIndex (state) {
      return state.currentManualIndex
    },
    currentPageIndex (state) {
      return state.currentPageIndex
    },
    currentManual (state) {
      return state.currentItem.manualList[state.currentManualIndex]
    },
    currentPage (state) {
      return state.currentItem.manualList[state.currentManualIndex].pageList[state.currentPageIndex]
    },
    currentAnnotationList (state) {
      return state.currentItem.manualList[state.currentManualIndex].annotationList ||
        []
    },
    currentVideoList (state) {
      return state.currentItem.manualList[state.currentManualIndex].videoList ||
        []
    }
  },
  mutations: {
    setCurrentItem (state, item) {
      state.currentItem = item
    },
    setCurrentManualIndex (state, currentManualIndex) {
      state.currentManualIndex = currentManualIndex
      state.currentPageIndex = 0
    },
    setCurrentPageIndex (state, currentPageIndex) {
      state.currentPageIndex = currentPageIndex
    },
    setCurrentAnnotationList (state, annotationList) {
      state.currentItem.manualList[state.currentManualIndex].annotationList = annotationList
    },
    setCurrentVideoList (state, videoList) {
      state.currentItem.manualList[state.currentManualIndex].videoList = videoList
    }
  },
  actions: {
    async getItem (context, itemId) {
      const { result: item } = await window.api.invoke('get-item', { itemId })
      item.mainImageLocalUrl = await getFileURL(item.mainImagePathname)
      for (let i = 0; i < item.manualList.length; i++) {
        for (let j in item.manualList[i].annotationList) {
          const annotation = item.manualList[i].annotationList[j]
          item.manualList[i].annotationList[j] = new ObjectAnnotation(
            annotation.x,
            annotation.y,
            annotation.width,
            annotation.height,
            annotation.page,
            annotation.step
          )
        }
        for (let j = 0; j < item.manualList[i].pageList.length; j++) {
          item.manualList[i].pageList[j].localUrl = await getFileURL(
            item.manualList[i].pageList[j].pathname
          )
        }
      }
      context.commit('setCurrentItem', item)
      context.commit('setCurrentManualIndex', 0)
      context.commit('setCurrentPageIndex', 0)
    },
    saveCurrentAnnotationList (context, annotationList) {
      context.commit('setCurrentAnnotationList', annotationList)
      saveCurrentAnnotationListDebounce(context, annotationList)
    },
    saveCurrentVideoList (context, videoList) {
      context.commit('setCurrentVideoList', videoList)
      saveCurrentVideoListDebounce()
    }
  }
})

export default store
