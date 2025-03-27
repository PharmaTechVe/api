import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePromoMigration1743112559537 implements MigrationInterface {
  name = 'CreatePromoMigration1743112559537';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "discount" integer NOT NULL, "expired_at" TIMESTAMP WITH TIME ZONE NOT NULL, "product_presentation_id" uuid, CONSTRAINT "PK_49d7e83df682fb7e87187e1c843" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo" ADD CONSTRAINT "FK_327ac90e8dc8144f567ec979bbf" FOREIGN KEY ("product_presentation_id") REFERENCES "product_presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promo" DROP CONSTRAINT "FK_327ac90e8dc8144f567ec979bbf"`,
    );
    await queryRunner.query(`DROP TABLE "promo"`);
  }
}
