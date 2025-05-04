import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUserAddresZipCodeMigration1745535047722
  implements MigrationInterface
{
  name = 'DeleteUserAddresZipCodeMigration1745535047722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP COLUMN "zip_code"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD "zip_code" character varying`,
    );
  }
}
