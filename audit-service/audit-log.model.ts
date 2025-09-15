import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface AuditLogAttributes {
    id: string;
    action: string;
    entity_type: number;
    entity_id: string;
    request_id: string;
    timestamp: Date;
    created_at: Date;
    updated_at: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'created_at' | 'updated_at'> {}

@Table({ tableName: 'audit_logs', timestamps: true, underscored: true })
export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    action!: string;

    @Column({
        type: DataType.SMALLINT,
        allowNull: false,
    })
    entity_type!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    entity_id!: string;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    request_id!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    timestamp!: Date;
}