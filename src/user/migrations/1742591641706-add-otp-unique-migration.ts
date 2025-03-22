import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpUniqueMigration1742591641706 implements MigrationInterface {
  name = 'AddOtpUniqueMigration1742591641706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_otp_type_enum" AS ENUM('password-recovery', 'email-validation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_otp" ADD "type" "public"."user_otp_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_otp" ADD CONSTRAINT "unique_otp_code_per_type" UNIQUE ("code", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_otp" DROP CONSTRAINT "unique_otp_code_per_type"`,
    );
    await queryRunner.query(`ALTER TABLE "user_otp" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."user_otp_type_enum"`);
  }
}
