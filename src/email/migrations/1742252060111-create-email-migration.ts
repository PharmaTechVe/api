import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailMigration1742252060111 implements MigrationInterface {
    name = 'CreateEmailMigration1742252060111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isValidated" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isValidated"`);
    }

}
