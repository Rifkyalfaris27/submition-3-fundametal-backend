exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("playlists", {
    id: {
      type: "VARCHAR(30)",
      primaryKey: true,
    },
    name: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "TEXT",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlists");
};
