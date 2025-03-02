import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserLastOrderDateTypeMigration1740888543491
  implements MigrationInterface
{
  name = 'UpdateUserLastOrderDateTypeMigration1740888543491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_order_date"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "last_order_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_order_date"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "last_order_date" TIME WITH TIME ZONE NOT NULL`,
    );
  }
}
