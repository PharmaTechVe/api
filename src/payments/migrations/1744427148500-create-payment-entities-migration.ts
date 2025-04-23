import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentEntitiesMigration1744427148500
  implements MigrationInterface
{
  name = 'CreatePaymentEntitiesMigration1744427148500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_confirmation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bank" character varying NOT NULL, "reference" character varying NOT NULL, "document_id" character varying NOT NULL, "phone_number" character varying NOT NULL, CONSTRAINT "PK_99d719c23924b875e604577a242" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_information_payment_method_enum" AS ENUM('card', 'mobile_payment', 'bank_transfer', 'cash')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_information" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bank" character varying NOT NULL, "account_type" character varying NOT NULL, "account" character varying NOT NULL, "document_id" character varying NOT NULL, "phone_number" character varying NOT NULL, "payment_method" "public"."payment_information_payment_method_enum" NOT NULL, CONSTRAINT "PK_2aa2cba70e26288151efa448904" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payment_information"`);
    await queryRunner.query(
      `DROP TYPE "public"."payment_information_payment_method_enum"`,
    );
    await queryRunner.query(`DROP TABLE "payment_confirmation"`);
  }
}
