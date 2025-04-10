import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentEntitiesMigration1744257227635
  implements MigrationInterface
{
  name = 'CreatePaymentEntitiesMigration1744257227635';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_2df1f83329c00e6eadde0493e16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_0374879a971928bc3f57eed0a59"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_information_paymentmethod_enum" AS ENUM('card', 'mobile_payment', 'bank_transfer', 'cash')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_information" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bank" character varying NOT NULL, "account_type" character varying NOT NULL, "account" character varying NOT NULL, "document_id" character varying NOT NULL, "phone_number" character varying NOT NULL, "paymentMethod" "public"."payment_information_paymentmethod_enum" NOT NULL, CONSTRAINT "PK_2aa2cba70e26288151efa448904" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_confirmation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bank" character varying NOT NULL, "reference" character varying NOT NULL, "document_id" character varying NOT NULL, "phone_number" character varying NOT NULL, CONSTRAINT "PK_99d719c23924b875e604577a242" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "PK_0dce9bc93c2d2c399982d04bef1"`,
    );
    await queryRunner.query(`ALTER TABLE "product_category" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "PK_c14c8e52460c8062f62e7e8f416" PRIMARY KEY ("product_id", "category_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ALTER COLUMN "product_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ALTER COLUMN "category_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0374879a971928bc3f57eed0a5" ON "product_category" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2df1f83329c00e6eadde0493e1" ON "product_category" ("category_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_0374879a971928bc3f57eed0a59" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_2df1f83329c00e6eadde0493e16" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_2df1f83329c00e6eadde0493e16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "FK_0374879a971928bc3f57eed0a59"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2df1f83329c00e6eadde0493e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0374879a971928bc3f57eed0a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ALTER COLUMN "category_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ALTER COLUMN "product_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" DROP CONSTRAINT "PK_c14c8e52460c8062f62e7e8f416"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "PK_0dce9bc93c2d2c399982d04bef1" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`DROP TABLE "payment_confirmation"`);
    await queryRunner.query(`DROP TABLE "payment_information"`);
    await queryRunner.query(
      `DROP TYPE "public"."payment_information_paymentmethod_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_0374879a971928bc3f57eed0a59" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_category" ADD CONSTRAINT "FK_2df1f83329c00e6eadde0493e16" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
