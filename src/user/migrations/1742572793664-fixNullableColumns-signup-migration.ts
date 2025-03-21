import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixNullableColumnsSignupMigration1742572793664
  implements MigrationInterface
{
  name = 'FixNullableColumnsSignupMigration1742572793664';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "phone_number" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "gender" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" ALTER COLUMN "gender" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "phone_number" SET NOT NULL`,
    );
  }
}
