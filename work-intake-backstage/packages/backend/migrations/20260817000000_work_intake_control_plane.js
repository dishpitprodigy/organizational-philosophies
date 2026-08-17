// @ts-check

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable('proposal', table => {
    table.text('id').primary();
    table.text('created_by').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
  });

  await knex.schema.createTable('proposal_revision', table => {
    table.text('proposal_id').notNullable();
    table.integer('revision').notNullable();
    table.jsonb('artifact_json').notNullable();
    table.string('artifact_sha256', 64).notNullable();
    table.integer('schema_version').notNullable();
    table.jsonb('generator_provenance').notNullable();
    table.text('changed_by').notNullable();
    table.timestamp('changed_at', { useTz: true }).notNullable();
    table.text('change_reason').notNullable();
    table.primary(['proposal_id', 'revision']);
    table.foreign('proposal_id').references('proposal.id').onDelete('RESTRICT');
  });

  await knex.schema.createTable('decision', table => {
    table.uuid('id').primary();
    table.text('proposal_id').notNullable();
    table.integer('proposal_revision').notNullable();
    table.text('disposition').notNullable();
    table.text('authority').notNullable();
    table.text('actor').notNullable();
    table.text('rationale').notNullable();
    table.timestamp('decided_at', { useTz: true }).notNullable();
    table
      .foreign(['proposal_id', 'proposal_revision'])
      .references(['proposal_id', 'revision'])
      .inTable('proposal_revision')
      .onDelete('RESTRICT');
  });

  await knex.schema.createTable('authorized_work', table => {
    table.uuid('id').primary();
    table.uuid('source_decision_id').notNullable().unique();
    table.jsonb('authorization_json').notNullable();
    table.timestamp('authorized_at', { useTz: true }).notNullable();
    table.text('lifecycle_state').notNullable();
    table
      .foreign('source_decision_id')
      .references('decision.id')
      .onDelete('RESTRICT');
  });

  await knex.schema.createTable('deliverable', table => {
    table.uuid('id').primary();
    table.uuid('authorized_work_id').notNullable();
    table.text('owner_ref').notNullable();
    table.jsonb('affected_entity_refs').notNullable();
    table.jsonb('delegated_bounds').notNullable();
    table
      .foreign('authorized_work_id')
      .references('authorized_work.id')
      .onDelete('RESTRICT');
  });

  await knex.schema.createTable('outcome_observation', table => {
    table.uuid('id').primary();
    table.uuid('authorized_work_id').notNullable();
    table.text('evidence_type').notNullable();
    table.jsonb('evidence_ref_or_value').notNullable();
    table.text('observed_by').notNullable();
    table.timestamp('observed_at', { useTz: true }).notNullable();
    table
      .foreign('authorized_work_id')
      .references('authorized_work.id')
      .onDelete('RESTRICT');
  });

  await knex.schema.createTable('closure_decision', table => {
    table.uuid('id').primary();
    table.uuid('authorized_work_id').notNullable();
    table.text('disposition').notNullable();
    table.text('actor').notNullable();
    table.text('rationale').notNullable();
    table.timestamp('decided_at', { useTz: true }).notNullable();
    table
      .foreign('authorized_work_id')
      .references('authorized_work.id')
      .onDelete('RESTRICT');
  });

  await knex.schema.createTable('publication', table => {
    table.uuid('id').primary();
    table.text('source_kind').notNullable();
    table.text('source_id').notNullable();
    table.integer('source_revision').notNullable();
    table.text('publication_profile_id').notNullable();
    table.string('source_sha256', 64).notNullable();
    table.text('state').notNullable();
    table.jsonb('receipt_json').nullable();
    table.text('last_error').nullable();
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.timestamp('completed_at', { useTz: true }).nullable();
    table.unique(
      ['source_kind', 'source_id', 'source_revision', 'publication_profile_id'],
      { indexName: 'publication_source_profile_unique' },
    );
  });

  await knex.schema.createTable('publication_result', table => {
    table.uuid('publication_id').notNullable();
    table.text('placement_id').notNullable();
    table.text('local_id').notNullable();
    table.text('adapter_id').notNullable();
    table.text('target_id').notNullable();
    table.text('external_id').notNullable();
    table.text('external_key').nullable();
    table.text('external_url').nullable();
    table.jsonb('artifact_ids').notNullable();
    table.string('published_sha256', 64).notNullable();
    table.text('action').notNullable();
    table.text('state').notNullable();
    table.primary(['publication_id', 'placement_id', 'local_id']);
    table
      .foreign('publication_id')
      .references('publication.id')
      .onDelete('CASCADE');
  });

  await knex.schema.createTable('publication_journal_entry', table => {
    table.text('profile_id').notNullable();
    table.text('placement_id').notNullable();
    table.text('adapter_id').notNullable();
    table.text('target_id').notNullable();
    table.text('proposal_id').notNullable();
    table.integer('proposal_revision').notNullable();
    table.text('local_id').notNullable();
    table.string('logical_fingerprint', 64).notNullable();
    table.string('target_fingerprint', 64).notNullable();
    table.integer('mapping_version').notNullable();
    table.text('state').notNullable();
    table.text('external_id').nullable();
    table.text('external_url').nullable();
    table.jsonb('last_observation').nullable();
    table.primary(
      [
        'profile_id',
        'placement_id',
        'adapter_id',
        'target_id',
        'proposal_id',
        'proposal_revision',
        'local_id',
      ],
      'publication_journal_entry_identity',
    );
  });

  const appendOnlyTables = [
    'proposal_revision',
    'decision',
    'authorized_work',
    'deliverable',
    'outcome_observation',
    'closure_decision',
  ];
  if (knex.client.config.client === 'pg') {
    await knex.raw(`
      CREATE FUNCTION work_intake_reject_mutation() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
      END;
      $$ LANGUAGE plpgsql
    `);
    for (const table of appendOnlyTables) {
      await knex.raw(`
        CREATE TRIGGER ${table}_append_only
        BEFORE UPDATE OR DELETE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION work_intake_reject_mutation()
      `);
    }
  } else if (knex.client.config.client === 'better-sqlite3') {
    for (const table of appendOnlyTables) {
      await knex.raw(`
        CREATE TRIGGER ${table}_reject_update
        BEFORE UPDATE ON ${table}
        BEGIN SELECT RAISE(ABORT, '${table} is append-only'); END
      `);
      await knex.raw(`
        CREATE TRIGGER ${table}_reject_delete
        BEFORE DELETE ON ${table}
        BEGIN SELECT RAISE(ABORT, '${table} is append-only'); END
      `);
    }
  }
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('publication_journal_entry');
  await knex.schema.dropTableIfExists('publication_result');
  await knex.schema.dropTableIfExists('publication');
  await knex.schema.dropTableIfExists('closure_decision');
  await knex.schema.dropTableIfExists('outcome_observation');
  await knex.schema.dropTableIfExists('deliverable');
  await knex.schema.dropTableIfExists('authorized_work');
  await knex.schema.dropTableIfExists('decision');
  await knex.schema.dropTableIfExists('proposal_revision');
  await knex.schema.dropTableIfExists('proposal');
  if (knex.client.config.client === 'pg') {
    await knex.raw('DROP FUNCTION IF EXISTS work_intake_reject_mutation()');
  }
};
