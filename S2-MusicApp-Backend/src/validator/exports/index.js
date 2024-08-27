const InvariantError = require("../../exeptions/InvariantError");
const ExportPlaylistsPayloadSchema = require("./schema");

const ExportsValidator = {
  validateExportPlaylistPayload: (payload) => {
    const validateResult = ExportPlaylistsPayloadSchema.validate(payload);

    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
