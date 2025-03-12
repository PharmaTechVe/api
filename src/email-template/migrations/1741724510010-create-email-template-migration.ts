import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailTemplateMigration1741724510010
  implements MigrationInterface
{
  name = 'CreateEmailTemplateMigration1741724510010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_otp" DROP COLUMN "expiresAt"`);
    await queryRunner.query(
      `ALTER TABLE "user_otp" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_otp" DROP COLUMN "expiresAt"`);
    await queryRunner.query(
      `ALTER TABLE "user_otp" ADD "expiresAt" TIMESTAMP NOT NULL`,
    );
  }
}
