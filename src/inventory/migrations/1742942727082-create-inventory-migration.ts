import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryMigration1742942727082
  implements MigrationInterface
{
  name = 'CreateInventoryMigration1742942727082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "stock_quantity" integer NOT NULL, "product_presentation_id" uuid, "branch_id" uuid, CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_9773b5e3def13b670e201538d30" FOREIGN KEY ("product_presentation_id") REFERENCES "product_presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_5e4d38ade6f246f20f468a7ad4b" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_5e4d38ade6f246f20f468a7ad4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_9773b5e3def13b670e201538d30"`,
    );
    await queryRunner.query(`DROP TABLE "inventory"`);
  }
}
