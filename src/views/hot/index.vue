<template>
  <div class="hot">
    <app-nav :activeIndex="1"></app-nav>
    <div class="top-bg">
      <img :src="hotBgUrl" alt="">
      <div class="date">{{ date }}</div>
    </div>
    <div class="hotSong">
      <ul class="hotSong-list">
        <li v-for="(item,index) in hotData" :key="item.id">
          <div class="rank" :style="{ color: (index + 1) <= 3 ? '#df3436' : '#999999'}">
            {{(index + 1) < 10 ? `0${index + 1}` : index + 1}}
          </div>
          <router-link :to="'/song/'+item.id">
            <div class="content">
              <div class="text">
                <div class="name">{{ item.name }}</div>
                <div class="singer">{{ item.ar[0] != null ?item.ar[0].name : ''}} {{ item.ar[1] != null ?'/' + ' ' + item.ar[1].name : ''}} - {{item.al.name}}</div>
              </div>
            </div>
            <i class="fa fa-play-circle-o"></i>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="more" @click="hotData = hotDataAll;isShowAllSongs = true;" v-if="!isShowAllSongs">查看完整榜单 ></div>
  </div>
  
</template>

<script>
import appNav from '@/components/app-nav'
import { getHotList } from '@/api/hot'
export default {
  created(){
    this.getHotList();
    this.getDate();
  },
  data(){
    return {
      hotData:[],//存放热歌数据
      hotDataAll:[],//存放所有热歌
      hotBgUrl: '',
      date: null,//更新时间
      isShowAllSongs: false,//是否显示所有热歌
    };
  },
  methods: {
    getDate(){//获取时间
      let nowDate = new Date();
      nowDate.getTime();
      let month = nowDate.getMonth() + 1;
      month = month < 10 ? '0' + month : month;
      let day = nowDate.getDate();
      day = day < 10 ? '0'+day: day;
      this.date = `更新日期：${month}月${day}日`;
      console.log(this.date);
    },
    getHotList(){//热歌列表接口
      getHotList({
        params:{
          idx: '1'
        }
      }).then(res=>{
        console.log(res.data);
        let data = res.data;
        if(data.code == 200 && data.playlist && data.playlist.tracks.length > 0){
          this.hotDataAll = data.playlist.tracks;
          this.hotData = this.hotDataAll.filter((item,index) => index <= 19);
          console.log(this.hotData);
          this.hotBgUrl = data.playlist.coverImgUrl;
        };
      })
    },
  },
  components: {
    appNav,
  }
}
</script>

<style lang="scss" scoped>
.hot{
  .top-bg{
    position: relative;
    img{
      height: 290px;
    }
    .date{
      position: absolute;
      left: 10%;
      top: 70%;
      font-size: 22px;/*px*/
      color: #ecddd9;
    }
  }
  .hotSong{
    .hotSong-list{
      li{
        padding-left: 20px;
        display: flex;
        align-items: center;
        .rank{
          font-size: 24px;/*px*/
        }
        &>a{
          display: flex;
          justify-content: space-between;
          border-bottom: #e2e2e3 1px solid;/*no*/
          margin: 13px 0 0 22px;
          width: 670px;
        }
        .content{
          display: flex;
          align-items: center;
          .name{
            font-size: 26px;/*px*/
            line-height: 48px;
          }
          .singer{
            font-size: 24px;/*px*/
            line-height: 36px;
            color:#888888;
            padding-bottom: 13px;
          }
        }
       
        .fa-play-circle-o{
          display: flex;
          align-items: center;
          font-size: 44px;/*px*/
          color: #aaaaaa;
          margin-right: 20px;
        }
      }
    }
  }
  .more{
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999999;
    font-size: 26px;/*px*/
  }
}

</style>
