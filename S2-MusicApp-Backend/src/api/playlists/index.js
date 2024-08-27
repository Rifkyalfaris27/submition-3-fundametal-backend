const routes = require('./routes');
const PlaylistsHander = require('./handler');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { playlistsService, songsService, validator }) => {
    const playlistsHandler = new PlaylistsHander(
      playlistsService,
      songsService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
