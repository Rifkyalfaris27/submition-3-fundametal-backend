const routes = require("./routes");
const AlbumsHandler = require("./handler");

module.exports = {
  name: "album",
  version: "1.0.0",
  register: async (
    server,
    { service, storageService, validator, coverAlbumValidator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      service,
      storageService,
      validator,
      coverAlbumValidator
    );
    server.route(routes(albumsHandler));
  },
};
