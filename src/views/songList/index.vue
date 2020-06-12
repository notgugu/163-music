<template>
  <div class="song-list">
    <div class="header" :style="`background:url(${songListData.coverImgUrl != null  ? songListData.coverImgUrl : ''})`">
      <div class="title">
        {{songListData.name}}
      </div>
      <div class="intro" v-if="!isShowAllIntro">
        简介：{{songListData.description}}
        <i class="fa fa-angle-right" @click="isShowAllIntro = !isShowAllIntro"></i>
      </div>
      <div class="introAll" v-else>
        简介：{{songListData.description}}
        <i class="fa fa-angle-left" @click="isShowAllIntro = !isShowAllIntro"></i>
      </div>
    </div>
    <div class="song-list">
      <div class="title">歌曲列表</div>
      <div class="Allsong">
        <ul class="Allsong-list">
          <li v-for="(item,index) in songListData.tracks" :key="item.id">
            <div class="rank">
              {{index + 1}}
            </div>
            <router-link :to="'/song/'+item.id">
              <div class="content">
                <div class="text">
                  <div class="name">{{ item.name }}</div>
                  <div class="singer">{{ item.ar[0] != null ?item.ar[0].name : ''}} - {{item.al.name}}</div>
                </div>
              </div>
              <i class="fa fa-play-circle-o"></i>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="wonderful-comment">
      <div class="comment-title">精彩评论</div>
      <ul class="comment-list">
        <li v-for="(item,index) in hotCommentsData" :key="item.commentId">
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
</template>

<script>
import { parseDate } from '@/utils/date'
import { getSongList, getSongListComment } from '@/api/songList';
export default {
  created(){
    this.getSongList();
    this.getSongListComment();
  },
  data(){
    return {
      songListData:[],//歌单数据
      hotCommentsData:[],//热评
      isShowAllIntro: false,//是否显示所有简介
    };
  },
  methods: {
    parseDate,
    getSongList(){//歌单接口
      let id = this.$route.params.id;
      getSongList({
        params:{
          id
        }
      }).then(res=>{
        console.log(res.data);
        let data = res.data;
        if(data.code == 200){
          this.songListData = data.playlist;
        }
      })
    },
    getSongListComment(){//歌单评论接口
      let id = this.$route.params.id;
      getSongListComment({
        params:{
          id
        }
      }).then(res=>{
        console.log(res.data)
        let data = res.data;
        if(data.code == 200){
          this.hotCommentsData = data.hotComments;
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.song-list{
  .header{
    height: 420px;
    .title{
      padding: 81px 0 0 42px;
      font-size: 34px;/*px*/
      color: #fff;
      width: 650px;
      height: 110px;
      line-height: 55px;
    }
    .intro{
      position: relative;
      overflow:hidden;
      text-overflow:ellipsis;
      display:-webkit-box;
      -webkit-line-clamp:2;
      -webkit-box-orient:vertical;
      font-size: 26px;/*px*/
      color: #fff;
      margin-top: 36px;
      padding-left: 42px;
      width: 420px;
      height: 96px;
      line-height: 48px;
      padding-right: 300px;
      .fa-angle-right{
        position: absolute;
        font-size: 24px;/*px*/
        color: #fff;
        right: 50px;
        top: 40px;
      }
    }
    .introAll{
      position: relative;
      font-size: 27px;/*px*/
      color: #fff;
      line-height: 38px;
      margin: 20px 0 33px 30px;
      padding-right: 30px;
      width: 650px;
      .fa-angle-left{
        position: absolute;
        font-size: 24px;/*px*/
        color: #fff;
        right: 0px;
        bottom: 40px;
      }
    }
  
  }
  .song-list{
    .title{
      height: 46px;
      background: #eeeff0;
      font-size: 24px;/*px*/
      padding-left: 20px;
      color: #666666;
      line-height: 46px;
    }
    .Allsong{
      .Allsong-list{
        li{
          display: flex;
          padding-left: 20px;
          align-items: center;
          .rank{
            font-size: 24px;/*px*/
            color: #999;
          }
          a{
            width: 670px;
            display: flex;
            justify-content: space-between;
            border-bottom: #e2e2e3 1px solid;/*no*/
            margin: 13px 0 0 22px;
          }
          .content{
            display: flex;
            align-items: center;
            .name{
              font-size: 26px;/*px*/
              line-height: 48px;/*px*/
            }
            .singer{
              font-size: 24px;/*px*/
              line-height: 36px;/*px*/
              color:#888888;
              padding-bottom: 13px;
            }
          }
         
          .fa-play-circle-o{
            display: flex;
            align-items: center;
            font-size: 44px;/*px*/
            color: #aaaaaa;
            padding-right: 20px;
          }
        }
      }
    }
  }
  .wonderful-comment{
    .comment-title{
      height: 46px;
      background: #eeeff0;
      font-size: 24px;/*px*/
      padding-left: 20px;
      color: #666666;
      line-height: 46px;
    }
    .comment-list{
      padding-left: 20px;
      li{
        margin-right: 30px;
        .main-user{
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          height: 70px;
          .user{
            display: flex;
            img{
              width: 65px;
              height: 65px;
              border-radius: 50% 50%;
            }
            .text{
              padding-left: 20px;
              .name{
                color: #736f6e;
                font-size: 24px;/*px*/
                line-height: 36px;
              }
              .time{
                color: #868080;
                font-size: 18px;/*px*/
                line-height: 28px;
              }
            } 
          }
          .liked{
            display: flex;
            .count{
              margin-right: 8px;
            }
          } 
        }
        .main-content{
          margin: 20px 0 0 112px;
          color: #333333;
          padding-bottom: 30px;
          border-bottom: 1px solid #5f554c;/*no*/
          font-size: 26px;/*px*/
        }
      }
    }
  }
}
</style>
