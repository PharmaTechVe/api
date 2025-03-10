import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailTemplateMigration1741576617744
  implements MigrationInterface
{
  name = 'CreateEmailTemplateMigration1741576617744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_otp" ("id" SERIAL NOT NULL, "code" character varying(6) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "REL_bd81461d078fe46743dd535fb2" UNIQUE ("userId"), CONSTRAINT "PK_494c022ed33e6ee19a2bbb11b22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_template" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "html" text NOT NULL, CONSTRAINT "UQ_274708db64fcce5448f2c4541c7" UNIQUE ("name"), CONSTRAINT "PK_c90815fd4ca9119f19462207710" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isValidated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_otp" ADD CONSTRAINT "FK_bd81461d078fe46743dd535fb27" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_otp" DROP CONSTRAINT "FK_bd81461d078fe46743dd535fb27"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isValidated"`);
    await queryRunner.query(`DROP TABLE "email_template"`);
    await queryRunner.query(`DROP TABLE "user_otp"`);
  }
}
