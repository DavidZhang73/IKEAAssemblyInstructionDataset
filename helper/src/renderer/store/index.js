import { createStore } from 'vuex'
import { getFileURL } from '~/utils/index.js'
import { ActionAnnotation, ObjectAnnotation } from '~/libs/annotationlib.js'
import { debounce } from 'lodash-es'
import { toRaw } from 'vue'

const saveCurrentAnnotationListDebounce = debounce
(
  (context, annotationList) => window.api.invoke('save-manual-annotation-list',
    {
      itemId: context.state.currentItem.id,
      annotationList: annotationList
    }).then(res => {
    console.log(res)
  }),
  1000
)

const saveCurrentVideoListDebounce = debounce
(
  (context, videoList) => {
    for (let i in videoList) {
      if (videoList[i].annotationList) {
        videoList[i].annotationList = videoList[i].annotationList.map(
          annotation => {
            return {
              start: annotation.start,
              end: annotation.end,
              manual: annotation.manual,
              page: annotation.page,
              step: annotation.step,
              description: annotation.description
            }
          })
      }
    }
    window.api.invoke('save-video-list', {
      itemId: context.state.currentItem.id,
      videoList: videoList
    }).then(res => {
      console.log(res)
    })
  },
  1000
)

const store = createStore({
  state () {
    return {
      currentItem: {},
      currentManualIndex: 0,
      currentPageIndex: 0,
      currentVideoIndex: 0
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
      return state.currentItem.annotationList ||
        []
    },
    currentCanvasAnnotationList (state) {
      if (state.currentItem.annotationList) {
        return state.currentItem.annotationList.filter(
          annotation => (annotation.manual === state.currentManualIndex) &&
            (annotation.page === state.currentPageIndex)
        )
      } else {
        return []
      }
    },
    currentVideoList (state) {
      return state.currentItem.videoList || []
    },
    currentVideoIndex (state) {
      return state.currentVideoIndex
    },
    currentVideo (state) {
      if (state.currentItem.videoList) {
        return state.currentItem.videoList[state.currentVideoIndex]
      } else {
        return null
      }
    },
    currentVideoAnnotationList (state) {
      return state.currentItem.videoList[state.currentVideoIndex].annotationList ||
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
      state.currentItem.annotationList = annotationList
    },
    setCurrentVideoList (state, videoList) {
      state.currentItem.videoList = videoList
    },
    setCurrentVideoIndex (state, currentVideoIndex) {
      state.currentVideoIndex = currentVideoIndex
    },
    setCurrentVideoAnnotationList (state, annotationList) {
      state.currentItem.videoList[state.currentVideoIndex].annotationList = annotationList
    }
  },
  actions: {
    async getItem (context, itemId) {
      const { result: item } = await window.api.invoke('get-item', { itemId })
      item.mainImageLocalUrl = await getFileURL(item.mainImagePathname)
      for (let i in item.annotationList) {
        const annotation = item.annotationList[i]
        item.annotationList[i] = new ObjectAnnotation(
          annotation.x,
          annotation.y,
          annotation.width,
          annotation.height,
          annotation.manual,
          annotation.page,
          annotation.step,
          annotation.color
        )
      }
      for (let i = 0; i < item.manualList.length; i++) {
        for (let j = 0; j < item.manualList[i].pageList.length; j++) {
          item.manualList[i].pageList[j].localUrl = await getFileURL(
            item.manualList[i].pageList[j].pathname
          )
        }
        if (item.manualList[i].videoList) {
          for (let j = 0; j < item.manualList[i].videoList.length; j++) {
            if (item.manualList[i].videoList[j].annotaionList) {
              item.manualList[i].videoList[j].annotaionList = item.manualList[i].videoList[j].annotaionList.map(
                annotation => {
                  return new ActionAnnotation(
                    annotation.start,
                    annotation.end,
                    annotation.manual,
                    annotation.page,
                    annotation.step,
                    annotation.description
                  )
                })
            }
          }
        }
      }
      context.commit('setCurrentItem', item)
      context.commit('setCurrentManualIndex', 0)
      context.commit('setCurrentPageIndex', 0)
      context.commit('setCurrentVideoIndex', 0)
    },
    saveCurrentAnnotationList (context, annotationList) {
      context.commit('setCurrentAnnotationList', annotationList)
      saveCurrentAnnotationListDebounce(context, annotationList)
    },
    saveCurrentVideoList (context, videoList) {
      context.commit('setCurrentVideoList', videoList)
      saveCurrentVideoListDebounce(context, videoList)
    },
    saveCurrentVideoAnnotationList (context, annotationList) {
      context.commit('setCurrentVideoAnnotationList', [...annotationList])
      const videoList = toRaw(context.state.currentItem.videoList) || []
      videoList[context.state.currentVideoIndex].annotationList = annotationList
      saveCurrentVideoListDebounce(context, videoList)
    }
  }
})

export default store
