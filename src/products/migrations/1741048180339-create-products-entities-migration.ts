import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsEntitiesMigration1741048180339
  implements MigrationInterface
{
  name = 'CreateProductsEntitiesMigration1741048180339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "country" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "manufacturer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIME WITH TIME ZONE, "name" character varying NOT NULL, "description" text NOT NULL, "country_id" uuid, CONSTRAINT "PK_81fc5abca8ed2f6edc79b375eeb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "lot" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIME WITH TIME ZONE, "expiration_date" date NOT NULL, "product_id" uuid, CONSTRAINT "PK_2ba293e2165c7b93cd766c8ac9b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIME WITH TIME ZONE, "url" character varying NOT NULL, "product_id" uuid, CONSTRAINT "PK_99d98a80f57857d51b5f63c8240" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "presentation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIME WITH TIME ZONE, "name" character varying NOT NULL, "description" text NOT NULL, "quantity" integer NOT NULL, "measurement_unit" character varying NOT NULL, CONSTRAINT "PK_b3d0364e16cd51d8196a13c528d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_presentation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIME WITH TIME ZONE, "price" integer NOT NULL, "product_id" uuid, "presentation_id" uuid, CONSTRAINT "PK_1204cade3ba6e7da0b4d07e5c52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIME WITH TIME ZONE, "name" character varying NOT NULL, "generic_name" character varying NOT NULL, "description" text, "priority" integer NOT NULL, "manufacturer_id" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_category" ("product_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_c14c8e52460c8062f62e7e8f416" PRIMARY KEY ("product_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0374879a971928bc3f57eed0a5" ON "product_category" ("product_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2df1f83329c00e6eadde0493e1" ON "product_category" ("category_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" ADD CONSTRAINT "FK_399779a1484440f1d6a0447aa31" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lot" ADD CONSTRAINT "FK_e79764f0f61ae488d54f3170923" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD CONSTRAINT "FK_dbc7d9aa7ed42c9141b968a9ed3" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD CONSTRAINT "FK_03a0ef88b3ed944400f8fcaa95a" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD CONSTRAINT "FK_5fde8852614d823cf4107fe4115" FOREIGN KEY ("presentation_id") REFERENCES "presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_e694a056cfdd66f7dc01daedc2b" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "product" DROP CONSTRAINT "FK_e694a056cfdd66f7dc01daedc2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP CONSTRAINT "FK_5fde8852614d823cf4107fe4115"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP CONSTRAINT "FK_03a0ef88b3ed944400f8fcaa95a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP CONSTRAINT "FK_dbc7d9aa7ed42c9141b968a9ed3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lot" DROP CONSTRAINT "FK_e79764f0f61ae488d54f3170923"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" DROP CONSTRAINT "FK_399779a1484440f1d6a0447aa31"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2df1f83329c00e6eadde0493e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0374879a971928bc3f57eed0a5"`,
    );
    await queryRunner.query(`DROP TABLE "product_category"`);
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "product_presentation"`);
    await queryRunner.query(`DROP TABLE "presentation"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "product_image"`);
    await queryRunner.query(`DROP TABLE "lot"`);
    await queryRunner.query(`DROP TABLE "manufacturer"`);
    await queryRunner.query(`DROP TABLE "country"`);
  }
}
