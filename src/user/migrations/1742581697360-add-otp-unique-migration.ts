import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpUniqueMigration1742581697360 implements MigrationInterface {
  name = 'AddOtpUniqueMigration1742581697360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_otp_type_enum" AS ENUM('password-recovery', 'email-validation')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "type" "public"."user_otp_type_enum" NOT NULL, "user_id" uuid, CONSTRAINT "unique_otp_code_per_type" UNIQUE ("code", "type"), CONSTRAINT "REL_7c4b83e0619128a0b57da32228" UNIQUE ("user_id"), CONSTRAINT "PK_494c022ed33e6ee19a2bbb11b22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_otp" ADD CONSTRAINT "FK_7c4b83e0619128a0b57da32228c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_otp" DROP CONSTRAINT "FK_7c4b83e0619128a0b57da32228c"`,
    );
    await queryRunner.query(`DROP TABLE "user_otp"`);
    await queryRunner.query(`DROP TYPE "public"."user_otp_type_enum"`);
  }
}
