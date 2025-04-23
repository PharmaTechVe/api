import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderAndDeliveryStatusMigration1745083230388
  implements MigrationInterface
{
  name = 'UpdateOrderAndDeliveryStatusMigration1745083230388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_delivery" DROP COLUMN "delivery_status"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_delivery_delivery_status_enum" AS ENUM('payment_pending', 'payment_validated', 'to_assign', 'assigned', 'waiting_confirmation', 'picked_up', 'in_route', 'delivered')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" ADD "delivery_status" "public"."order_delivery_delivery_status_enum" NOT NULL DEFAULT 'to_assign'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('requested', 'approved', 'ready_for_pickup', 'in_progress', 'completed', 'canceled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum" USING "status"::"text"::"public"."order_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'requested'`,
    );
    await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum_old" AS ENUM('requested', 'approved', 'ready', 'completed', 'canceled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'requested'`,
    );
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" DROP COLUMN "delivery_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_delivery_delivery_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" ADD "delivery_status" character varying NOT NULL`,
    );
  }
}
