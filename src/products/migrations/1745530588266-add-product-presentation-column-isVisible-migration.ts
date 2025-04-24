import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductPresentationColumnIsVisibleMigration1745530588266
  implements MigrationInterface
{
  name = 'AddProductPresentationColumnIsVisibleMigration1745530588266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "isVisible" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "isVisible"`,
    );
  }
}
