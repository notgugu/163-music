import require from '@/utils/require'

export function getArtist(oParams){
	return require.get('/artists',{
		params: oParams.params
	})
}

export function getArtistAlbum(oParams){
	return require.get('/artists/album',{
		params: oParams.params
	})
}

/*
export function getArtistFans(oParams){
	return require.post('https://interface.music.163.com/weapi/artist/follow/count',oParams.data)
}*/