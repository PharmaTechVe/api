import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsValidatedColumnMigration1742317668976
  implements MigrationInterface
{
  name = 'AddIsValidatedColumnMigration1742317668976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_validated" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_validated"`);
  }
}
