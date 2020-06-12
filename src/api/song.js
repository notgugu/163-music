import require from '@/utils/require';

export function getSongUrl(oParams){
  return require.get('/song/url', {
    params: oParams.params
  });
};

export function getSongDetail(oParams){
  return require.get('/song/detail', {
    params: oParams.params
  });
};

export function getSongLyric(oParams){
  return require.get('/lyric', {
    params: oParams.params
  });
};

export function getSongComment(oParams){
  return require.get('/comment/music', {
    params: oParams.params
  });
};

export function getSongSimi(oParams){
  return require.get('/simi/song', {
    params: oParams.params
  });
};
