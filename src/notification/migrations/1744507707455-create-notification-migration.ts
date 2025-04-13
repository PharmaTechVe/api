import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationMigration1744507707455
  implements MigrationInterface
{
  name = 'CreateNotificationMigration1744507707455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "message" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "order_id" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_3ea5cd8a1de9cbf90c86dd0582c" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_3ea5cd8a1de9cbf90c86dd0582c"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
  }
}
