const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exeptions/InvariantError");
const NotFoundError = require("../../exeptions/NotFoundError");
const AuthorizationError = require("../../exeptions/AuthorizationError");

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: "SELECT p.id, p.name, u.username FROM playlists p INNER JOIN users u ON p.owner = u.id WHERE p.owner = $1",
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id, owner",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menghapus Playlist. Id tidak ditemukan");
    }
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlistSong-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlistsongs (id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(id) {
    // Query untuk mendapatkan playlist dan pemilik
    const playlistQuery = {
      text: "SELECT p.id AS playlist_id, p.name AS playlist_name, u.username FROM playlists p JOIN users u ON p.owner = u.id WHERE p.id = $1",
      values: [id],
    };

    // Query untuk mendapatkan lagu-lagu dalam playlist
    const songsQuery = {
      text: "SELECT s.id AS song_id, s.title, s.performer FROM songs s JOIN playlistsongs ps ON s.id = ps.song_id WHERE ps.playlist_id = $1",
      values: [id],
    };

    // Menjalankan query playlist
    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    // Menjalankan query lagu
    const songsResult = await this._pool.query(songsQuery);

    // Menggabungkan hasil
    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;

    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Musik gagal dihapus dari playlist");
    }
  }

  async playlistExists(id) {
    const query = {
      text: "SELECT 1 FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async verifyPlaylistOwner(id, userId) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Resource yang Anda minta tidak ditemukan");
    }

    const playlist = result.rows[0];

    if (playlist.owner !== userId) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
