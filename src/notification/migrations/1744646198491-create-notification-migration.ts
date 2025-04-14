import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationMigration1744646198491
  implements MigrationInterface
{
  name = 'CreateNotificationMigration1744646198491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "order_id" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_3ea5cd8a1de9cbf90c86dd0582c" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_3ea5cd8a1de9cbf90c86dd0582c"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
  }
}
