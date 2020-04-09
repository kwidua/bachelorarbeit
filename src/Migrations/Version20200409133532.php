<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200409133532 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'sqlite', 'Migration can only be executed safely on \'sqlite\'.');

        $this->addSql('DROP INDEX IDX_B6BD307F72F5A1AA');
        $this->addSql('CREATE TEMPORARY TABLE __temp__message AS SELECT id, channel_id, user, message, timestamp FROM message');
        $this->addSql('DROP TABLE message');
        $this->addSql('CREATE TABLE message (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, channel_id INTEGER NOT NULL, user VARCHAR(255) NOT NULL COLLATE BINARY, message VARCHAR(255) NOT NULL COLLATE BINARY, timestamp DATE NOT NULL, CONSTRAINT FK_B6BD307F72F5A1AA FOREIGN KEY (channel_id) REFERENCES channel (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO message (id, channel_id, user, message, timestamp) SELECT id, channel_id, user, message, timestamp FROM __temp__message');
        $this->addSql('DROP TABLE __temp__message');
        $this->addSql('CREATE INDEX IDX_B6BD307F72F5A1AA ON message (channel_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'sqlite', 'Migration can only be executed safely on \'sqlite\'.');

        $this->addSql('DROP INDEX IDX_B6BD307F72F5A1AA');
        $this->addSql('CREATE TEMPORARY TABLE __temp__message AS SELECT id, channel_id, user, timestamp, message FROM message');
        $this->addSql('DROP TABLE message');
        $this->addSql('CREATE TABLE message (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, channel_id INTEGER NOT NULL, user VARCHAR(255) NOT NULL, timestamp DATE NOT NULL, message VARCHAR(255) NOT NULL)');
        $this->addSql('INSERT INTO message (id, channel_id, user, timestamp, message) SELECT id, channel_id, user, timestamp, message FROM __temp__message');
        $this->addSql('DROP TABLE __temp__message');
        $this->addSql('CREATE INDEX IDX_B6BD307F72F5A1AA ON message (channel_id)');
    }
}
