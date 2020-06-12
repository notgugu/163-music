import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

var store = new Vuex.Store({
  state: {
    song: {//歌曲数据
      id: null,//歌曲id
      url: '',//当前歌曲url
      name: '',//歌名
      isPlay: true,//是否在播放
      picUrl: '',//图片
      pic_str: '',
      lyric: [],//歌词
      activeIndex: 0,//歌词激活位置
    },
    allSongs: [],//所有已加入的歌
  },
  getters: {//在组件中得到state
    song: state => state.song,
    allSongs: state => state.allSongs,
  },
  mutations: {//同步处理state
    updateSong(state,payload){//更新当前歌
      state.song = payload;
    },
    updateAllSongs(state,payload){//更新所有歌
      state.allSongs = [...new Set(state.allSongs.concat(payload))];//数组拼接去重
    },
  },
  actions: {//异步处理
    
  }
})

export default store;