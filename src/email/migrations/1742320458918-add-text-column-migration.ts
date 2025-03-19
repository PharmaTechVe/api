import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTextColumnMigration1742320458918 implements MigrationInterface {
  name = 'AddTextColumnMigration1742320458918';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_template" ADD "text" text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "email_template" DROP COLUMN "text"`);
  }
}
