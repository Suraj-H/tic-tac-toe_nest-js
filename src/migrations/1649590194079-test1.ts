import {MigrationInterface, QueryRunner} from "typeorm";

export class test11649590194079 implements MigrationInterface {
    name = 'test11649590194079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying(100) NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "move" ("id" SERIAL NOT NULL, "position" integer NOT NULL, "created" TIMESTAMP, "userId" integer, "gameId" integer, CONSTRAINT "PK_0befa9c6b3a216e49c494b4acc5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."game_gamestatus_enum" AS ENUM('IN_PROGRESS', 'DRAW', 'USER_ONE_WINS', 'USER_TWO_WINS', 'ABORTED', 'WAITS_FOR_USER')`);
        await queryRunner.query(`CREATE TYPE "public"."game_gametype_enum" AS ENUM('COMPUTER', 'COMPETITION')`);
        await queryRunner.query(`CREATE TYPE "public"."game_useronepiececode_enum" AS ENUM('O', 'X')`);
        await queryRunner.query(`CREATE TABLE "game" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "endedAt" TIMESTAMP NOT NULL DEFAULT now(), "gameStatus" "public"."game_gamestatus_enum" NOT NULL DEFAULT 'IN_PROGRESS', "gameType" "public"."game_gametype_enum", "userOnePieceCode" "public"."game_useronepiececode_enum" NOT NULL DEFAULT 'O', "userOneId" integer, "userTwoId" integer, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "move" ADD CONSTRAINT "FK_ed05ae5ce30c95fbe635d6785aa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "move" ADD CONSTRAINT "FK_e7d286bcab2828876ab2eef3515" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_7251dee8585b351db9952e1697b" FOREIGN KEY ("userOneId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_297207bffccddd34a38ab3fddf8" FOREIGN KEY ("userTwoId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_297207bffccddd34a38ab3fddf8"`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_7251dee8585b351db9952e1697b"`);
        await queryRunner.query(`ALTER TABLE "move" DROP CONSTRAINT "FK_e7d286bcab2828876ab2eef3515"`);
        await queryRunner.query(`ALTER TABLE "move" DROP CONSTRAINT "FK_ed05ae5ce30c95fbe635d6785aa"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TYPE "public"."game_useronepiececode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."game_gametype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."game_gamestatus_enum"`);
        await queryRunner.query(`DROP TABLE "move"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
