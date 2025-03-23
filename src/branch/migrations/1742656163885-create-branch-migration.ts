import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchMigration1742656163885 implements MigrationInterface {
  name = 'CreateBranchMigration1742656163885';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "branch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "latitude" double precision, "longitude" double precision, "city_id" uuid, CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "branch_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "branch" ADD CONSTRAINT "FK_f5ef543824472fcefeaf99d4f67" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_09210cab0384d041d5f3b337e8e" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_09210cab0384d041d5f3b337e8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch" DROP CONSTRAINT "FK_f5ef543824472fcefeaf99d4f67"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "branch_id"`);
    await queryRunner.query(`DROP TABLE "branch"`);
  }
}
