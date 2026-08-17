// @ts-check

const { randomUUID } = require('node:crypto');

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.alterTable('publication', table => {
    table.uuid('active_attempt_id').nullable();
    table.timestamp('lease_expires_at', { useTz: true }).nullable();
  });
  await knex.schema.alterTable('publication_journal_entry', table => {
    table.text('external_key').nullable();
  });

  const rows = await knex('publication').select('id');
  for (const row of rows) {
    await knex('publication')
      .where({ id: row.id })
      .update({
        active_attempt_id: randomUUID(),
        lease_expires_at: new Date(0),
      });
  }
  await knex.schema.alterTable('publication', table => {
    table.uuid('active_attempt_id').notNullable().alter();
    table.timestamp('lease_expires_at', { useTz: true }).notNullable().alter();
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.alterTable('publication_journal_entry', table => {
    table.dropColumn('external_key');
  });
  await knex.schema.alterTable('publication', table => {
    table.dropColumn('lease_expires_at');
    table.dropColumn('active_attempt_id');
  });
};
