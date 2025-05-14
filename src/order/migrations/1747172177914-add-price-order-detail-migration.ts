import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceOrderDetailMigration1747172177914
  implements MigrationInterface
{
  name = 'AddPriceOrderDetailMigration1747172177914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD "price" integer DEFAULT 0 NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" DROP COLUMN "price"`);
  }
}
