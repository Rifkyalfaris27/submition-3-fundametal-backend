const routes = (handler) => [
  {
    method: "POST",
    path: "/export/playlists/{playlistId}",
    handler: (request, h) => handler.postExportPlaylistsHandler(request, h),
    options: {
      auth: "musicapp_jwt",
    },
  },
];

module.exports = routes;
