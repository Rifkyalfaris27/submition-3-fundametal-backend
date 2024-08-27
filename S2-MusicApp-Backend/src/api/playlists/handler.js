const ClientError = require('../../exeptions/ClientError');

class PlaylistsHander {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(owner);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: owner } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, owner);
      await this._playlistsService.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(403);
      }
      return h
        .response({
          status: 'error',
          message: 'Terjadi kesalahan',
        })
        .code(500);
    }
  }

  async postSongFromPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._songsService.getSongById(songId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._playlistsService.addSongToPlaylist({ playlistId, songId });

    const response = h.response({
      status: 'success',
      message: 'lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongFromPlaylistHandler(request) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, userId);
    const playlist = await this._playlistsService.getSongsFromPlaylist(id);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist.playlist_id,
          name: playlist.playlist_name,
          username: playlist.username,
          songs: playlist.songs.map((song) => ({
            id: song.song_id,
            title: song.title,
            performer: song.performer,
          })),
        },
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistsService.deleteSongFromPlaylist(id, songId);

    return {
      status: 'success',
      message: 'Musik berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHander;
