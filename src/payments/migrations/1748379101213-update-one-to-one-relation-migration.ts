import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOneToOneRelationMigration1748379101213
  implements MigrationInterface
{
  name = 'UpdateOneToOneRelationMigration1748379101213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" DROP CONSTRAINT "FK_2cb24b410baacf4bd387b22757e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" DROP COLUMN "payment_confirmation_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" DROP CONSTRAINT "FK_de3ea608b9f32c2184b551c554b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" ADD CONSTRAINT "UQ_de3ea608b9f32c2184b551c554b" UNIQUE ("order_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" ADD CONSTRAINT "FK_de3ea608b9f32c2184b551c554b" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" DROP CONSTRAINT "FK_de3ea608b9f32c2184b551c554b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" DROP CONSTRAINT "UQ_de3ea608b9f32c2184b551c554b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" ADD CONSTRAINT "FK_de3ea608b9f32c2184b551c554b" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD "payment_confirmation_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD CONSTRAINT "FK_2cb24b410baacf4bd387b22757e" FOREIGN KEY ("payment_confirmation_id") REFERENCES "payment_confirmation"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
