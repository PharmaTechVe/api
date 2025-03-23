import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductsEntitiesMigration1741978385559
  implements MigrationInterface
{
  name = 'UpdateProductsEntitiesMigration1741978385559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lot" DROP CONSTRAINT "FK_e79764f0f61ae488d54f3170923"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lot" RENAME COLUMN "product_id" TO "product_presentation_id"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "generic_name"`);
    await queryRunner.query(
      `ALTER TABLE "lot" ADD CONSTRAINT "FK_458540a18717c7d8c3acd3b4cd6" FOREIGN KEY ("product_presentation_id") REFERENCES "product_presentation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lot" DROP CONSTRAINT "FK_458540a18717c7d8c3acd3b4cd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "generic_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "lot" RENAME COLUMN "product_presentation_id" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lot" ADD CONSTRAINT "FK_e79764f0f61ae488d54f3170923" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
