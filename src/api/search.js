import require from '@/utils/require';

export function getSearch(oParams){
  return require.get('/search', {
    params: oParams.params
  });
};
export function getSearchHot(oParams){
  return require.get('/search/hot', {
    params: oParams.params
  });
};

