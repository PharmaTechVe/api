import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodOrderMigration1746555455789
  implements MigrationInterface
{
  name = 'AddPaymentMethodOrderMigration1746555455789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_item" DROP CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" ADD "order_id" uuid`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_payment_method_enum" AS ENUM('card', 'mobile_payment', 'bank_transfer', 'cash')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD "payment_method" "public"."order_payment_method_enum" NOT NULL DEFAULT 'cash'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" ADD CONSTRAINT "FK_de3ea608b9f32c2184b551c554b" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" ADD CONSTRAINT "FK_7a462d104c801f5e9bb63806c1e" FOREIGN KEY ("product_presentation_id") REFERENCES "product_presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cart_item" DROP CONSTRAINT "FK_7a462d104c801f5e9bb63806c1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" DROP CONSTRAINT "FK_de3ea608b9f32c2184b551c554b"`,
    );
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "payment_method"`);
    await queryRunner.query(`DROP TYPE "public"."order_payment_method_enum"`);
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" DROP COLUMN "order_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" ADD CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e" FOREIGN KEY ("product_presentation_id") REFERENCES "product_presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
