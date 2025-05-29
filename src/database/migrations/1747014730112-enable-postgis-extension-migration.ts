import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostgisExtensionMigration1747014730112
  implements MigrationInterface
{
  name = 'EnablePostgisExtensionMigration1747014730112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
  }
}
