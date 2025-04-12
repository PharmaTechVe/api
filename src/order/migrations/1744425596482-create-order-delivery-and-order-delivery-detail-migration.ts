import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderDeliveryAndOrderDeliveryDetailMigration1744425596482
  implements MigrationInterface
{
  name = 'CreateOrderDeliveryAndOrderDeliveryDetailMigration1744425596482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_delivery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "estimated_time" TIMESTAMP WITH TIME ZONE NOT NULL, "delivery_status" character varying NOT NULL, "order_id" uuid, "address_id" uuid, "employee_id" uuid, "branch_id" uuid, CONSTRAINT "PK_962eec87d3d029c51525f259fba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_detail_delivery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "estimated_time" TIMESTAMP WITH TIME ZONE NOT NULL, "delivery_status" character varying NOT NULL, "order_detail_id" uuid, "employee_id" uuid, "from_branch_id" uuid, CONSTRAINT "PK_b15ad81cc4a02ce5d3fe937d6cf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" ADD CONSTRAINT "FK_b6c4b4e2b369a6af48a9ddabca5" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" ADD CONSTRAINT "FK_d562b5e496bc155370de04e7d94" FOREIGN KEY ("address_id") REFERENCES "user_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" ADD CONSTRAINT "FK_a0f6950dc996689d16f2c7ae274" FOREIGN KEY ("employee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" ADD CONSTRAINT "FK_bcfb1243a988e0f340630c3aac2" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail_delivery" ADD CONSTRAINT "FK_14266e931ef542ceec62c917ff2" FOREIGN KEY ("order_detail_id") REFERENCES "order_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail_delivery" ADD CONSTRAINT "FK_bde12c7a4dce6e626aa3352ae1d" FOREIGN KEY ("employee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail_delivery" ADD CONSTRAINT "FK_716c9d055befd77f3c518f81bc8" FOREIGN KEY ("from_branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_detail_delivery" DROP CONSTRAINT "FK_716c9d055befd77f3c518f81bc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail_delivery" DROP CONSTRAINT "FK_bde12c7a4dce6e626aa3352ae1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_detail_delivery" DROP CONSTRAINT "FK_14266e931ef542ceec62c917ff2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" DROP CONSTRAINT "FK_bcfb1243a988e0f340630c3aac2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" DROP CONSTRAINT "FK_a0f6950dc996689d16f2c7ae274"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" DROP CONSTRAINT "FK_d562b5e496bc155370de04e7d94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_delivery" DROP CONSTRAINT "FK_b6c4b4e2b369a6af48a9ddabca5"`,
    );
    await queryRunner.query(`DROP TABLE "order_detail_delivery"`);
    await queryRunner.query(`DROP TABLE "order_delivery"`);
  }
}
