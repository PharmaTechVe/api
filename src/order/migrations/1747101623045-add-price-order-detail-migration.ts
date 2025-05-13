import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceOrderDetailMigration1747101623045
  implements MigrationInterface
{
  name = 'AddPriceOrderDetailMigration1747101623045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD "price" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_detail" DROP COLUMN "price"`);
  }
}
