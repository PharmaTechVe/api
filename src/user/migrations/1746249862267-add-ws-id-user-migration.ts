import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWsIdUserMigration1746249862267 implements MigrationInterface {
  name = 'AddWsIdUserMigration1746249862267';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "ws_id" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "ws_id"`);
  }
}
