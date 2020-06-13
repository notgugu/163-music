<template>
  <div class="s">
    <app-nav :activeIndex="2"></app-nav>
    <div class="box"></div>
    <div class="search">
      <i class="fa fa-search"></i>
      <input class="searchBox" type="search" v-model="value" placeholder="搜索歌曲、歌手、专辑">
      <i class="delete" v-show="value!=''" @click="value=''">x</i>
    </div>
    <div class="hot" v-if="value == ''">
      <div class="title">热门搜索</div>
      <ul class="hot-tags">
        <li v-for="item in searchHotTags" :key="item.id" @click="value = item.first;">{{item.first}}</li>
      </ul>
    </div>
    <div class="result" v-else>
      <div class="title">最佳匹配</div>
      <mt-loadmore :top-method="loadTop" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore">
        <div class="artist" @click="$router.push(`/artist/${searchArtistData.id}`)">
          <div class="content">
            <img :src="searchArtistData.picUrl != ''? searchArtistData.picUrl : ''" alt="">
            <div class="text">歌手:<span v-html="searchArtistData.name"></span></div>
          </div>
          <i class="fa fa-angle-right"></i>
        </div>
        <div class="album">
          <div class="content" @click="$router.push(`/album/${searchAlbumData.id}`)">
            <img :src="searchAlbumData.picUrl != ''? searchAlbumData.picUrl : ''" alt="">
            <div class="text">
              <div class="album-name">专辑：<span v-html="searchAlbumData.name"></span></div>
              <div class="album-artist" v-html="searchAlbumData.artist.name"></div>
            </div>
          </div>
          <i class="fa fa-angle-right"></i>
        </div>
        <div class="songs">
          <ul class="searchSongs-list">
            <li v-for="(item,index) in songsData" :key="item.index">
              <router-link :to="'/song/'+item.id">
                <div class="text">
                  <div class="name" v-html="item.name"></div>
                  <div class="singer"><span v-html="item.artists[0].name"></span> - <span v-html="item.album.name"></span></div>
                </div>
                <i class="fa fa-play-circle-o"></i>
              </router-link>
            </li>
          </ul>
        </div>
      </mt-loadmore>
    </div>
  </div>
</template>

<script>
import appNav from '@/components/app-nav'
import { getSearch, getSearchHot } from '@/api/search'

export default {
  created(){
    this.getSearchHot();
  },
  data(){
    return {
      value: '',//搜索关键字
      searchHotTags: [],//热搜tag
      searchAlbumData: { artist:{}},//最佳匹配的专辑
      searchSongsData: [],//搜索歌曲数据
      searchArtistData: {},//搜索歌手数据
      songsData: [],//当前歌曲数据(关键字变色后)
      oldSongsData: [],//未刷新变化前的歌词
      pageNum: 0,//当前页数
      total: 0,//歌曲总数
      count: 0,//记录请求次数，为3的整数倍即进行一次完整请求(歌曲，专辑，歌手)后进行关键字变色处理
      allLoaded: false,//所有歌曲是否请求完毕
      isFirstReq: true,//是否是第一次请求
      index: 0,//当前数组关键字变色位置
    };
  },
  methods: {
    colorChange(valueArr,arrObj,changeArr){//封装了颜色变换函数，减少了getKeyword函数中代码的复用，减少了代码的冗余
      for(let i of arrObj){
        let num = 0;
        for(let j of valueArr){
          if(i == j){
            changeArr.name += `<span style="color: #507daf;">${i}</span>`;
            break;
          }
          else{
            num++;
            if(num == valueArr.length){
              changeArr.name += `<span>${i}</span>`;
              break;
            }
          }
        }
      }
    },
    getKeyword(){//关键字变色
      let valueArr = this.value.split('');
      valueArr = valueArr.filter((item)=> item != ' ');
      let albumArr = this.searchAlbumData.name.split('');
      let albumArtistArr =  this.searchAlbumData.artist.name.split('');
      let artistArr = this.searchArtistData.name.split('');
      this.searchAlbumData.name = '';
      this.searchAlbumData.artist.name = '';
      this.searchArtistData.name = '';
      let num = 0;
      /*for(let i of albumArr){//对专辑进行处理
        num = 0;
        for(let j of valueArr){
          if(i == j){
            this.searchAlbumData.name += `<span style="color: #507daf;">${i}</span>`;
            break;
          }
          else{
            num++;
            if(num == valueArr.length){
              this.searchAlbumData.name += `<span>${i}</span>`;
              break;
            }
          }
        }
      }*/
      this.colorChange(valueArr,albumArr,this.searchAlbumData);
      /*for(let i of albumArtistArr){//对专辑作者进行处理
        num = 0;
        for(let j of valueArr){
          if(i == j){
            this.searchAlbumData.artist.name += `<span style="color: #507daf;">${i}</span>`;
            break;
          }
          else{
            num++;
            if(num == valueArr.length){
              this.searchAlbumData.artist.name += `<span>${i}</span>`;
              break;
            }
          }
        }
      }*/
      this.colorChange(valueArr,albumArtistArr,this.searchAlbumData.artist);
      /*for(let i of artistArr){//对歌手进行处理
        num = 0;
        for(let j of valueArr){
          if(i == j){
            this.searchArtistData.name += `<span style="color: #507daf;">${i}</span>`;
            break;
          }
          else{
            num++;
            if(num == valueArr.length){
              this.searchArtistData.name += `<span>${i}</span>`;
              break;
            }
          }
        }
      }*/
      this.colorChange(valueArr,artistArr,this.searchArtistData);
      if(this.oldSongsData == this.searchSongsData && this.isFirstReq == false){//如果是上拉刷新并且数据没有更新时跳出
        return;
      };
      for(let song of this.searchSongsData){//对歌曲进行处理
        let songName = song.name.split('');
        this.songsData = this.songsData.concat(song);
        this.songsData[this.index].name = '';
        /*for(let i of songName){
          num = 0;
          for(let j of valueArr){
            if(i == j){
              this.songsData[this.index].name += `<span style="color: #507daf;">${i}</span>`;
              break;
            }
            else{
              num++;
              if(num == valueArr.length){
                this.songsData[this.index].name += `<span>${i}</span>`;
                break;
              }
            }
          }
        }*/
        this.colorChange(valueArr,songName,this.songsData[this.index]);
        let songArName = song.artists[0].name.split('');
        this.songsData[this.index].artists[0].name = '';
        /*for(let i of songArName){
          num = 0;
          for(let j of valueArr){
            if(i == j){
              this.songsData[this.index].artists[0].name += `<span style="color: #507daf;">${i}</span>`;
              break;
            }
            else{
              num++;
              if(num == valueArr.length){
                this.songsData[this.index].artists[0].name += `<span>${i}</span>`;
                break;
              }
            }
          }
        }*/
        this.colorChange(valueArr,songArName,this.songsData[this.index].artists[0]);
        let songAlName = song.album.name.split('');
        this.songsData[this.index].album.name = '';
        /*for(let i of songAlName){
          num = 0;
          for(let j of valueArr){
            if(i == j){
              this.songsData[this.index].album.name += `<span style="color: #507daf;">${i}</span>`;
              break;
            }
            else{
              num++;
              if(num == valueArr.length){
                this.songsData[this.index].album.name += `<span>${i}</span>`;
                break;
              }
            }
          }
        }*/
        this.colorChange(valueArr,songAlName,this.songsData[this.index].album);
        this.index++;
      }
    },
    getSearch(keywords,type = 1,offset = 0){//搜索接口
      getSearch({
        params:{
          keywords,
          type,
          offset
        }
      }).then(res=>{
        let data = res.data;
        this.count++;
        if(data.code == 200){
          if(type == 1 && data.result.songs && data.result.songs.length > 0){//获取歌曲
            this.searchSongsData = data.result.songs;
            console.log(data.result.songs)
            this.total = data.result.songCount;
          }
          else if(type == 10 && data.result.albums && data.result.albums.length > 0){//获取专辑
            this.searchAlbumData = data.result.albums[0];
          }
          else if(type == 100 && data.result.artists && data.result.artists.length > 0){//获取歌手
            this.searchArtistData = data.result.artists[0];
          }
          if(this.isFirstReq){
            if(type == 1){
              this.oldSongsData = data.result.songs;
            }
          }
          if(this.count % 3 == 0){
            this.getKeyword();
            this.isFirstReq = false;
          };
          
          
        };
      }).catch(err=>{
        console.log(err);
      })
    },
    getSearchHot(){//热搜tags接口
      getSearchHot({}).then(res=>{
        let data = res.data;
        if(data.code == 200){
          this.searchHotTags = data.result.hots;
        }
      })
    },
    loadTop(){//上拉刷新
      this.songsData = [];
      this.index = 0;
      this.getSearch(this.value,1);
      this.getSearch(this.value,10);
      this.getSearch(this.value,100);
      this.$refs.loadmore.onTopLoaded();
    },
    loadBottom() {//下拉获取更多
      this.pageNum++;
      this.getSearch(this.value,1,this.pageNum * 30);
      if(this.total < this.pageNum * 30){
        this.allLoaded = true;// 若数据已全部获取完毕
      }
      this.$refs.loadmore.onBottomLoaded();
    },
  },
  watch:{
    value(newval){//监听搜索内容的变化
      if(newval == '') return;
      this.index = 0;
      this.songsData = [];
      this.getSearch(newval,1);
      this.getSearch(newval,10);
      this.getSearch(newval,100);
    },
  },
  components: {//注册组件
    appNav,
  }
}
</script>

<style lang="scss" scoped>
.s{
  .box{
    height: 120px;
  }
  .search{
    width: 100%;
    background: #fff;
    position: fixed;
    left: 0;
    top: 81px;
    box-sizing: border-box;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #e2e2e3;/*no*/
    input[type=search]::-webkit-search-cancel-button{
      -webkit-appearance: none;
    }
    .searchBox{
      height: 60px;
      width: 710px;
      border-radius: 30px;
      border: 0;
      background: #ebecec;
      padding: 14px 0 14px 60px;
      outline: none; 
      font-size: 28px;/*px*/
      color: #c9c9c9;
    }
    .fa-search{
      position: absolute;
      left: 36px;
      font-size: 25px;/*px*/
      color: #c9c9c9;
    }
    .delete{
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      right: 36px;
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background: #bcbdbd;
      font-size: 14px;/*px*/
      font-weight: bold;
    }
  }
  .hot{
    padding: 28px 0 0 20px;
    .title{
      font-size: 24px;/*px*/
    }
    .hot-tags{
      display: flex;
      flex-flow: wrap;
      li{
        width: auto;
        height: 60px;
        margin-top: 18px;
        margin-right: 16px;
        text-align: center;
        line-height: 60px;
        padding: 0 28px;
        border: 1px solid #e0e1e6;/*no*/
        border-radius: 30px
      }
    }
  }
  .result{
    height: 100%;
    margin: 20px 0 0 20px;
    .title{
      color: #666666;
      font-size: 24px;/*px*/
    }
    .artist{
      display: flex;
      margin-top: 6px;
      justify-content: space-between;
      border-bottom: 1px solid #e2e2e3;/*no*/
      align-items: center;
      height: 130px;
      .content{
        display: flex;
        align-items: center;
        padding: 15px 0;
        img{
          width: 100px;
          height: 100px;
        }
        .text{
          line-height: 90px;
          height: 90px;
          padding-left: 30px;
          font-size: 32px;/*px*/
          color: #333333;
        }
      }
      .fa-angle-right{
        font-size: 26px;/*px*/
        margin-right: 36px;
      }
    }
    .album{
      height: 132px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .content{
        display: flex;
        align-items: center;
        padding: 15px 0;
        img{
          width: 100px;
          height: 100px;
        }
        .text{
          padding-left: 30px;
          font-size: 32px;/*px*/
          color: #333333;
          .album-artist{
            font-size: 22px;/*px*/
            color: #999999;
          }
        }
      }
      .fa-angle-right{
        font-size: 26px;/*px*/
        margin-right: 36px;
      }
    }
    .songs{
      .searchSongs-list{
        li{
          padding-left: 20px;
          &>a{
            display: flex;
            justify-content: space-between;
            border-bottom: #e2e2e3 1px solid;/*no*/
          }
          .text{
            padding: 13px 0;
          }
          .name{
            font-size: 26px;/*px*/
            line-height: 48px;/*px*/
          }
          .singer{
            font-size: 24px;/*px*/
            line-height: 36px;/*px*/
            color:#888888;
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
  }
}


</style>
