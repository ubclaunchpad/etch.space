
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('table_name', function(table){
      table.string('id');
      table.string('colName');
      table.timestamps();
    })
  ])
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('table_name');
};
