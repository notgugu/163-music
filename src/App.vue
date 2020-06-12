<template>
  <div id="app">
    <router-view />
    <app-player></app-player>
  </div>
</template>

<script>
import appPlayer from '@/components/app-player'

export default {
  name: 'App',
  components: {
    appPlayer
  }
}
</script>

<style lang="scss">
.newSong-list {
  li {
    padding-left: 20px;
    & > a {
      display: flex;
      justify-content: space-between;
      border-bottom: #e2e2e3 1px solid; /*no*/
    }
    .text {
      padding: 13px 0;
    }
    .name {
      font-size: 26px; /*px*/
      line-height: 48px; /*px*/
    }
    .singer {
      font-size: 24px; /*px*/
      line-height: 36px; /*px*/
      color: #888888;
    }
    .fa-play-circle-o {
      display: flex;
      align-items: center;
      font-size: 44px; /*px*/
      color: #aaaaaa;
      margin-right: 20px;
    }
  }
}
</style>
