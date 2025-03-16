import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixBaseColumnsMigration1742153044149
  implements MigrationInterface
{
  name = 'FixBaseColumnsMigration1742153044149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "manufacturer" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "lot" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "lot" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "lot" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "product" ADD "deleted_at" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "deleted_at" TIME WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "product" ADD "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "deleted_at" TIME WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_presentation" ADD "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "lot" ADD "deleted_at" TIME WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "lot" ADD "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "lot" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "lot" ADD "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" ADD "deleted_at" TIME WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" ADD "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "presentation" ADD "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD "deleted_at" TIME WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" ADD "deleted_at" TIME WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" ADD "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturer" ADD "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "deleted_at" TIME WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }
}
