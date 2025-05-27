import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromoDiscountToOrderDetailMigration1748382133862
  implements MigrationInterface
{
  name = 'AddPromoDiscountToOrderDetailMigration1748382133862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD "discount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" DROP COLUMN "discount"`,
    );
  }
}
