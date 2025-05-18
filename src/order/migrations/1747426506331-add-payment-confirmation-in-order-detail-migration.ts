import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentConfirmationInOrderDetailMigration1747426506331
  implements MigrationInterface
{
  name = 'AddPaymentConfirmationInOrderDetailMigration1747426506331';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD "payment_confirmation_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD CONSTRAINT "FK_2cb24b410baacf4bd387b22757e" FOREIGN KEY ("payment_confirmation_id") REFERENCES "payment_confirmation"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" DROP CONSTRAINT "FK_2cb24b410baacf4bd387b22757e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" DROP COLUMN "payment_confirmation_id"`,
    );
  }
}
