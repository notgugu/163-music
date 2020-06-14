<template>
  <div class="player" v-show="isShowPlayer">
    <div class="player-icon" @click="isShowControl = true;"><i class="fa fa-music" :style="{ 'animation-play-state': isPlay ? 'running' : 'paused' }"></i></div>
    <div class="player-control" v-show="isShowControl">
      <i class="fa fa-close" @click="isShowControl = false"></i>
      <div class="player-button">
        <i class="fa fa-step-backward" @click="playSong(-1)"></i>
        <i class="fa fa-step-forward" @click="playSong(1)"></i>
      </div>
      <i class="fa fa-list" @click="isShowList=!isShowList;"></i>
      <div class="songList" v-show="isShowList">
        <ul>
          <li v-for="(item,index) in songList" :key="index" @click="$router.replace(`/song/${item.id}`)" :style="{'background': item.id == songStore.id ? '#f2f2f2': ''}">
            <div class="content">
                <div class="text">
                  <div class="text-name">{{item.name}} {{item.ar[0].name}}</div>
                </div>
            </div>
            <i class="fa fa-close" @click.stop="deleteSong(item.id)"></i>
          </li>
        </ul>
      </div>
      <audio ref="audioNode" :src="url" controls="controls" class="song-audio" autoplay="true" ended></audio>
    </div>
    
  </div>
</template>

<script>
import { Toast } from 'mint-ui';
import { getSongUrl, getSongDetail, getSongLyric } from '@/api/song';

export default {
  created(){
    
  },
  data(){
    return {
      isShowControl: false,
      isShowList: false,
      songList:[],
      IsEnded: false,
    }
  },
  mounted(){
    this.$refs.audioNode.onpause = () =>{
      this.songStore.isPlay = false;
      this.$store.commit('updateSong', this.songStore);
    };
    this.$refs.audioNode.onplay = () =>{
      this.songStore.isPlay = true;
      this.$store.commit('updateSong', this.songStore);
    };
    this.$refs.audioNode.ontimeupdate = ()=>{
      //console.log(this.$refs.audioNode.currentTime, this.$refs.audioNode.duration)
      //this.lyric[this.actvieIndex].time//当前歌词开始的时间点
      //this.$refs.audioNode.currentTime//当前歌播放的时间点
      var currentTime = this.$refs.audioNode.currentTime;
      for(var index = 0; index < this.lyric.length; index++){
        var item = this.lyric[index];
        if(currentTime < item.time){
          this.songStore.activeIndex = index == 0 ? 0 : index - 1;
          break;
        }
      }
      //console.log(this.song.activeIndex)
      this.$store.commit('updateSong', this.songStore);
      this.IsEnded = this.$refs.audioNode.ended;
      console.log(this.IsEnded);
    };
  },
  methods: {
    async playSong(num){
      let activeIndex = this.allSongs.indexOf(this.songStore.id);
      let lastIndex = this.allSongs.length - 1;
      let nextIndex;
      if(activeIndex == -1){
        Toast('播放列表为空');
        return;
      };
      if(num == -1){
        nextIndex = activeIndex == 0 ? lastIndex : activeIndex - 1;
      }
      else if(num == 1){
        nextIndex = activeIndex == lastIndex ? 0 : activeIndex + 1;
      };
      if(nextIndex == activeIndex){
        Toast('当前播放列表只有一首歌');
        return;
      }
      let nextId = this.allSongs[nextIndex];
      let path = this.$route.path;
      let reg = /^\/song\/\d+$/;
      if(reg.test(path)){
        this.$router.replace(`/song/${nextId}`);
        window.scrollTo(0,0);
      }
      else{
        this.song.id = nextId;
        await this.getSongDetail();
        await this.getSongLyric();
        await this.getSongUrl();
        this.$store.commit('updateSong', this.song);
      };
    },
    deleteSong(id){//列表中删除歌曲
      if(id == this.songStore.id){
        this.playSong(1);
      }
      let chooseIndex = null;
      this.allSongs.forEach((item,index) =>{
        if(item == id){
          chooseIndex = index;
        }
      })
      this.$store.commit('deleteAllSongs',chooseIndex);
    },
    getSongUrl(){//歌url接口
      return new Promise((resolve,reject) =>{
        var id = this.song.id;
        getSongUrl({ 
          params: {
            id
          }
        }).then(res =>{
          var data = res.data;
          if(data.code == 200){
            var song = data.data[0];
            if(song){
              if(this.url != song.url){//对同一首歌进入不做重新播放处理
                this.song.url = song.url;
              }
            }
          }
          resolve(true);
        });
      });
    },
    getSongDetail(){//歌详情接口
      return new Promise((resolve,reject) =>{
        var ids = this.song.id;
        if(ids == '') return;
        getSongDetail({ 
          params: {
            ids
          }
        }).then(res =>{
          var data = res.data;
          if(data.code == 200){
            var songData = data.songs[0];
            if(songData){
              var al = songData.al;
              this.song.name = al.name;
              this.song.picUrl = al.picUrl;
              this.song.pic_str = al.pic_str;
            }
          }
          resolve(true);
        });
      });
    },
    getSongLyric(){
      return new Promise((resolve,reject) =>{
        var id = this.song.id;
        getSongLyric({ 
          params: {
            id
          }
        }).then(res =>{
          var data = res.data;
          if(data.code == 200){
            var lyric = data.lrc.lyric
            if(lyric){
              var lyricArr = lyric.split(/\n/);
              var newLyricArr = lyricArr.map(item => {
                var arrItem = item.split(']');
                var arrTime = arrItem[0].slice(1).split(':');
                var time = arrTime[0]*60+Number(arrTime[1]);
                var content = arrItem[1];
                return { 
                  time, 
                  content 
                };
              });
              this.song.lyric = newLyricArr;
              console.log(newLyricArr)
            }
          }
          resolve(true);
        });
      });
    },
    getSongSDetail(){
      let ids = this.allSongs.join();
      getSongDetail({
        params:{
          ids,
        }
      }).then(res =>{
        let data = res.data;
        console.log(data);
        if(data.code == 200){
          this.songList = data.songs;
        }
      })
    },

  },
  computed: {
    songStore(){//得到歌的数据
      return this.$store.getters.song;
    },
    url(){//歌的url
      return this.songStore.url;
    },
    actvieIndex(){
      return this.songStore.actvieIndex;
    },
    lyric(){
      return this.songStore.lyric;
    },
    isPlay(){
      return this.songStore.isPlay;
    },
    isShowPlayer(){//是否显示播放器
      return this.url != '' && this.url != null
    },
    allSongs(){
      return this.$store.getters.allSongs;
    }, 
  },
  watch: {
    isPlay(newval,oldval){
      if(newval && this.IsEnded == false){
        this.$refs.audioNode.play();
      }
      else{
        this.$refs.audioNode.pause();
      }  
    },
    allSongs(newval,oldval){
      this.getSongSDetail();
    },
    IsEnded(newval){
      if(newval){
        this.playSong(1);
      }
    }
  },
}
</script>

<style lang="scss" scoped>
@keyframes circle{
  from { transform: rotate(0deg);}
  to {transform: rotate(360deg);}
}
/deep/.player{
  &>.player-icon{
    position: fixed;
    right: 0;
    top: 50%;
    transform: translate(0, -50%);
    z-index: 99;
    width: 84px;
    height:90px;
    text-align: center;
    background: #e2e2e2;
    line-height: 90px;
    border-radius: 45px 0 0 45px;
    &>.fa-music{
      animation: circle 2s linear infinite;
    }
  }
  &>.player-control{
    position: fixed;
    top: 0;
    left: 0;
    background: #fff;
    z-index: 99;
    width: 100%;
    height: 100%;
    &>.fa-close{
      position: fixed;
      right: 10px;
      top: 10px;
      font-size: 36px;/*px*/
    }
    &>.player-button{
      position: fixed;
      width: 690px;
      padding: 0 30px;
      left: 0;
      bottom: 15%;
      display: flex;
      justify-content: space-between;
      font-size: 72px;/*px*/
    }
    &>.song-audio{
      width: 100%;
      position: fixed;
      left: 0;
      bottom: 0;
    }
    &>.fa-list{
      font-size: 72px;/*px*/
    }
    &>.songList{
      background: #f9f9f9;
      margin-top: 30px;
      height: 600px;
      overflow: hidden;
      overflow-y: auto;
      li{
        padding-left: 20px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30px;
        &>.content{
          display: flex;
          &>img{
            width: 83px;
            height: 83px;
          }
          &>.text{
            padding-left: 30px;
            &>.text-name{
              font-size: 29px;/*px*/
              line-height: 44px;/*px*/
              color: #000;
            }
          }
        }
      }
    }
  }
}
</style>
