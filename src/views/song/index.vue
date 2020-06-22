<template>
  <div class="song" :style="{ backgroundImage: 'url(http://music.163.com/api/img/blur/'+song.pic_str+')' }">
    <div class="song-wrap">
      <div class="clearfix" :style="{ height: screen.height + 'px' }">
        <div class="song-player" ref="songPlayerNode" @click="songFun">
          <i class="pointer" :style="{ transform: song.isPlay ? 'rotate(20deg)' : 'rotate(0deg)' }"></i>
          <i class="img-bg" :style="{ 'animation-play-state': song.isPlay ? 'running' : 'paused' }"></i>
          <div class="img" :style="{ 'animation-play-state': song.isPlay ? 'running' : 'paused' }">
            <img :src="song.picUrl" alt="">
          </div>
          <i class="status" v-show="!song.isPlay"></i>
        </div>

        <div class="lyric" :style="{ height: screen.lyricHeight + 'px' }">
          <div class="lyric-wrap">
            <ul class="lyric-list" :style="{ 'transition-duration': transitionDurationTime, transform: 'translate(0, '+ -activeIndex*(80/75) +'rem)'}">
              <li :class="{ active: index == activeIndex }" v-for="(item,index) in song.lyric" :key="index">{{ item.content }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="loveSong" :style="{ backgroundImage: 'url(http://music.163.com/api/img/blur/'+song.pic_str+')' }">
        <div class="loveSong-title">喜欢这首歌的人也喜欢听<a class="fa fa-play-circle-o" href="javascript:;" @click="addSongs">一键收听</a></div>
        <ul class="loveSong-list">
          <li v-for="(item,index) in simiSong" :key="item.id" @click="$router.replace(`/song/${item.id}`)">
            <div class="content">
                <img :src="item.album.picUrl" alt="">
                <div class="text">
                  <div class="text-name">{{item.name}}</div>
                  <div class="text-singer">{{item.artists[0].name}}</div>
                </div>
            </div>
            <i class="fa fa-play-circle-o"></i>
          </li>
        </ul>
      </div>

      <div class="comment" :style="{ backgroundImage: 'url(http://music.163.com/api/img/blur/'+song.pic_str+')' }">
        <div class="comment-title">精彩评论</div>
        <ul class="comment-list">
          <li v-for="(item,index) in hotComments" :key="item.commentId">
            <div class="main-user">
              <div class="user">
                <img :src="item.user.avatarUrl" alt="">
                <div class="text">
                  <div class="name">{{item.user.nickname}}</div>
                  <div class="time">{{parseDate(item.time)}}</div>
                </div>
              </div>
              <div class="liked">
                <div class="count">{{item.likedCount}}</div>
                <i class="fa fa-thumbs-o-up"></i>
              </div>
              
            </div>
            <div class="main-content">
              {{ item.content}}
            </div>
            
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getSongUrl, getSongDetail, getSongLyric , getSongSimi ,getSongComment } from '@/api/song';
import { parseDate } from '@/utils/date';
import { Toast } from 'mint-ui';

export default {
  async created(){
    this.init();
  },
  mounted(){
    let dpr = document.documentElement.getAttribute('data-dpr');
    let windowResize = ()=>{
      this.screen.height = window.screen.height * dpr;
      this.screen.lyricHeight = this.screen.height - this.$refs.songPlayerNode.clientHeight - this.$refs.songPlayerNode.offsetTop;//得到可视高度
    };
    window.onresize = windowResize;//窗口大小发生变化时触发
    windowResize();//默认触发一次
  },
  data(){
    return {
      song: {
        id: null,//歌的id
        isPlay: true,//是否在播放
        name: '',//歌名
        url: null,//歌的url
        picUrl: '',//图片
        pic_str: '',//背景
        lyric: [],//存放歌词，{ time: 0, content: '歌词' }
        activeIndex: 0,//当前歌词激活位置
      },
      simiSong: [],//相似的歌曲
      hotComments: [],//热门评论

      screen: {
        height: null,//屏幕的高度,以px作为单位返回的值
        lyricHeight: null,//歌词可以占据的高度,以px作为单位返回的值
      },

      transitionDurationTime: 0,//歌词过渡的动画时间
    };
  },
  methods: {
    parseDate,
    async init(){//初始化
      await this.getSongDetail();
      await this.getSongLyric();
      this.getSongSimi();
      this.getSongComment();
      this.getSongUrl();
      this.song.id = Number(this.$route.params.id);
      window.scrollTo(0,0);//屏幕返回最顶部
    },
    addSongs(){//向vuex中的所有歌添加数据
      let payload = this.simiSong.map(itme => itme.id);//只添加id
      this.$store.commit('updateAllSongs',payload);
      Toast('添加成功！');
    },
    songFun(){//播放歌曲并更新数据
      this.song.isPlay = !this.song.isPlay;
      this.$store.commit('updateSong', this.song);
      this.$store.commit('updateAllSongs', this.song.id);
    },
    getSongUrl(){//歌url接口
      let id = this.$route.params.id;
      getSongUrl({ 
        params: {
          id
        }
      }).then(res =>{
        let data = res.data;
        if(data.code == 200){
          let song = data.data[0];
          if(song){
            if(this.url != song.url){//对同一首歌进入不做重新播放处理
              this.song.url = song.url;
              this.songFun();
            }
          }
        }
      });
    },
    getSongDetail(){//歌详情接口
      return new Promise((resolve,reject) =>{
        let ids = this.$route.params.id;
        getSongDetail({ 
          params: {
            ids
          }
        }).then(res =>{
          let data = res.data;
          if(data.code == 200){
            let songData = data.songs[0];
            if(songData){
              let al = songData.al;
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
        let id = this.$route.params.id;
        getSongLyric({ 
          params: {
            id
          }
        }).then(res =>{
          let data = res.data;
          if(data.code == 200){
            let lyric = data.lrc.lyric
            if(lyric){//对歌词进行处理
              let lyricArr = lyric.split(/\n/);
              let newLyricArr = lyricArr.map(item => {
                let arrItem = item.split(']');
                let arrTime = arrItem[0].slice(1).split(':');
                let time = arrTime[0]*60+Number(arrTime[1]);
                let content = arrItem[1];
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
    getSongSimi(){//相似歌曲的接口
      let id = this.$route.params.id;
      getSongSimi({
        params:{
          id
        }
      }).then(res =>{
        let data = res.data;
        if(data.code == 200){
          this.simiSong = data.songs;
        }
      })
    },
    getSongComment(){//得到歌曲评论
      let id = this.$route.params.id;
      getSongComment({
        params: {
          id
        }
      }).then(res =>{
        let data = res.data;
        if(data.code == 200){
          this.hotComments = data.hotComments;
        }
      })
    },
    transitionDuration() {
    //得到过渡时间
      let activeLyric = this.song.lyric[this.activeIndex];//当前歌词
      let nextIndex = this.activeIndex + 1;//得到下一个歌词的索引
      while (true){
        //优化，找到下一句有歌词的时间
        let nextLyric = this.song.lyric[nextIndex];//下一个索引的歌词对象
        if (nextLyric){
          if (nextLyric.content == ''){
            nextIndex++;
          } 
          else{
            this.transitionDurationTime = nextLyric.time - activeLyric.time + 's';
            break //跳出循环
          }
        } else {
          this.transitionDurationTime = 0;
          break //跳出循环
        }
      }
    },
  },
  computed: {
    songStore(){//得到歌的数据
      return this.$store.getters.song;
    },
    activeIndex(){
      return this.songStore.activeIndex;
    },
    url(){
      return this.songStore.url;
    },
    isPlay(){
      return this.songStore.isPlay;
    },
  },
  watch: {
    isPlay(newval){//监听isPlay的变化
      this.song.isPlay = newval;
    },
    activeIndex(newval){//时刻改变动画的过渡时间
      this.transitionDuration();
    },
    ['$route'](newval,oldval){//路由信息对象发生变化时触发
      if(newval.params.id == "") return;
      this.init();
    },
  },
}
</script>

<style lang="scss" scoped>
@keyframes circle
{
  from { transform: rotate(0deg);}
  to {transform: rotate(360deg);}
}

.song{
  background: #484848 no-repeat center 0 / auto 100%;
    .song-wrap{
    overflow: hidden;
    background: rgba(0,0,0,0.5);
    .lyric{
      box-sizing: border-box;
      padding: 46px 0;
      display: flex;
    }
    .lyric-wrap{
      width: 100%;
      text-align: center;
      color: rgba(255,255,255,0.4);
      font-size: 34px; /*px*/
      overflow: hidden;
      .lyric-list{
        transition-property: transform;
      }
      li{
        min-height: 80px;
        line-height: 80px;
      }
      .active{  color: rgba(255,255,255,1); }
    }
  }
  .song-player{
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 585px;
    height: 585px;
    margin: 175px auto 0;
    .pointer{
      position: absolute;
      left: 50%;
      top: -185px;
      z-index: 8;
      width: 207px;
      height: 315px;
      background: url('~@/assets/img/needle.png') no-repeat center 0 / 168px 244px;
      transition: transform 0.5s;
      transform-origin: 80px 0;
    }
    .img-bg{
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
      background: url('~@/assets/img/disc.png') no-repeat 0 0 / 100% 100%; 
      animation: circle 5s linear infinite;
    }
    .img{
      position: relative;
      z-index: 5;
      width: 370px;
      height: 370px;
      border-radius: 50%;
      overflow: hidden;
      background: #000;
      animation: circle 5s linear infinite;
    }
    .status{
      position: absolute;
      left: 50%;
      top: 50%;
      margin: -50px 0 0 -50px;
      width: 100px;
      height: 100px;
      z-index: 9;
      background: url('~@/assets/img/play-icon.png') no-repeat 0 0 / 100% 100%;
    }
  }
  .loveSong{
    background: rgba(0,0,0,0.4);
    padding-top: 40px;
    padding-right: 30px;
    &>.loveSong-title{
      height: 84px;
      font-size: 34px;/*px*/
      line-height: 84px;
      padding-left: 29px;
      display:flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
      &>.fa-play-circle-o{
        line-height: 52px;
        text-align: center;
        width: 170px;
        height: 52px;
        font-size: 24px;/*px*/
        color: #fff;
        border: 1px solid #fff;
        border-radius: 26px;
      }
    }
    &>.loveSong-list{
      li{
        padding-left: 20px;
        height: 120px;
        display: flex;
        justify-content: space-between;
        &>.content{
          display: flex;
          &>img{
            width: 83px;
            height: 83px;
          }
          &>.text{
            padding-left: 30px;
            width: 475px;
            &>.text-name{
              font-size: 29px;/*px*/
              line-height: 44px;/*px*/
              color: #fff;
              overflow: hidden;
              text-overflow:ellipsis;
              white-space: nowrap;
            }
            &>.text-singer{
              font-size: 24px;/*px*/
              line-height: 32px;/*px*/
              color: #a39a95;
            }
          }
        }
        &>.fa-play-circle-o{
          display: flex;
          align-items: center;
          font-size: 50px;/*px*/
          color: #766c62;
          
        }
      }
    }
  }
  .comment{
    background: rgba(0,0,0,0.6) no-repeat center 0 / auto 100%;
    padding-top: 40px;
    &>.comment-title{
      height: 84px;
      font-size: 34px;/*px*/
      line-height: 84px;
      padding-left: 29px;
      color: #fff;
    }
    &>.comment-list{
      padding-left: 20px;
      &>li{
        margin-right: 30px;
        &>.main-user{
          display: flex;
          justify-content: space-between;
          height: 70px;
          &>.user{
            display: flex;
            &>img{
              width: 65px;
              height: 65px;
              border-radius: 50% 50%;
            }
            &>.text{
              padding-left: 20px;
              &>.name{
                color: #736f6e;
                font-size: 24px;/*px*/
                line-height: 36px;
              }
              &>.time{
                color: #868080;
                font-size: 18px;/*px*/
                line-height: 28px;
              }
            } 
          }
          &>.liked{
            display: flex;
            &>.count{
              margin-right: 8px;
            }
          } 
        }
        &>.main-content{
          margin: 20px 0 30px 112px;
          color: #fff;
          border-bottom: 1px solid #5f554c;/*no*/
          font-size: 26px;/*px*/
        }
      }
    }
  }
}
</style>
