const ClientError = require("../../exeptions/ClientError");
const NotFoundError = require("../../exeptions/NotFoundError");

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportPlaylistsHandler(request, h) {
    // try {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    this._producerService.sendMessage("export:songs", JSON.stringify(message));

    await this._producerService.sendMessage(
      "export:playlist",
      JSON.stringify(message)
    );

    const response = h.response({
      status: "success",
      message: "Permintaan Anda sedang kami proses",
    });
    response.code(201);
    return response;
    // } catch (error) {
    //   if (error instanceof ClientError) {
    //     const response = h.response({
    //       status: "fail",
    //       message: error.message,
    //     });
    //     response.code(error.statusCode);
    //     return response;
    //   }
    //   // Penanganan error AuthorizationError
    //   if (error instanceof AuthorizationError) {
    //     const response = h.response({
    //       status: "fail",
    //       message: error.message,
    //     });
    //     response.code(403); // Kode status untuk forbidden
    //     return response;
    //   }
    //   const response = h.response({
    //     status: "error",
    //     message: "Maaf, terjadi kesalahan di server kami",
    //   });
    //   response.code(500);
    //   console.error(error);
    //   return response;
    // }
  }
}

module.exports = ExportsHandler;
