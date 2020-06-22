import Vue from 'vue'
import Router from 'vue-router'
const recommendationIndex = ()=> import('@/views/recommendation/');
const songIndex = ()=> import('@/views/song/');
const searchIndex = ()=> import('@/views/search/');
const hotIndex =()=> import('@/views/hot/');
const albumIndex = ()=> import('@/views/album');
const songListIndex = ()=> import('@/views/songList');
const artistIndex = ()=> import('@/views/artist');
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'recommendation Index',
      component: recommendationIndex,
      meta: {
        isKeepAlive: true
      },    
    },
    {
      path: '/song/:id',
      name: 'play song',
      component: songIndex
    },
    {
      path: '/search',
      component: searchIndex,
    },
    {
      path: '/hot',
      component: hotIndex,
    },
    {
      path: '/album/:id',
      component: albumIndex,
    },
    {
      path: '/songList/:id',
      component: songListIndex,
    },
    {
      path: '/artist/:id',
      component: artistIndex,
    },

  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
