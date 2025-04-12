import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderAndOrderDetailMigration1744221099910
  implements MigrationInterface
{
  name = 'CreateOrderAndOrderDetailMigration1744221099910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_type_enum" AS ENUM('pickup', 'delivery')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('requested', 'approved', 'ready', 'completed', 'canceled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."order_type_enum" NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'requested', "total_price" integer NOT NULL, "user_id" uuid, "branch_id" uuid, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "subtotal" integer NOT NULL, "order_id" uuid, "product_presentation_id" uuid, CONSTRAINT "PK_0afbab1fa98e2fb0be8e74f6b38" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_bffc1bebf6db72c49d80df64b24" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD CONSTRAINT "FK_a6ac5c99b8c02bd4ee53d3785be" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" ADD CONSTRAINT "FK_29524418eba70c044ea73cd342f" FOREIGN KEY ("product_presentation_id") REFERENCES "product_presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail" DROP CONSTRAINT "FK_29524418eba70c044ea73cd342f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail" DROP CONSTRAINT "FK_a6ac5c99b8c02bd4ee53d3785be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_bffc1bebf6db72c49d80df64b24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_199e32a02ddc0f47cd93181d8fd"`,
    );
    await queryRunner.query(`DROP TABLE "order_detail"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."order_type_enum"`);
  }
}
