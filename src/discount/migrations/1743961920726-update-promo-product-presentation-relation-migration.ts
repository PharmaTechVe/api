import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePromoProductPresentationRelationMigration1743961920726
  implements MigrationInterface
{
  name = 'UpdatePromoProductPresentationRelationMigration1743961920726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promo" DROP CONSTRAINT "FK_327ac90e8dc8144f567ec979bbf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo" RENAME COLUMN "product_presentation_id" TO "start_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "promo_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "promo" DROP COLUMN "start_at"`);
    await queryRunner.query(
      `ALTER TABLE "promo" ADD "start_at" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD CONSTRAINT "FK_fdafcba69bcb03cef19db5b1da2" FOREIGN KEY ("promo_id") REFERENCES "promo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP CONSTRAINT "FK_fdafcba69bcb03cef19db5b1da2"`,
    );
    await queryRunner.query(`ALTER TABLE "promo" DROP COLUMN "start_at"`);
    await queryRunner.query(`ALTER TABLE "promo" ADD "start_at" uuid`);
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "promo_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo" RENAME COLUMN "start_at" TO "product_presentation_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promo" ADD CONSTRAINT "FK_327ac90e8dc8144f567ec979bbf" FOREIGN KEY ("product_presentation_id") REFERENCES "product_presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
