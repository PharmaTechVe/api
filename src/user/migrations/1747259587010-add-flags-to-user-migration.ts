import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlagsToUserMigration1747259587010
  implements MigrationInterface
{
  name = 'AddFlagsToUserMigration1747259587010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_mobile_customer" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_generic_password" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_generic_password"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_mobile_customer"`,
    );
  }
}
