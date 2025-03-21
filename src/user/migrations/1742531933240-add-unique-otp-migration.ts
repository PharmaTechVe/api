import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueOtpMigration1742531933240 implements MigrationInterface {
  name = 'AddUniqueOtpMigration1742531933240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."unique_otp_code_per_type"`);
    await queryRunner.query(
      `ALTER TABLE "user_otp" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "unique_otp_code_per_type" ON "user_otp" ("code", "type") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."unique_otp_code_per_type"`);
    await queryRunner.query(
      `ALTER TABLE "user_otp" ALTER COLUMN "type" SET DEFAULT 'email-validation'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "unique_otp_code_per_type" ON "user_otp" ("code", "type") `,
    );
  }
}
