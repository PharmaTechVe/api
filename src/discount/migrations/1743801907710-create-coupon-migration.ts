import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCouponMigration1743801907710 implements MigrationInterface {
  name = 'CreateCouponMigration1743801907710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "coupon" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying(10) NOT NULL, "discount" integer NOT NULL, "min_purchase" integer NOT NULL, "max_uses" integer NOT NULL, "expiration_date" TIMESTAMP NOT NULL, CONSTRAINT "UQ_62d3c5b0ce63a82c48e86d904bc" UNIQUE ("code"), CONSTRAINT "PK_fcbe9d72b60eed35f46dc35a682" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "coupon"`);
  }
}
