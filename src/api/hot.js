import require from '@/utils/require';

export function getHotList(oParams){
  return require.get('/top/list', {
    params: oParams.params
  });
};

