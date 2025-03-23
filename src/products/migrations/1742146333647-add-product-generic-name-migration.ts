import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductGenericNameMigration1742146333647
  implements MigrationInterface
{
  name = 'AddProductGenericNameMigration1742146333647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "generic_name" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "generic_name"`);
  }
}
