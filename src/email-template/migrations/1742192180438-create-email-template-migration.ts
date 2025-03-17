import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailTemplateMigration1742192180438
  implements MigrationInterface
{
  name = 'CreateEmailTemplateMigration1742192180438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "html" text NOT NULL, CONSTRAINT "UQ_274708db64fcce5448f2c4541c7" UNIQUE ("name"), CONSTRAINT "PK_c90815fd4ca9119f19462207710" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isValidated" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isValidated"`);
    await queryRunner.query(`DROP TABLE "email_template"`);
  }
}
