import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductPresentationColumnIsVisibleMigration1745533792735
  implements MigrationInterface
{
  name = 'AddProductPresentationColumnIsVisibleMigration1745533792735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "is_visible" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "is_visible"`,
    );
  }
}
